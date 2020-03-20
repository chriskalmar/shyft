import { Entity } from '../entity/Entity';
import { DataTypeString } from '../datatype/dataTypes';
import { Index, INDEX_UNIQUE } from '../index/Index';

import { Language } from './Language';

export const User = new Entity({
  name: 'User',
  description: 'A user',

  // isUserTable: true,
  // sequenceGenerator: 'timebased',

  indexes: [
    new Index({
      type: INDEX_UNIQUE,
      attributes: [ 'username' ],
    }),
    new Index({
      type: INDEX_UNIQUE,
      attributes: [ 'email' ],
    }),
  ],

  attributes: {
    username: {
      type: DataTypeString,
      description: 'Username',
      required: true,
    },

    firstName: {
      type: DataTypeString,
      description: 'First name',
    },

    lastName: {
      type: DataTypeString,
      description: 'Last name',
    },

    language: {
      type: Language,
      description: 'User language',
      required: true,
    },

    email: {
      type: DataTypeString,
      description: 'Email address',
      required: true,
    },

    password: {
      type: DataTypeString,
      description: 'User password',
      required: true,
    },
  },
});
