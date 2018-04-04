# Node SSL Validator

This module is a validator for SSL Certificates using the [PEM node module](https://www.npmjs.com/package/pem). You can validate SSL Keys, SSL Certificates, SSL Certificate Domains, SSL Certificate Bundles etc.

[![Build Status](https://travis-ci.org/Losant/ssl-validator.svg?branch=master)](https://travis-ci.org/Losant/ssl-validator) [![npm version](https://badge.fury.io/js/ssl-validator.svg)](https://badge.fury.io/js/ssl-validator)

* [Installation](#installation)
* [API Documentation](#api-documentation)
  * [validateSSL](#validate-ssl)
  * [validateSSLCert](#validate-ssl-cert)
  * [validateSSLKey](#validate-ssl-key)
  * [validateCertBundle](#validate-cert-bundle)
  * [validateCertKeyPair](#validate-cert-key-pair)
  * [validateCertToDomain](#validate-cert-to-domain)
  * [isValid Functions](#isvalid-functions)
* [License](#license)

## Installation

```bash
npm install ssl-validator
```

or

```bash
yarn add ssl-validator
```

## API Documentation

All of the `validate` functions will throw errors if something is invalid. Use the [`isValid`](#is-valid-functions) to get a true or false return.

### Validate SSL

```javascript
// will throw an error if anything is invalid.
await validateSSL(cert,
  {
    skipDateValidation: false,
    key: aValidKeyStr,
    bundle: aValidBundleStr,
    domain: 'google.com'
  }
);
```

| Option | Type | Default | Description |
| :----- | :--- | ------- | :---------- |
| skipDateValidation | Boolean | false | Skip verifying the [certificate's](https://en.wikipedia.org/wiki/Public_key_certificate) and/or bundle's validity period. |
| key | String | | When given, validates that the key and certificate are a pair. |
| domain | String | | When given, verifies the certificate is valid for this domain. |
| bundle | String | | Verifies the [certificate bundle](https://www.namecheap.com/support/knowledgebase/article.aspx/986/69/what-is-ca-bundle) and certificate go together. |

### Validate SSL Cert
This function validates that the certificate is an SSL certificates and checks to ensure the validity of the issued time, and expires time.

```javascript
await validateSSLCert(cert, options);
```

| Option | Type | Default | Description |
| :----- | :--- | ------- | :---------- |
| skipDateValidation | Boolean | false | Skip verifying the given certificate's validity period. |

### Validate SSL Key
This function validates that the certificate is an SSL certificates and checks to ensure the validity of the issued time, and expires time.

```javascript
await validateSSLKey(key);
```
Validates the format of the key and the returns the modulus of the key.

### Validate Cert Bundle
This functions validates that the certificate and the bundle are certificates, and ensures that the bundle and certificate go together.

```javascript
await validateCertBundle(cert, bundle, options);
```

| Option | Type | Default | Description |
| :----- | :--- | ------- | :---------- |
| skipDateValidation | Boolean | false | Skip verifying the certificate's and bundle's validity period. |

### Validate Cert Key Pair
This functions validates that the given certificate and key are a matching pair.

```javascript
await validateCertKeyPair(cert, key, options);
```

| Option | Type | Default | Description |
| :----- | :--- | ------- | :---------- |
| skipDateValidation | Boolean | false | Skip verifying the given certificate's validity period. |

### Validate Cert To Domain
This functions validates the given certificate and it matches the given domain.

```javascript
await validateCertToDomain(cert, key, options);
```

| Option | Type | Default | Description |
| :----- | :--- | ------- | :---------- |
| skipDateValidation | Boolean | false | Skip verifying the given certificate's validity period. |

### IsValid Functions

Each of the function listed above (validateSSL, validateSSLCert etc.) has a counter part that will not throw any errors but return `true` when valid and `false` when not valid. All arguments and options are that are shown above are valid.

| Original Function Name | Predicate Function Name |
| :--------------- | :------------- |
| validateSSL | isValidSSL |
| validateSSLCert | isValidSSLCert |
| validateSSLKey | isValidSSLKey |
| validateCertBundle | isValidCertBundle |
| validateCertKeyPair | isValidCertKeyPair |
| validateCertToDomain | isValidCertToDomain |

```javascript
if (!(await isValidSSL(cert))) {
  return { message: 'Sorry the certificate supplied is not valid.' };
}
```

## License

The module is available as open source under the terms of the [MIT License](http://opensource.org/licenses/MIT).