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
  if (!options.skipFormatValidation) {
    if (!isCertValidFormat(cert)) {
      throw new Error('Certificate must start and end with proper formatting.');
    }
    if (cert.match(/-BEGIN/g).length > 1 || cert.match(/-END/g).length > 1) {
      throw new Error('Value must contain a single certificate.');
    }
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
  key = trim(String(key));
  if (!options.skipFormatValidation) {
    if (!isKeyValidFormat(key)) {
      throw new Error('Key must start and end with proper formatting.');
    }
    if (key.match(/-BEGIN/g).length > 1 || key.match(/-END/g).length > 1) {
      throw new Error('Value must contain a single key.');
    }
  }
  return getPublicKey(key, options.password);
};

// options => domain, bundle, skipDateValidation, password, skipFormatValidation
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
    const certBundle = trim(String(options.bundle));

    let splitBundle = certBundle.split('-----BEGIN');
    splitBundle.shift();
    splitBundle = splitBundle.map((bundleCert) => `-----BEGIN${bundleCert}`);

    try {
      result.bundleInfo = await Promise.all(splitBundle.map(async (singleBundleCert) => {
        const singleBundleInfo = await validateSSLCert(singleBundleCert, options);
        isValidDate(singleBundleInfo, options.skipDateValidation || false);
        return singleBundleInfo;
      }));
    } catch {
      throw Error('Invalid bundle provided.');
    }

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
