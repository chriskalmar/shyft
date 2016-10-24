
'use strict';

const DOMAIN_NAME_MAX_LENGTH = 20
const ENTITY_NAME_MAX_LENGTH = 40

const SYSTEM_NAME_REGEX = '[a-z][a-z0-9_]'
const DOMAIN_NAME_PATTERN = buildSytemNamePattern()
const ENTITY_NAME_PATTERN = buildSytemNamePattern()


module.exports = {
  buildSytemNamePattern
}



// returns a regex pattern with a length range definition
function buildSytemNamePattern(minLength, maxLength) {
  let minLengthStr = ''
  let maxLengthStr = ''
  let lengthStr = '*'

  if (minLength >= 0) {
    minLengthStr = minLength - 1
    lengthStr = `{${minLengthStr},}`

    if (maxLength >= minLength) {
      maxLengthStr = maxLength - 1
      lengthStr = `{${minLengthStr},${maxLengthStr}}`
    }
    else if (typeof maxLength !== 'undefined') {
      throw new Error('buildSytemNamePattern() expects maxLength to be >= minLength')
    }
  }
  else if (minLength < 0) {
    throw new Error('buildSytemNamePattern() expects minLength to be a positive integer')
  }


  return `^${SYSTEM_NAME_REGEX}${lengthStr}$`
}


module.exports.schema = {

  title: 'JSON Schema for Shift',
  $schema: 'http://json-schema.org/draft-04/schema#',

  definitions: {

    domainName: {
      type: 'string',
      pattern: DOMAIN_NAME_PATTERN,
      minLength: 1,
      maxLength: DOMAIN_NAME_MAX_LENGTH
    },

    entityName: {
      type: 'string',
      pattern: ENTITY_NAME_PATTERN,
      minLength: 1,
      maxLength: ENTITY_NAME_MAX_LENGTH
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
      type: 'array',
      minItems: 1,
      items: {
        type: 'object',
        additionalProperties: false,
        required: [
          'name',
          'description',
          'attributes'
        ],
        properties: {
          cascadeOnDelete: {
            type: 'boolean'
          },
          name: {
            $ref: '#/definitions/entityName'
          },
          description: {
            $ref: '#/definitions/typeDescription'
          },
          attributes: {
            type: 'object'
          },
          indexing: {
            type: 'object'
          }

        }

      }
    }
  }
}
