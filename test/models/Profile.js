
import {
  Entity,
  DataTypeString,
  DataTypeTimestampTz,
  Index,
  INDEX_UNIQUE,
  Mutation,
  MUTATION_TYPE_CREATE,
  Permission,
} from 'shift-engine';

import crypto from 'crypto';


export const Profile = new Entity({
  name: 'Profile',
  domain: 'test',
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
      attributes: [
        'username',
        'password',
      ],
      preProcessor(entity, id, source, input) {
        input.username = input.username.toLowerCase()
        // do not copy this very unsecure method of password hashing (only for testing purposes)
        input.password = crypto.createHash('sha256').update(input.password, 'utf8').digest('hex')
        return input
      }
    }),
  ],


  permissions: {
    mutations: {
      create:
        new Permission()
          .role('admin'),
      update:
        new Permission()
          .role('admin'),
      delete:
        new Permission()
          .role('admin'),
    }
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

    avatar: {
      type: DataTypeString,
      description: 'Image identifier of the avatar',
    },

    registeredAt: {
      type: DataTypeTimestampTz,
      description: 'Time of user registration',
      required: true,
      defaultValue() {
        return new Date()
      },
    },

    confirmedAt: {
      type: DataTypeTimestampTz,
      description: 'Time of confirmation by the user',
      defaultValue() {
        return new Date()
      },
    },

  }
})

