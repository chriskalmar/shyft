
export default {

  valid: [
    {
      name: 'lorem',
      type: 'bigint',
      description: 'lorem ipsum'
    },
    {
      name: 'ipsum',
      type: 'bigint',
      description: 'lorem ipsum',
      required: true
    }
  ],


  invalid: [

    {
      setup: {
        type: 'bigint',
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
        type: 'bigint',
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
        type: 'bigint',
        description: 'lorem ipsum',
        required: 123,
        pattern: '.*'
      },
      errors: [
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
