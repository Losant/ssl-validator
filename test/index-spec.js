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
    it('#isValidCert', async () => {
      (await Validation.isValidCert('')).should.be.false();
    });
    it('#isValidKey', async () => {
      (await Validation.isValidKey('')).should.be.false();
    });
    it('#isValidCertKeyPair', async () => {
      (await Validation.isValidCertKeyPair(validCert, '')).should.be.false();
    });
    it('#validateCertToDomain', async () => {
      (await Validation.isValidCertToDomain(validCert, 'google.com')).should.be.false();
    });
    it('#isValidCertBundle', async () => {
      (await Validation.isValidCertBundle(validBundle, '----NOT valid----')).should.be.false();
    });
  });
  describe('#isValid function should return true', () => {
    it('#isValidCert', async () => {
      (await Validation.isValidCert(validCert)).should.be.true();
    });
    it('#isValidKey', async () => {
      (await Validation.isValidKey(validKey)).should.be.true();
    });
    it('#isValidCertKeyPair', async () => {
      (await Validation.isValidCertKeyPair(validCert, validKey)).should.be.true();
    });
    it('#validateCertToDomain', async () => {
      (await Validation.isValidCertToDomain(validCert, 'mycustomguy.com')).should.be.true();
    });
    it('#isValidCertBundle', async () => {
      (await Validation.isValidCertBundle(validBundle, validBundleCert)).should.be.true();
    });
  });
  describe('Validation', () => {
    it('#validateCert', async () => {
      const result = await Validation.validateCert(validCert);
      should.exist(result);
    });
    it('#validateCert should throw error when formatting is wrong', async () => {
      let error;
      try {
        await Validation.validateCert('');
      } catch (e) {
        error = e;
      }
      error.message.should.equal('Certificate must start and end with proper formating.');
    });
    it('#validateCert should throw error when formatted correctly but cert is still bad', async () => {
      let error;
      try {
        await Validation.validateCert(badCert);
      } catch (e) {
        error = e;
      }
      should.exist(error.message);
    });
    it('#validateKey', async () => {
      const result = await Validation.validateKey(validKey);
      should.exist(result);
    });
    it('#validateKey should throw error when formatting is wrong', async () => {
      let error;
      try {
        await Validation.validateKey('');
      } catch (e) {
        error = e;
      }
      error.message.should.equal('Key must start and end with proper formating.');
    });
    it('#validateKey should throw error when formatted correctly but key is still bad', async () => {
      let error;
      try {
        await Validation.validateCert(badKey);
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
      error.message.should.equal('The cert does not match the domain.');
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
      error.message.should.equal('The provided cert and key do not match.');
    });
    it('#validateCertBundle', async () => {
      const result = await Validation.validateCertBundle(validBundle, validBundleCert);
      should.exist(result);
    });
    it('#validateCertBundle should throw an error when they do not match', async () => {
      let error;
      try {
        await Validation.validateCertBundle(validBundle, validCert);
      } catch (e) {
        error = e;
      }
      error.message.should.equal('Bundle does not match the certificate.');
    });
  });
});
