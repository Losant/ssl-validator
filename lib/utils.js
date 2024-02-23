const {
  curry,
  allPass,
  anyPass,
  map,
  startsWith,
  endsWith,
  toLower,
  trim,
  pipe
} = require('ramda');
const { KEY_TYPES, CERT_TYPES } = require('./constants');

const KEY_PAIRS = map((type) => {
  return { start: `-----BEGIN ${type}-----`, end: `-----END ${type}-----` };
}, KEY_TYPES);

const CERTIFICATE_PAIRS = map((type) => {
  return { start: `-----BEGIN ${type}-----`, end: `-----END ${type}-----` };
}, CERT_TYPES);

const buildValidFormatFunc = map(({ start, end }) => {
  return allPass([ startsWith(start), endsWith(end) ]);
});

const domainSegmentTest = /^[A-Za-z0-9-]{1,63}$/;
const checkDomainSegment = domainSegmentTest.test.bind(domainSegmentTest);

const isDomainMatch = curry((toCheck, base) => {
  if (base === toCheck) { return true; }

  if (!base.startsWith('*')) { return false; } // exact domain and already does not match
  base = base.slice(1);
  if (!toCheck.endsWith(base)) { return false; } // it's not a subdomain
  const domainSegment = toCheck.slice(0, -base.length);
  if (domainSegment.startsWith('-') || domainSegment.endsWith('-') || !checkDomainSegment(domainSegment)) { return false; }
  return true;
});

const isCertValidFormat = anyPass(buildValidFormatFunc(CERTIFICATE_PAIRS));

const isKeyValidFormat = anyPass(buildValidFormatFunc(KEY_PAIRS));

const trimLower = pipe(trim, toLower);

const isValidDate = (info, skipDateValidation = false) => {
  if (!skipDateValidation && info.validity && info.validity.start && info.validity.end) {
    const now = Number(new Date());
    const { start, end } = info.validity;
    if (now < start) {
      throw new Error('Certificate does not have a valid start date.');
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
  isValidDate,
  trimLower
};
