
import Entity from '../entity/Entity';
import { DataTypeString } from '../datatype/dataTypes';
import Index, { INDEX_UNIQUE } from '../index/Index';

import { Language } from './Language';


export const User = new Entity({
  name: 'User',
  domain: 'core',
  description: 'A user',

  // isUserTable: true,
  // sequenceGenerator: 'timebased',

  indexing: [
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
      pattern: '^(?![_.])(?!.*[_.]{2})[a-zA-Z0-9._]+$',
      minLength: 3,
      maxLength: 30,
      required: true
    },

    firstName: {
      type: DataTypeString,
      description: 'First name',
      maxLength: 30
    },

    lastName: {
      type: DataTypeString,
      description: 'Last name',
      maxLength: 30
    },

    language: {
      type: Language,
      description: 'User language',
      required: true
    },

    email: {
      type: DataTypeString,
      description: 'Email address',
      required: true
    },

    password: {
      type: DataTypeString,
      description: 'User password',
      required: true
    }
  }

})



