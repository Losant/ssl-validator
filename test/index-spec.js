const should = require('should');
const {
  validCert,
  validKey,
  validBundle,
  validBundleCert,
  nonMatchingKey,
  badCert,
  badKey,
  expiredWildCardCert,
  validWildCardCert,
  expiredWildCardKey,
  validWildCardKey
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
    it('should validate with wildcard cert', async () => {
      (await Validation.isValidSSL(validWildCardCert, { key: validWildCardKey, domain: 'm.xxx.com', skipDateValidation: false })).should.be.true();
      (await Validation.isValidSSL(validWildCardCert, { key: validWildCardKey, domain: 'xxx.com', skipDateValidation: false })).should.be.false();
      (await Validation.isValidSSL(validWildCardCert, { key: validWildCardKey, domain: '.xxx.com', skipDateValidation: false })).should.be.false();
      (await Validation.isValidSSL(validWildCardCert, { key: validWildCardKey, domain: 'foo.bar.xxx.com', skipDateValidation: false })).should.be.false();
      (await Validation.isValidSSL(validWildCardCert, { key: validWildCardKey, domain: 'foobar.xxx.com', skipDateValidation: false })).should.be.true();
      (await Validation.isValidSSL(validWildCardCert, { key: validWildCardKey, domain: '-foo.xxx.com', skipDateValidation: false })).should.be.false();
      (await Validation.isValidSSL(validWildCardCert, { key: validWildCardKey, domain: '-foo-.xxx.com', skipDateValidation: false })).should.be.false();
      (await Validation.isValidSSL(validWildCardCert, { key: validWildCardKey, domain: 'foo-.xxx.com', skipDateValidation: false })).should.be.false();
      (await Validation.isValidSSL(validWildCardCert, { key: validWildCardKey, domain: ' .xxx.com', skipDateValidation: false })).should.be.false();
    });
    it('should validate with expired wildcard cert', async () => {
      (await Validation.isValidSSL(expiredWildCardCert, { key: expiredWildCardKey, domain: 'm.xxx.com', skipDateValidation: true })).should.be.true();
      (await Validation.isValidSSL(expiredWildCardCert, { key: expiredWildCardKey, domain: 'xxx.com', skipDateValidation: true })).should.be.false();
      (await Validation.isValidSSL(expiredWildCardCert, { key: expiredWildCardKey, domain: '.xxx.com', skipDateValidation: true })).should.be.false();
      (await Validation.isValidSSL(expiredWildCardCert, { key: expiredWildCardKey, domain: 'foo.bar.xxx.com', skipDateValidation: true })).should.be.false();
      (await Validation.isValidSSL(expiredWildCardCert, { key: expiredWildCardKey, domain: 'foobar.xxx.com', skipDateValidation: true })).should.be.true();
      (await Validation.isValidSSL(expiredWildCardCert, { key: expiredWildCardKey, domain: '-foo.xxx.com', skipDateValidation: true })).should.be.false();
      (await Validation.isValidSSL(expiredWildCardCert, { key: expiredWildCardKey, domain: '-foo-.xxx.com', skipDateValidation: true })).should.be.false();
      (await Validation.isValidSSL(expiredWildCardCert, { key: expiredWildCardKey, domain: 'foo-.xxx.com', skipDateValidation: true })).should.be.false();
      (await Validation.isValidSSL(expiredWildCardCert, { key: expiredWildCardKey, domain: ' .xxx.com', skipDateValidation: true })).should.be.false();
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
      result.issuer.should.deepEqual({
        country: '',
        state: '',
        locality: '',
        organization: '',
        organizationUnit: '',
        commonName: 'mycustomguy.com',
        dc: ''
      });
    });
    it('#validateSSLCert should throw error when formatting is wrong', async () => {
      await Validation.validateSSLCert('').should.be.rejectedWith({
        message: 'Certificate must start and end with proper formatting.'
      });
    });
    it('#validateSSLCert should throw error when formatted correctly but cert is still bad', async () => {
      await Validation.validateSSLCert(badCert).should.be.rejected();
    });
    it('#validateSSLKey', async () => {
      const result = await Validation.validateSSLKey(validKey);
      result.should.deepEqual({
        modulus: 'B0CBB05C2655CA93076A298B2386E0D1FEF8647E062E5293317B1A4BBE21E4693367E6C4B1C983AE8C8CEE03D7128735F1D7FE79E70A1B5C3453D820B7EF683AA743B970810D03F29B0DA8337F1D84BEF37E640846CA812424B4CE1522A3F5DBE85E789E5172201B7A028CA8A49141E3EAC90FF2F180F60134A20CBF811CF26217B4A9BA51592FDDF4F1DB776F88BBD5EFD227127C8EDFA56AB3E901E7F29F29669EAB3A8D6396B7CF74DF3683BEFE86E4D1AC99138A68FAA93194B1290BC25F4DFDF517686A9C2895B532C15851A2C5BAB2199155EED2700CBCD1FB2FBCAB0E49C3F17AFDD47119085F187681BB5834FC13787528BB65D8D558899A6B550147'
      });
    });
    it('#validateSSLKey should throw error when formatting is wrong', async () => {
      await Validation.validateSSLKey('').should.be.rejectedWith({
        message: 'Key must start and end with proper formatting.'
      });
    });
    it('#validateSSLKey should throw error when formatted correctly but key is still bad', async () => {
      await Validation.validateSSLKey(badKey).should.be.rejected();
    });
    it('#validateCertToDomain', async () => {
      const result = await Validation.validateCertToDomain(validCert, 'mycustomguy.com');
      should.exist(result);
    });
    it('#validateCertToDomain should throw an error when it does not match', async () => {
      await Validation.validateCertToDomain(validCert, '*').should.be.rejectedWith({
        message: 'The certificate does not match the domain.'
      });
    });
    it('#validateCertKeyPair', async () => {
      const result = await Validation.validateCertKeyPair(validCert, validKey);
      should.exist(result);
    });
    it('#validateCertKeyPair should error when they do not match.', async () => {
      await Validation.validateCertKeyPair(validCert, nonMatchingKey).should.be.rejectedWith({
        message: 'The provided certificate and key do not match.'
      });
    });
    it('#validateCertBundle', async () => {
      const result = await Validation.validateCertBundle(validBundleCert, validBundle);
      should.exist(result);
    });
    it('#validateCertBundle should throw an error when they do not match', async () => {
      await Validation.validateCertBundle(validCert, validBundle).should.be.rejectedWith({
        message: 'Bundle does not match the certificate.'
      });
    });
  });
});
