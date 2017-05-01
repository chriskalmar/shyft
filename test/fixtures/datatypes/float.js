
export default {

  valid: [
    {
      name: 'lorem',
      type: 'float',
      description: 'lorem ipsum'
    },
    {
      name: 'ipsum',
      type: 'float',
      description: 'lorem ipsum',
      required: true
    },
    {
      name: 'dolor',
      type: 'float',
      description: 'lorem ipsum',
      minimum: 1,
      maximum: 10
    },
    {
      name: 'dolor',
      type: 'float',
      description: 'lorem ipsum',
      minimum: 1,
      maximum: 10,
      exclusiveMinimum: true,
      exclusiveMaximum: false
    }
  ],


  invalid: [

    {
      setup: {
        type: 'float',
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
        type: 'float',
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
        type: 'float',
        description: 'lorem ipsum',
        minimum: true,
        maximum: 'some text',
        exclusiveMinimum: 1,
        exclusiveMaximum: 1.2,
        required: 123,
        pattern: '.*'
      },
      errors: [
        {
          reason: '"minimum" is not a number',
          msg: /".minimum".*should be number/
        },
        {
          reason: '"maximum" is not a number',
          msg: /".maximum".*should be number/
        },
        {
          reason: '"exclusiveMinimum" is not a boolean',
          msg: /".exclusiveMinimum".*should be boolean/
        },
        {
          reason: '"exclusiveMaximum" is not a boolean',
          msg: /".exclusiveMaximum".*should be boolean/
        },
        {
          reason: '"required" is not a boolean',
          msg: /".required".*should be boolean/
        },
        {
          reason: '"pattern" is used',
          msg: /"pattern".*should NOT have additional properties/
        }
      ]

    }
  ]
}
