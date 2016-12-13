
'use strict';

module.exports = {

  valid: [
    {
      name: 'lorem',
      type: 'timestamptz',
      description: 'lorem ipsum'
    },
    {
      name: 'ipsum',
      type: 'timestamptz',
      description: 'lorem ipsum',
      required: true
    }
  ],


  invalid: [

    {
      setup: {
        type: 'timestamptz',
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
        type: 'timestamptz',
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
        type: 'timestamptz',
        description: 'lorem ipsum',
        required: 'some text',
        whatever: 123
      },
      errors: [
        {
          reason: '"required" is not a boolean',
          msg: /".required".*should be boolean/
        },
        {
          reason: '"whatever" is used',
          msg: /"whatever".*should NOT have additional properties/
        }
      ]

    }
  ]
}

