
'use strict';

const DOMAIN_NAME_MAX_LENGTH = 20
const ENTITY_NAME_MAX_LENGTH = 40

const SYSTEM_NAME_REGEX = '[a-z][a-z0-9_]'
const DOMAIN_NAME_PATTERN = buildSytemNamePattern(1, DOMAIN_NAME_MAX_LENGTH)
const ENTITY_NAME_PATTERN = buildSytemNamePattern(1, ENTITY_NAME_MAX_LENGTH)


module.exports = {
  buildSytemNamePattern
}



// returns a regex pattern with a length range definition
function buildSytemNamePattern(minLength, maxLength) {
  return `^${SYSTEM_NAME_REGEX}{${minLength-1},${maxLength-1}}$`
}


module.exports.schema = {

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
      minProperties: 1,
      additionalProperties: false,
      patternProperties: {
        [ ENTITY_NAME_PATTERN ]: {
          type: 'object',
          additionalProperties: false,
          required: [
            'description',
            'attributes'
          ],
          properties: {
            cascadeOnDelete: {
              type: 'boolean'
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
}

    }
  }
}
