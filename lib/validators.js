const { find, toLower, trim, pipe } = require('ramda');
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

const validateCertInfo = (info, options = {}) => {
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

const validateCertKeyPair = async (cert, key, options = {}) => {
  cert = String(cert);
  key = String(key);
  const result = {};
  if (!options.skipCertValidation) {
    result.certInfo = await validateCert(cert, options);
  }
  const certMod = await getModulus(cert);
  const keyMod = await validateKey(key);
  if (certMod.modulus !== keyMod.modulus) {
    throw Error('The provided cert and key do not match.');
  }
  result.modulus = certMod.modulus;
  return result;
};

const validateCertToDomain = async (cert, domain, options = {}) => {
  cert = String(cert);
  domain = String(domain);
  const info = await validateCert(cert, options);
  validateCertInfoToDomain(info, domain);
  return { certInfo: info };
};

const validateCertBundle = async (certBundle, cert, options = {}) => {
  certBundle = String(certBundle);
  cert = String(cert);
  let bundleInfo, certInfo;
  if (!options.skipCertValidation) { // skip validation that certBudle and cert are certs
    bundleInfo = await validateCert(certBundle, options);
    certInfo = await validateCert(cert, options);
  }
  const result = await verifySigningChain(certBundle, cert);
  // can result false with out throwing an error
  if (!result) {
    throw Error('Bundle does not match the certificate.');
  }
  return { certInfo, bundleInfo, result };
};

module.exports = {
  validateCert,
  validateCertInfo,
  validateCertInfoToDomain,
  validateKey,
  validateCertBundle,
  validateCertKeyPair,
  validateCertToDomain
};
