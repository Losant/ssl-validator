const { find, toLower, trim, pipe } = require('ramda');
const trimLower = pipe(trim, toLower);
const pem = require('pem');
const { promisify } = require('util');
const readCertificateInfo = promisify(pem.readCertificateInfo);
const getModulus = promisify(pem.getModulus);
const verifySigningChain = promisify(pem.verifySigningChain);
const { isSslKey, tryParseJson, isDomainMatch } = require('./utils');

const {
  CERT_START,
  CERT_END
} = require('./constants');

const validateCert = (cert) => {
  cert = String(cert).trim();
  if (!cert.startsWith(CERT_START) || !cert.endsWith(CERT_END)) {
    throw new Error('Certificate must start and end with proper formating.');
  }
  return readCertificateInfo(cert);
};

const validateKey = (key) => {
  key = String(key).trim();
  if (isSslKey(key)) {
    throw new Error('Key must start and end with proper formating.');
  }
  return getModulus(key);
};

const validateCertKeyPair = async (cert, key) => {
  await validateCert(cert);
  const certMod = await getModulus(cert);
  const keyMod = await validateKey(key);
  if (certMod.modulus !== keyMod.modulus) {
    throw Error('The provided cert and key do not match.');
  }
  return certMod;
};

const validateCertToDomain = async (cert, domain) => {
  const info = await validateCert(cert);
  domain = trimLower(domain);
  let domainsOfCert = [ trimLower(info.commonName) ];
  if (info.san && info.san.dns && Array.isArray(info.san.dns)) {
    info.san.dns.forEach((altName) => {
      possibleValidNames.push(trimLower(altName));
    });
  }
  const found = find(isDomainMatch(domain))(domainsOfCert);
  if (!found) {
    throw Error('The cert does not match the domain.');
  }
  return found;
};

const validateCertBundle = async (certBundle, cert) => {
  await validateCert(certBundle);
  await validateCert(cert);
  let result = await verifySigningChain(certBundle, cert);
  // can result false with out throwing an error  
  if (!result) {
    throw Error('Bundle does not match the certificate.');
  }
  return result;
};

module.exports = {
  validateCert,
  validateKey,
  validateCertBundle,
  validateCertKeyPair,
  validateCertToDomain
};
