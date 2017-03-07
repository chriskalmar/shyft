
'use script';

module.exports = {

  domain: 'core',

  entities: [

    {
      name: 'user',
      description: 'a user',

      isUserTable: true,
      cascadeOnDelete: true,

      attributes: [

        {
          name: 'username',
          type: 'string',
          description: 'Username',
          pattern: '^(?![_.])(?!.*[_.]{2})[a-zA-Z0-9._]+$',
          minLength: 3,
          maxLength: 30,
          required: true
        },

        {
          name: 'first_name',
          type: 'string',
          description: 'First name',
          maxLength: 30
        },

        {
          name: 'last_name',
          type: 'string',
          description: 'Last name',
          maxLength: 30
        },

        {
          name: 'language',
          type: 'reference',
          description: 'User language',
          target: 'core::language',
          required: true
        },

        {
          name: 'email',
          type: 'email',
          description: 'Email address',
          required: true
        },

        {
          name: 'password',
          type: 'password',
          description: 'User password',
          required: true
        }
      ],

      indexing: {
        unique: [
          [ 'username' ],
          [ 'email' ],
        ]
      }

    }

  ]

}
