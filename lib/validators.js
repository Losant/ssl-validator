const { find, toLower, trim, pipe, isNil } = require('ramda');
const trimLower = pipe(trim, toLower);
const pem = require('pem');
const { promisify } = require('util');
const readCertificateInfo = promisify(pem.readCertificateInfo);
const getModulus = promisify(pem.getModulus);
const verifySigningChain = promisify(pem.verifySigningChain);
const { isKeyValidFormat, isCertValidFormat, isDomainMatch, isValidDate } = require('./utils');

const validateCert = async (cert, options = {}) => {
  cert = trim(String(cert));
  if (!isCertValidFormat(cert)) {
    throw new Error('Certificate must start and end with proper formating.');
  }
  const info = await readCertificateInfo(cert);
  isValidDate(info, options.skipDateValidation || false);
  return info;
};

const validateCertInfoToDomain = (info, domain) => {
  domain = trimLower(String(domain));
  const domainsOfCert = [ trimLower(info.commonName) ];
  // get the Subject Alt Name known as SAN
  // some certificates can have multi-domain ssl certs using the SAN extension
  if (info.san && info.san.dns && Array.isArray(info.san.dns)) {
    info.san.dns.forEach((altName) => {
      domainsOfCert.push(trimLower(altName));
    });
  }
  const found = find(isDomainMatch(domain))(domainsOfCert);
  if (!found) {
    throw Error('The cert does not match the domain.');
  }
  return found;
};

const validateKey = (key) => {
  key = trim(String(key));
  if (!isKeyValidFormat(key)) {
    throw new Error('Key must start and end with proper formating.');
  }
  return getModulus(key);
};

// options => domain, bundle skipCertValdiation,
const validateSSLCerts = async (cert, key, options) => {
  if (key && typeof key !== 'string') {
    options = key;
    key = null;
  }
  if (!options) { options = {}; }
  cert = String(cert);
  const certInfo = await validateCert(cert, options);
  const result = { certInfo };
  if (!isNil(key)) {
    const certMod = await getModulus(cert);
    const keyMod = await validateKey(key);
    if (certMod.modulus !== keyMod.modulus) {
      throw Error('The provided cert and key do not match.');
    }
    result.keyMod = keyMod;
  }

  if (options.domain) {
    validateCertInfoToDomain(certInfo, trimLower(String(options.domain)));
  }

  if (options.bundle) {
    const certBundle = String(options.bundle);
    const bundleInfo = await validateCert(certBundle, options);
    isValidDate(bundleInfo, options.skipDateValidation || false);
    result.bundleInfo = bundleInfo;
    const res = await verifySigningChain(certBundle, cert);
    if (!res) {
      throw Error('Bundle does not match the certificate.');
    }
  }
  return result;
};

const validateCertKeyPair = (cert, key) => {
  return validateSSLCerts(cert, key);
};

const validateCertToDomain = (cert, domain, options = {}) => {
  options.domain = String(domain);
  return validateSSLCerts(cert, options);
};

const validateCertBundle = (certBundle, cert, options = {}) => {
  options.bundle = String(certBundle);
  return validateSSLCerts(cert, options);
};

module.exports = {
  validateSSLCerts,
  validateCert,
  validateKey,
  validateCertBundle,
  validateCertKeyPair,
  validateCertToDomain
};
