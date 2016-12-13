
'use strict';

module.exports = {

  valid: [
    {
      name: 'lorem',
      type: 'boolean',
      description: 'lorem ipsum'
    }
  ],


  invalid: [

    {
      setup: {
        type: 'boolean',
        description: 'lorem ipsum'
      },
      errors: [
        {
          reason: '"name" is missing',
          msg: /"missingProperty":"name"/
        }
      ]
    },

    {
      setup: {
        type: 'boolean'
      },
      errors: [
        {
          reason: '"name" is missing',
          msg: /"missingProperty":"name"/
        },
        {
          reason: '"description" is missing',
          msg: /"missingProperty":"description"/
        }
      ]
    },

    {
      setup: {
        name: 'dolor',
        type: 'boolean',
        description: 'lorem ipsum',
        pattern: 123,
        required: 'some text'
      },
      errors: [
        {
          reason: '"required" is not an allowed property',
          msg: /"required".*should NOT have additional properties/
        },
        {
          reason: '"pattern" is not an allowed property',
          msg: /"pattern".*should NOT have additional properties/
        }
      ]

    }
  ]
}
