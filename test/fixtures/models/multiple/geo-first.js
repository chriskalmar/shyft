
'use strict';

module.exports = {

  domain: 'geo',

  entities: [

    {
      name: 'country',
      description: 'A country on our beautiful planet',

      attributes: [

        {
          name: 'name',
          type: 'text',
          description: 'The name of the country',
          minLength: 1
        },

        {
          name: 'iso_code',
          type: 'text',
          description: 'ISO code of the country',
          pattern: '^[a-z]+$',
          minLength: 3,
          maxLength: 3
        },

        {
          name: 'continent',
          type: 'reference',
          description: 'The continent where the country is located',
          target: 'geo::continent'
        }

      ],

      indexing: {
        unique: [
          [ 'name' ]
        ]
      }

    }
  ]
}
