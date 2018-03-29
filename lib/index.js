const R = require('ramda');
const validators = require('./validators');

const toExport = {};

Object.keys(validators).forEach((funcName) => {
  const func = validators[funcName];
  toExport[funcName] = validators[funcName];
  const boolFuncName = funcName.replace('validate', 'isValid');
  toExport[boolFuncName] = async (...args) => {
    let err;
    try {
      await func(...args);
    } catch (e) {
      err = e;
    }
    return !err;
  };
});

module.exports = toExport;
