const should = require('should');
const {
  validCert,
  validKey,
  validBundle,
  validBundleCert,
  nonMatchingKey,
  badCert,
  badKey
} = require('./__fixtures__/valid-ssl');

const Validation = require('../lib/');

describe('Validation', () => {
  describe('#isValid functions should return false', () => {
    it('#isValidSSLCert', async () => {
      (await Validation.isValidSSLCert('')).should.be.false();
    });
    it('#isValidSSLKey', async () => {
      (await Validation.isValidSSLKey('')).should.be.false();
    });
    it('#isValidCertKeyPair', async () => {
      (await Validation.isValidCertKeyPair(validCert, '')).should.be.false();
    });
    it('#validateCertToDomain', async () => {
      (await Validation.isValidCertToDomain(validCert, 'google.com')).should.be.false();
    });
    it('#isValidCertBundle', async () => {
      (await Validation.isValidCertBundle('----NOT valid----', validBundle)).should.be.false();
    });
  });
  describe('#isValid function should return true', () => {
    it('#isValidSSLCert', async () => {
      (await Validation.isValidSSLCert(validCert)).should.be.true();
    });
    it('#isValidSSLKey', async () => {
      (await Validation.isValidSSLKey(validKey)).should.be.true();
    });
    it('#isValidCertKeyPair', async () => {
      (await Validation.isValidCertKeyPair(validCert, validKey)).should.be.true();
    });
    it('#validateCertToDomain', async () => {
      (await Validation.isValidCertToDomain(validCert, 'mycustomguy.com')).should.be.true();
    });
    it('#isValidCertBundle', async () => {
      (await Validation.isValidCertBundle(validBundleCert, validBundle)).should.be.true();
    });
  });
  describe('Validation', () => {
    it('#validateSSLCert', async () => {
      const result = await Validation.validateSSLCert(validCert);
      should.exist(result);
    });
    it('#validateSSLCert should throw error when formatting is wrong', async () => {
      let error;
      try {
        await Validation.validateSSLCert('');
      } catch (e) {
        error = e;
      }
      error.message.should.equal('Certificate must start and end with proper formatting.');
    });
    it('#validateSSLCert should throw error when formatted correctly but cert is still bad', async () => {
      let error;
      try {
        await Validation.validateSSLCert(badCert);
      } catch (e) {
        error = e;
      }
      should.exist(error.message);
    });
    it('#validateSSLKey', async () => {
      const result = await Validation.validateSSLKey(validKey);
      should.exist(result);
    });
    it('#validateSSLKey should throw error when formatting is wrong', async () => {
      let error;
      try {
        await Validation.validateSSLKey('');
      } catch (e) {
        error = e;
      }
      error.message.should.equal('Key must start and end with proper formatting.');
    });
    it('#validateSSLKey should throw error when formatted correctly but key is still bad', async () => {
      let error;
      try {
        await Validation.validateSSLKey(badKey);
      } catch (e) {
        error = e;
      }
      should.exist(error.message);
    });
    it('#validateCertToDomain', async () => {
      const result = await Validation.validateCertToDomain(validCert, 'mycustomguy.com');
      should.exist(result);
    });
    it('#validateCertToDomain should throw an error when it does not match', async () => {
      let error;
      try {
        await Validation.validateCertToDomain(validCert, '*');
      } catch (e) {
        error = e;
      }
      error.message.should.equal('The certificate does not match the domain.');
    });
    it('#validateCertKeyPair', async () => {
      const result = await Validation.validateCertKeyPair(validCert, validKey);
      should.exist(result);
    });
    it('#validateCertKeyPair should error when they do not match.', async () => {
      let error;
      try {
        await Validation.validateCertKeyPair(validCert, nonMatchingKey);
      } catch (e) {
        error = e;
      }
      error.message.should.equal('The provided certificate and key do not match.');
    });
    it('#validateCertBundle', async () => {
      const result = await Validation.validateCertBundle(validBundleCert, validBundle);
      should.exist(result);
    });
    it('#validateCertBundle should throw an error when they do not match', async () => {
      let error;
      try {
        await Validation.validateCertBundle(validCert, validBundle);
      } catch (e) {
        error = e;
      }
      error.message.should.equal('Bundle does not match the certificate.');
    });
  });
});
