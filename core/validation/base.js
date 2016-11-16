
'use strict';

const DOMAIN_NAME_MAX_LENGTH = 20
const ENTITY_NAME_MAX_LENGTH = 40
const ATTRIBUTE_NAME_MAX_LENGTH = 20

const SYSTEM_NAME_REGEX = '[a-z][a-z0-9_]'
const DOMAIN_NAME_PATTERN = buildSytemNamePattern()
const ENTITY_NAME_PATTERN = buildSytemNamePattern()
const ATTRIBUTE_NAME_PATTERN = buildSytemNamePattern()
const ENTITY_PATH_PATTERN = `^(?:${SYSTEM_NAME_REGEX}*\\:\\:)?(?:${SYSTEM_NAME_REGEX}*\\:\\:)?${SYSTEM_NAME_REGEX}*$`
const VALUE_GENERATOR_PATTERN = `^(?:${SYSTEM_NAME_REGEX}*\\:\\:)?${SYSTEM_NAME_REGEX}*(?: *\\( *${SYSTEM_NAME_REGEX}*( *, *${SYSTEM_NAME_REGEX}*)* *\\))?$`


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

    // domain naming rules
    domainName: {
      type: 'string',
      pattern: DOMAIN_NAME_PATTERN,
      minLength: 1,
      maxLength: DOMAIN_NAME_MAX_LENGTH
    },

    // entity naming rules
    entityName: {
      type: 'string',
      pattern: ENTITY_NAME_PATTERN,
      minLength: 1,
      maxLength: ENTITY_NAME_MAX_LENGTH
    },

    // syntax of an entity path
    typeModelEntityPath: {
      type: 'string',
      pattern: ENTITY_PATH_PATTERN,
      minLength: 1
    },

    // description rules
    propertyTypeDescription: {
      type: 'string',
      minLength: 2
    },

    // structure of an entity attribute
    typeAttribute: {
      type: 'object',
      additionalProperties: false,
      required: [
        'name',
        'type'
      ],
      properties: {
        name: {
          type: 'string',
          pattern: ATTRIBUTE_NAME_PATTERN,
          minLength: 1,
          maxLength: ATTRIBUTE_NAME_MAX_LENGTH
        },
        type: {
          type: 'string',
        },
        description: {
          $ref: '#/definitions/propertyTypeDescription'
        },
        required: {
          type: 'boolean',
        },
        translatable: {
          type: 'boolean',
        },
        valueGenerator: {
          type: 'string',
          pattern: VALUE_GENERATOR_PATTERN
        },
        target: {
          $ref: '#/definitions/typeModelEntityPath'
        },
        targetAttributesMap: {
          type: 'object',
          patternProperties: {
            '.+': {
              type: 'string'
            }
          }
        }
      },
      patternProperties: {
        '^(maximum|minimum|multipleOf)$': {
          type: 'number'
        },
        '^(maxLength|minLength)$': {
          type: 'integer'
        },
        '^(exclusiveMaximum|exclusiveMinimum)$': {
          type: 'boolean'
        },
        '^(pattern|format)$': {
          type: 'string'
        }
      }
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
            $ref: '#/definitions/propertyTypeDescription'
          },
          attributes: {
            type: 'array',
            minItems: 1,
            items: {
              $ref: '#/definitions/typeAttribute',
              required: [
                'name',
                'type'
              ]
            }
          },
          indexing: {
            type: 'object'
          }

        }

      }
    }
  }
}
