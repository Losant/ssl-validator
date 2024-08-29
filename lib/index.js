const validators = require('./validators');

const buildBoolFunc = (func) => {
  return async (...args) => {
    try {
      await func(...args);
      return true;
    } catch (e) {
      return false;
    }
  };
};

module.exports.validateSSL = validators.validateSSL;
module.exports.isValidSSL = buildBoolFunc(validators.validateSSL);
module.exports.validateSSLCert = validators.validateSSLCert;
module.exports.isValidSSLCert = buildBoolFunc(validators.validateSSLCert);
module.exports.validateSSLKey = validators.validateSSLKey;
module.exports.isValidSSLKey = buildBoolFunc(validators.validateSSLKey);
module.exports.validateCertBundle = validators.validateCertBundle;
module.exports.isValidCertBundle = buildBoolFunc(validators.validateCertBundle);
module.exports.validateCertKeyPair = validators.validateCertKeyPair;
module.exports.isValidCertKeyPair = buildBoolFunc(validators.validateCertKeyPair);
module.exports.validateCertToDomain = validators.validateCertToDomain;
module.exports.isValidCertToDomain = buildBoolFunc(validators.validateCertToDomain);
