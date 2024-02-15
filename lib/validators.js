const { find, trim, isNil, mergeRight } = require('ramda');
const {
  readCertificateInfo,
  getPublicKey,
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
  const validateCert = options.validCertFormat || isCertValidFormat;
  if (!validateCert(cert)) {
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

const validateSSLKey = async (key, options) => {
  if (isNil(options)) { options = {}; }
  const isValidKeyFormat = options.validKeyFormat || isKeyValidFormat;
  key = trim(String(key));
  if (!isValidKeyFormat(key)) {
    throw new Error('Key must start and end with proper formatting.');
  }
  return getPublicKey(key, options.password);
};

// options => domain, bundle, skipDateValidation, password
const validateSSL = async (cert, options) => {
  if (isNil(options)) { options = {}; }
  cert = String(cert);
  const certInfo = await validateSSLCert(cert, options);
  const result = { certInfo };
  if (!isNil(options.key)) {
    const key = options.key;
    const certPublicKey = await getPublicKey(cert);
    const keyPublicKey = await validateSSLKey(key, options);
    if (certPublicKey !== keyPublicKey) {
      throw Error('The provided certificate and key do not match.');
    }
    result.publicKey = certPublicKey;
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
