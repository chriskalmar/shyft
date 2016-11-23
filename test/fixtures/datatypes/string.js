
'use strict';

module.exports = {

  valid: [
    {
      name: 'lorem',
      type: 'string',
      description: 'lorem ipsum'
    },
    {
      name: 'ipsum',
      type: 'string',
      description: 'lorem ipsum',
      required: true
    },
    {
      name: 'dolor',
      type: 'string',
      description: 'lorem ipsum',
      pattern: '^\d+$',
      required: true
    }
  ],


  invalid: [

    {
      setup: {
        type: 'string',
        description: 'lorem ipsum'
      },
      errors: [
        {
          reason: '"name" is missing',
          msg: /"missingProperty": "name"/
        }
      ]
    },

    {
      setup: {
        type: 'string',
        required: true
      },
      errors: [
        {
          reason: '"name" is missing',
          msg: /"missingProperty": "name"/
        },
        {
          reason: '"description" is missing',
          msg: /"missingProperty": "description"/
        }
      ]
    },

    {
      setup: {
        name: 'dolor',
        type: 'string',
        description: 'lorem ipsum',
        pattern: 123,
        required: 'some text'
      },
      errors: [
        {
          reason: '"required" is not a boolean',
          msg: /should be boolean/
        },
        {
          reason: '"pattern" is not a string',
          msg: /should be string/
        }
      ]

    }
  ]
}
