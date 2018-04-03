const pem = require('pem');
const { promisify } = require('util');

module.exports = {
  readCertificateInfo: promisify(pem.readCertificateInfo),
  getModulus: promisify(pem.getModulus),
  verifySigningChain: promisify(pem.verifySigningChain)
};
