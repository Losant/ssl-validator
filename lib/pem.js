import pem from 'pem';
import openssl from 'pem/lib/openssl.js';
import helper from 'pem/lib/helper.js';
import util from 'node:util';

export const readCertificateInfo = util.promisify(pem.readCertificateInfo);
export const verifySigningChain = util.promisify(pem.verifySigningChain);

// the getPublicKey method for PEM does not work with ecdsa keys, and does not support passwords
// this adds both those abilities, but matches how PEM does things
// https://github.com/Dexus/pem/blob/master/lib/pem.js#L534
export const getPublicKey = async (certOrKey, password) => {
  certOrKey = (certOrKey || '').toString();

  let params;
  if (certOrKey.match(/PRIVATE KEY/)) {
    params = ['pkey',
      '-in',
      '--TMPFILE--',
      '-pubout'
    ];
  } else {
    params = ['x509',
      '-in',
      '--TMPFILE--',
      '-pubkey',
      '-noout'
    ];
  }

  const delTempPWFiles = [];
  if (password) {
    helper.createPasswordFile({ cipher: '', password: password, passType: 'in' }, params, delTempPWFiles);
  }

  return new Promise((resolve, reject) => {
    openssl.exec(params, 'PUBLIC KEY', certOrKey, (sslErr, pubKey) => {
      helper.deleteTempFiles(delTempPWFiles, (fsErr) => {
        if (sslErr || fsErr) {
          return reject(sslErr || fsErr);
        }
        resolve(pubKey);
      });
    });
  });
};
