
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
      errorContent: [
        /"missingProperty": "name"/
      ]
    },
    {
      setup: {
        type: 'string',
        required: true
      },
      errorContent: [
        /"missingProperty": "name"/,
        /"missingProperty": "description"/
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
      errorContent: [
        /should be boolean/,
        /should be string/
      ]
    }
  ]
}
