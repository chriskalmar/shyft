
'use strict';

export default {

  valid: [
    {
      name: 'lorem',
      type: 'timetz',
      description: 'lorem ipsum'
    },
    {
      name: 'ipsum',
      type: 'timetz',
      description: 'lorem ipsum',
      required: true
    }
  ],


  invalid: [

    {
      setup: {
        type: 'timetz',
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
        type: 'timetz',
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
        type: 'timetz',
        description: 'lorem ipsum',
        required: 'some text',
        another: 123
      },
      errors: [
        {
          reason: '"required" is not a boolean',
          msg: /".required".*should be boolean/
        },
        {
          reason: '"another" is used',
          msg: /"another".*should NOT have additional properties/
        }
      ]

    }
  ]
}

