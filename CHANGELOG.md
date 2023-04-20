# SSL Validator Changelog

## 2.0.0 - 2023-04-20

- Only supports node version 14 or higher.
- Upgrade dependencies including pem to `v1.14.7` and ramda to `v0.29.0`.

## 1.0.7 - 2020-10-22

- Update development/test dependencies.
- Update ramda dependency to `0.27.1`.
- Add Node 14 and 15 to travis.yml.
- Fix a few minor linting issues.

## 1.0.6 - 2020-02-25

- update ramda dependency to `0.27.0`
- added missing async keyword to the function validateSSLKey
- fixed domainRegTest and added tests around validation of domains to wildcard certs
- Update development/test dependencies
- Update pem dependency
- Add Node 11, 12, and 13 to travis.yml
- Remove Node 8 and 9 from travis.yml (since mocha/eslint no longer support them). Note that ssl-validator itself still works on node 8/9.

***

## 1.0.5 - 2019-06-28

- Update pem dependency
- Fix a spelling errors, improved error messages
- Add Node 12 to travis.yml

***

## 1.0.4 - 2019-01-07

- Update pem dependency
- Fix issue with bundle/cert check order

***

## 1.0.3 - 2019-01-07

- Update development/test dependencies
- Update pem dependency
- Update ramda dependency
- Update license year
- Add Node 11 to travis.yml

***

## 1.0.2 - 2018-10-22

- Update development/test dependencies
- Update pem dependency
- Fix a few typos / linter errors
- Add Node 10 to travis.yml

***

## 1.0.1 - 2018-05-08

- Handle wildcard domains correctly for matching certificates to domains

***

## 1.0.0 - 2018-04-04

- Initial release
