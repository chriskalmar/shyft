
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


module.exports.schemaDefinitions = {

  jsonSchemaTypes: {
    _maximum: {
      type: 'number'
    },
    _minimum: {
      type: 'number'
    },
    _multipleOf: {
      type: 'number'
    },
    _maxLength: {
      type: 'integer'
    },
    _minLength: {
      type: 'integer'
    },
    _exclusiveMaximum: {
      type: 'boolean'
    },
    _exclusiveMinimum: {
      type: 'boolean'
    },
    _pattern: {
      type: 'string'
    },
    _format: {
      type: 'string'
    }
  },

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


  attributeProperties: {
    _name: {
      type: 'string',
      pattern: ATTRIBUTE_NAME_PATTERN,
      minLength: 1,
      maxLength: ATTRIBUTE_NAME_MAX_LENGTH
    },
    _type: {
      type: 'string',
    },
    _description: {
      $ref: '#/definitions/propertyTypeDescription'
    },
    _required: {
      type: 'boolean',
    },
    _translatable: {
      type: 'boolean',
    },
    _valueGenerator: {
      type: 'string',
      pattern: VALUE_GENERATOR_PATTERN
    },
    _target: {
      $ref: '#/definitions/typeModelEntityPath'
    },
    _targetAttributesMap: {
      type: 'object',
      patternProperties: {
        '.+': {
          type: 'string'
        }
      }
    }
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
        $ref: '#/definitions/attributeProperties/_name'
      },
      type: {
        $ref: '#/definitions/attributeProperties/_type'
      },
      description: {
        $ref: '#/definitions/attributeProperties/_description'
      },
      required: {
        $ref: '#/definitions/attributeProperties/_required'
      },
      translatable: {
        $ref: '#/definitions/attributeProperties/_translatable'
      },
      valueGenerator: {
        $ref: '#/definitions/attributeProperties/_valueGenerator'
      },
      target: {
        $ref: '#/definitions/attributeProperties/_target'
      },
      targetAttributesMap: {
        $ref: '#/definitions/attributeProperties/_targetAttributesMap'
      },

      maximum: {
        $ref: '#/definitions/jsonSchemaTypes/_maximum'
      },
      minimum: {
        $ref: '#/definitions/jsonSchemaTypes/_minimum'
      },
      multipleOf: {
        $ref: '#/definitions/jsonSchemaTypes/_multipleOf'
      },
      maxLength: {
        $ref: '#/definitions/jsonSchemaTypes/_maxLength'
      },
      minLength: {
        $ref: '#/definitions/jsonSchemaTypes/_minLength'
      },
      exclusiveMaximum: {
        $ref: '#/definitions/jsonSchemaTypes/_exclusiveMaximum'
      },
      exclusiveMinimum: {
        $ref: '#/definitions/jsonSchemaTypes/_exclusiveMinimum'
      },
      pattern: {
        $ref: '#/definitions/jsonSchemaTypes/_pattern'
      },
      format: {
        $ref: '#/definitions/jsonSchemaTypes/_format'
      }

    }
  }

}


module.exports.schema = {

  title: 'JSON Schema for Shift',
  $schema: 'http://json-schema.org/draft-04/schema#',

  definitions: module.exports.schemaDefinitions,

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
                'type',
                'description'
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
