
'use strict';

export default {

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
          reason: '"required" is used',
          msg: /"required".*should NOT have additional properties/
        },
        {
          reason: '"pattern" is used',
          msg: /"pattern".*should NOT have additional properties/
        }
      ]

    }
  ]
}
