
'use strict';

const DOMAIN_NAME_MAX_LENGTH = 20

const SYSTEM_NAME_REGEX = '[a-z][a-z0-9_]'
const DOMAIN_NAME_PATTERN = `^${SYSTEM_NAME_REGEX}{0,${DOMAIN_NAME_MAX_LENGTH-1}}$`


module.exports = {

  title: 'JSON Schema for Shift',
  $schema: 'http://json-schema.org/draft-04/schema#',

  definitions: {

    domainName: {
      type: 'string',
      pattern: DOMAIN_NAME_PATTERN
    },

    typeDescription: {
      type: 'string',
      minLength: 2
    }
  },

  type: 'object',
  additionalProperties: false,
  required: [
    'domain',
    'entities'
  ],
  properties: {
    domain: {
      $ref: '#/definitions/domainName'
    },
    entities: {
      type: 'object',
      minProperties: 1
    }
  }
}
