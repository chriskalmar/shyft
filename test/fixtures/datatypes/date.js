
'use strict';

module.exports = {

  valid: [
    {
      name: 'lorem',
      type: 'date',
      description: 'lorem ipsum'
    },
    {
      name: 'ipsum',
      type: 'date',
      description: 'lorem ipsum',
      required: true
    }
  ],


  invalid: [

    {
      setup: {
        type: 'date',
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
        type: 'date',
        required: true
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
        type: 'date',
        description: 'lorem ipsum',
        required: 'some text',
        minimum: 123
      },
      errors: [
        {
          reason: '"required" is not a boolean',
          msg: /".required".*should be boolean/
        },
        {
          reason: '"minimum" is used',
          msg: /"minimum".*should NOT have additional properties/
        }
      ]

    }
  ]
}
