const {
  curry, allPass, anyPass, map, startsWith, endsWith, find, trim
} = require('ramda');
const { KEY_TYPES, CERT_TYPES } = require('./constants');

const KEY_PAIRS = KEY_TYPES.map((type) => {
  return { start: `-----BEGIN ${type}-----`, end: `-----END ${type}-----` };
});

const CERTIFICATE_PAIRS = CERT_TYPES.map((type) => {
  return { start: `-----BEGIN ${type}-----`, end: `-----END ${type}-----` };
});

const buildValidFormatFunc = curry(map(({ start, end }) => {
  return allPass([ startsWith(start), endsWith(end) ]);
}));

const domainRegTest = /^[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9]$)/;

const isDomainMatch = curry((toCheck, base) => {
  if (base === toCheck) { return true; }

  if (!base.startsWith('*')) { return false; } // exact domain and already does not match
  base = base.slice(1);
  if (!toCheck.endsWith(base)) { return false; } // it's not a subdomain

  const restOfDomain = trim(toCheck.slice(0, -base.length));
  const partsOfRestOfDomain = restOfDomain.split('.');
  const found = find((part) => {
    return !domainRegTest.test(part);
  }, partsOfRestOfDomain);
  if (found) { return false; } // it's a sub domain make sure everything else looks good.

  return true;
});

const isCertValidFormat = anyPass(buildValidFormatFunc(CERTIFICATE_PAIRS));

const isKeyValidFormat = anyPass(buildValidFormatFunc(KEY_PAIRS));

const isValidDate = (info, skipDateValidation = false) => {
  if (!skipDateValidation && info.validaty && info.validaty.start && info.validaty.end) {
    const now = Number(new Date());
    const { start, end } = info.validaty;
    if (now < start) {
      throw new Error('Certificate is not valid yet start date.');
    }
    if (now > end) {
      throw new Error('Certificate has expired.');
    }
  }
  return true;
};


module.exports = {
  isDomainMatch,
  isCertValidFormat,
  isKeyValidFormat,
  isValidDate
};
