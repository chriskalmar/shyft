import {
  Entity,
  DataTypeString,
  DataTypeTimestampTz,
  Index,
  INDEX_UNIQUE,
  Mutation,
  MUTATION_TYPE_CREATE,
  Permission,
} from 'shyft';

import crypto from 'crypto';

const readPermissions = [
  new Permission().role('admin'),
  // new Permission()
  //   .userAttribute('id'),
];

export const Profile = new Entity({
  name: 'Profile',
  description: 'A user profile',

  isUserEntity: true,

  includeUserTracking: true,
  includeTimeTracking: true,

  indexes: [
    new Index({
      type: INDEX_UNIQUE,
      attributes: [ 'username' ],
    }),
  ],

  mutations: [
    new Mutation({
      name: 'signup',
      description: 'sign up a new user',
      type: MUTATION_TYPE_CREATE,
      attributes: [ 'username', 'password', 'firstname', 'lastname' ],
      preProcessor(entity, id, source, input) {
        input.username = input.username.toLowerCase();
        // do not copy this very unsecure method of password hashing (only for testing purposes)
        input.password = crypto
          .createHash('sha256')
          .update(input.password, 'utf8')
          .digest('hex');
        return input;
      },
    }),
  ],

  permissions: {
    read: readPermissions,
    find: readPermissions,
    mutations: {
      signup: Permission.EVERYONE,
    },
  },

  attributes: {
    username: {
      type: DataTypeString,
      description: 'Username',
      required: true,
    },

    password: {
      type: DataTypeString,
      description: 'The password of the user',
      required: true,
      hidden: true,
    },

    firstname: {
      type: DataTypeString,
      description: 'First name',
      required: true,
    },

    lastname: {
      type: DataTypeString,
      description: 'Last name',
      required: true,
    },

    registeredAt: {
      type: DataTypeTimestampTz,
      description: 'Time of user registration',
      required: true,
      defaultValue() {
        return new Date();
      },
    },

    confirmedAt: {
      type: DataTypeTimestampTz,
      description: 'Time of confirmation by the user',
      defaultValue() {
        return new Date();
      },
    },
  },
});
