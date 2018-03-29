const { curry } = require('ramda');
const { KEY_START, KEY_END, RSA_KEY_START, RSA_KEY_END } = require('./constants');
const domainRegTest = /^[a-z0-9-]+$/;

const tryParseJson = (keyjson) => {
  if (typeof keyjson === 'string') {
    try {
      keyjson = JSON.parse(keyjson);
    } catch (e) {
      throw Error(`Could not parse json properly: ${e.message}`);
    }
  }
  return keyjson;
};

const isSslKey = (key) => {
  return !(key.startsWith(KEY_START) && key.endsWith(KEY_END)) && !(key.startsWith(RSA_KEY_START) && key.endsWith(RSA_KEY_END))
};

const isDomainMatch = curry((toCheck, base) => {
  if (base === toCheck) return true;
  
  if (!base.startsWith('*')) return false; // exact domain and already does not match
  
  if (!toCheck.endsWith(base)) return false; // it's not a subdomain

  const restOfDomain = toCheck.slice(0, -base.length);
  if (!domainRegTest.test(restOfDomain)) return false; // it's a sub domain make sure everything else looks good.

  return true;
});

module.exports = {
  tryParseJson,
  isSslKey,
  isDomainMatch
};
