
export default {

  valid: [
    {
      name: 'lorem',
      type: 'time',
      description: 'lorem ipsum'
    },
    {
      name: 'ipsum',
      type: 'time',
      description: 'lorem ipsum',
      required: true
    }
  ],


  invalid: [

    {
      setup: {
        type: 'time',
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
        type: 'time',
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
        type: 'time',
        description: 'lorem ipsum',
        required: 'some text',
        maximum: 123
      },
      errors: [
        {
          reason: '"required" is not a boolean',
          msg: /".required".*should be boolean/
        },
        {
          reason: '"maximum" is used',
          msg: /"maximum".*should NOT have additional properties/
        }
      ]

    }
  ]
}

