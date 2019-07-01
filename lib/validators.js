const { find, trim, isNil, mergeRight } = require('ramda');
const {
  readCertificateInfo,
  getModulus,
  verifySigningChain
} = require('./pem');
const {
  isKeyValidFormat,
  isCertValidFormat,
  isDomainMatch,
  isValidDate,
  trimLower
} = require('./utils');

const validateSSLCert = async (cert, options = {}) => {
  cert = trim(String(cert));
  if (!isCertValidFormat(cert)) {
    throw new Error('Certificate must start and end with proper formatting.');
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
    throw Error('The certificate does not match the domain.');
  }
  return found;
};

const validateSSLKey = (key) => {
  key = trim(String(key));
  if (!isKeyValidFormat(key)) {
    throw new Error('Key must start and end with proper formatting.');
  }
  return getModulus(key);
};

// options => domain, bundle, skipDateValidation,
const validateSSL = async (cert, options) => {
  if (isNil(options)) { options = {}; }
  cert = String(cert);
  const certInfo = await validateSSLCert(cert, options);
  const result = { certInfo };
  if (!isNil(options.key)) {
    const key = options.key;
    const certMod = await getModulus(cert);
    const keyMod = await validateSSLKey(key);
    if (certMod.modulus !== keyMod.modulus) {
      throw Error('The provided certificate and key do not match.');
    }
    result.keyMod = keyMod;
  }

  if (!isNil(options.domain)) {
    validateCertInfoToDomain(certInfo, trimLower(String(options.domain)));
  }

  if (!isNil(options.bundle)) {
    const certBundle = String(options.bundle);
    const bundleInfo = await validateSSLCert(certBundle, options);
    isValidDate(bundleInfo, options.skipDateValidation || false);
    result.bundleInfo = bundleInfo;
    const res = await verifySigningChain(cert, certBundle);
    if (!res) {
      throw Error('Bundle does not match the certificate.');
    }
  }
  return result;
};

const validateCertKeyPair = (cert, key, options = {}) => {
  const opts = mergeRight(options, { key: String(key) });
  return validateSSL(cert, opts);
};

const validateCertToDomain = (cert, domain, options = {}) => {
  const opts = mergeRight(options, { domain: String(domain) });
  return validateSSL(cert, opts);
};

const validateCertBundle = (cert, certBundle, options = {}) => {
  const opts = mergeRight(options, { bundle: String(certBundle) });
  return validateSSL(cert, opts);
};

module.exports = {
  validateSSL,
  validateSSLCert,
  validateSSLKey,
  validateCertBundle,
  validateCertKeyPair,
  validateCertToDomain
};
