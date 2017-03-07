
'use script';

module.exports = {

  domain: 'core',

  entities: [

    {
      name: 'language',
      description: 'a language',

      cascadeOnDelete: true,

      attributes: [

        {
          name: 'name',
          type: 'string',
          description: 'Name',
          maxLength: 30,
          required: true
        },

        {
          name: 'native_name',
          type: 'string',
          description: 'Name',
          maxLength: 30,
          required: true
        },

        {
          name: 'iso_code',
          type: 'string',
          description: 'ISO 639-1 code of the language',
          maxLength: 2,
          required: true
        },

      ],

      indexing: {
        unique: [
          [ 'name' ],
          [ 'iso_code' ],
        ]
      }

    }

  ]

}
