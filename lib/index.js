const validators = require('./validators');
const { startsWith } = require('ramda');

const toExport = {};

Object.keys(validators).forEach((funcName) => {
  if (!startsWith('validate', funcName)) {
    throw Error('Validator function must start with validate.');
  }
  const func = validators[funcName];
  toExport[funcName] = validators[funcName];
  const isFuncName = funcName.replace('validate', 'isValid');
  toExport[isFuncName] = async (...args) => {
    try {
      await func(...args);
      return true;
    } catch (e) {
      return false;
    }
  };
});

module.exports = toExport;
