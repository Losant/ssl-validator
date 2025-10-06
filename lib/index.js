import * as validators from './validators.js';

const buildBoolFunc = (func) => {
  return async (...args) => {
    try {
      await func(...args);
      return true;
    } catch {
      return false;
    }
  };
};

export const validateSSL = validators.validateSSL;
export const isValidSSL = buildBoolFunc(validators.validateSSL);
export const validateSSLCert = validators.validateSSLCert;
export const isValidSSLCert = buildBoolFunc(validators.validateSSLCert);
export const validateSSLKey = validators.validateSSLKey;
export const isValidSSLKey = buildBoolFunc(validators.validateSSLKey);
export const validateCertBundle = validators.validateCertBundle;
export const isValidCertBundle = buildBoolFunc(validators.validateCertBundle);
export const validateCertKeyPair = validators.validateCertKeyPair;
export const isValidCertKeyPair = buildBoolFunc(validators.validateCertKeyPair);
export const validateCertToDomain = validators.validateCertToDomain;
export const isValidCertToDomain = buildBoolFunc(validators.validateCertToDomain);
