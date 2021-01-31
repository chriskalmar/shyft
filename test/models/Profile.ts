import {
  Entity,
  DataTypeString,
  DataTypeTimestampTz,
  Index,
  INDEX_UNIQUE,
  Mutation,
  MUTATION_TYPE_CREATE,
  Permission,
} from '../../src';

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
      attributes: ['username'],
    }),
  ],

  mutations: [
    new Mutation({
      name: 'signup',
      description: 'sign up a new user',
      type: MUTATION_TYPE_CREATE,
      attributes: ['username', 'password', 'firstname', 'lastname'],
      preProcessor({ input }) {
        /**
         * ATTENTION!
         * DO NOT COPY this very unsecure method of password hashing!
         * This is ONLY for testing purposes!
         */
        return {
          ...input,
          username: (<string>input.username).toLowerCase(),
          password: crypto
            .createHash('sha256')
            .update(<string>input.password, 'utf8')
            .digest('hex'),
        };
      },
    }),
  ],

  permissions: {
    read: Permission.AUTHENTICATED,
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
