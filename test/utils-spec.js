const {
  isDomainMatch,
  isValidDate
} = require('../lib/utils');

const SIX_MONTHS = 180 * 24 * 60 * 60 * 1000;
const ONE_YEAR = 365 * 24 * 60 * 60 * 1000;

describe('Utils', () => {
  describe('#isDomainMatch', () => {
    it('should return true is equivalent', () => {
      isDomainMatch('google.com', 'google.com').should.equal(true);
    });
    it('should return true for wildcards', () => {
      isDomainMatch('this.losant.com', '*.losant.com').should.equal(true);
      isDomainMatch('1234this.is.losant.com', '*.losant.com').should.equal(true);
    });
    it('should return false if not a subdomain', () => {
      isDomainMatch('lo.sant.com', '*.google.com').should.equal(false);
    });
    it('should return false for invalid subdomains', () => {
      isDomainMatch('this-.is.losant.com', '*.is.losant.com').should.equal(false);
    });
  });
  describe('#isValidDate', () => {
    it('should not throw an error if the date is valid', () => {
      const now = Number(new Date());
      const start = now - SIX_MONTHS;
      const end = now + SIX_MONTHS;
      const info = { validity: { start, end } };
      isValidDate(info).should.equal(true);
    });
    it('should return true if skipDateValidation is on', () => {
      isValidDate({}, true).should.equal(true);
    });
    it('should throw an error if it has expired', () => {
      const now = Number(new Date());
      const start = now - ONE_YEAR;
      const end = now - SIX_MONTHS;
      const info = { validity: { start, end } };
      let error;
      try {
        isValidDate(info);
      } catch (e) {
        error = e;
      }
      error.message.should.equal('Certificate has expired.');
    });
    it('should throw an error if start date is greater than now', () => {
      const now = Number(new Date());
      const start = now + SIX_MONTHS;
      const end = now + ONE_YEAR;
      const info = { validity: { start, end } };
      let error;
      try {
        isValidDate(info);
      } catch (e) {
        error = e;
      }
      error.message.should.equal('Certificate does not have a valid start date.');
    });
  });
});
