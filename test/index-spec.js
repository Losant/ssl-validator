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
  validWildCardKey,
  passwordProtectedKey,
  ecdsaCert,
  ecdsaKey
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
      (await Validation.isValidSSLKey(validKey, { password: ' ' })).should.be.true();
      (await Validation.isValidSSLKey(passwordProtectedKey, { password: 'asdfASDF', skipDateValidation: true })).should.be.false();
      (await Validation.isValidSSLKey(passwordProtectedKey, { password: ' ', skipDateValidation: true })).should.be.false();
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
    it('#validateSSLCert should throw error from openssl when cert format validation is skipped', async () => {
      await Validation.validateSSLCert('', { skipFormatValidation: true }).should.be.rejectedWith({
        message: 'Invalid openssl exit code: 1\n% openssl x509 -noout -nameopt RFC2253,sep_multiline,space_eq,-esc_msb,utf8 -text -in --TMPFILE--\nCould not open file or uri for loading certificate from --TMPFILE--: No such file or directory\n'
      });
    });
    it('#validateSSLKey', async () => {
      const result = await Validation.validateSSLKey(validKey);
      result.should.deepEqual('-----BEGIN PUBLIC KEY-----\nMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAsMuwXCZVypMHaimLI4bg\n0f74ZH4GLlKTMXsaS74h5GkzZ+bEscmDroyM7gPXEoc18df+eecKG1w0U9ggt+9o\nOqdDuXCBDQPymw2oM38dhL7zfmQIRsqBJCS0zhUio/Xb6F54nlFyIBt6AoyopJFB\n4+rJD/LxgPYBNKIMv4Ec8mIXtKm6UVkv3fTx23dviLvV79InEnyO36Vqs+kB5/Kf\nKWaeqzqNY5a3z3TfNoO+/obk0ayZE4po+qkxlLEpC8JfTf31F2hqnCiVtTLBWFGi\nxbqyGZFV7tJwDLzR+y+8qw5Jw/F6/dRxGQhfGHaBu1g0/BN4dSi7ZdjVWImaa1UB\nRwIDAQAB\n-----END PUBLIC KEY-----');
    });
    it('#validateSSLKey should throw error when formatting is wrong', async () => {
      await Validation.validateSSLKey('').should.be.rejectedWith({
        message: 'Key must start and end with proper formatting.'
      });
    });
    it('#validateSSLKey should throw error when formatted correctly but key is still bad', async () => {
      await Validation.validateSSLKey(badKey).should.be.rejected();
    });
    it('#validateSSLKey should throw error from openssl when key format validation is skipped', async () => {
      await Validation.validateSSLKey('', { skipFormatValidation: true }).should.be.rejectedWith({
        message: 'Invalid openssl exit code: 1\n% openssl x509 -in --TMPFILE-- -pubkey -noout\nCould not open file or uri for loading certificate from --TMPFILE--: No such file or directory\n'
      });
    });
    it('#validateSSLKey should throw an error from pem when attempting to getPublicKey from a password encrypted key', async () => {
      const error = await Validation.validateSSLKey(passwordProtectedKey, { password: ' ' }).catch((e) => { return e; });
      error.message.includes('Invalid openssl exit code: 1').should.be.true();
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

    it('correctly validates ecdsa keys', async () => {
      const expectedPubKey = '-----BEGIN PUBLIC KEY-----\nMFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAEn/3yQ9oI/KwUjV6uk86GBDJNPka3\noxo4UiDm75F8FaqSiPrapu0CuHmcc4/n+EyTKX5U2K5kROwVBDqYJMno5A==\n-----END PUBLIC KEY-----';
      await Validation.validateSSLKey(ecdsaKey).should.be.resolvedWith(expectedPubKey);
      await Validation.validateSSL(ecdsaCert, { key: ecdsaKey, domain: 'test.testing.test' })
        .should.be.resolvedWith({
          certInfo: {
            issuer: {
              country: 'US',
              state: 'Test',
              locality: 'Testing',
              organization: 'More Testing',
              organizationUnit: 'Test Away',
              commonName: 'test.testing.test',
              dc: ''
            },
            serial: '0f:31:fb:56:70:e7:da:1d:0b:0d:84:cb:61:76:3b:dd:27:e0:8f:d8',
            country: 'US',
            state: 'Test',
            locality: 'Testing',
            organization: 'More Testing',
            organizationUnit: 'Test Away',
            commonName: 'test.testing.test',
            emailAddress: 'test@test.test',
            dc: '',
            validity: { start: 1693497392000, end: 33229497392000 },
            signatureAlgorithm: 'ecdsa-with-SHA256',
            publicKeySize: '256 bit',
            publicKeyAlgorithm: 'id-ecPublicKey'
          },
          publicKey: expectedPubKey
        });
    });
  });
});
