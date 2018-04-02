const validators = require('./validators');

const toExport = {};

Object.keys(validators).forEach((funcName) => {
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
