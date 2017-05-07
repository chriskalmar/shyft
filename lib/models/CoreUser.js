
import {
  datatypes,
  Entity,
} from '../../';

import CoreLanguage from './CoreLanguage';

const {
  DataTypeString,
} = datatypes

export const CoreUser = new Entity({
  name: 'user',
  domain: 'core',
  description: 'A user',

  // isUserTable: true,
  // sequenceGenerator: 'timebased',

  // indexing: {
  //   unique: [
  //     [ 'username' ],
  //     [ 'email' ],


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
      type: CoreLanguage,
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



