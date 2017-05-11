
import Entity from '../entity/Entity';
import { DataTypeString } from '../datatype/dataTypes';


export const Language = new Entity({
  name: 'Language',
  domain: 'core',
  description: 'A language',

  // indexing: {
  //   unique: [
  //     [ 'name' ],
  //     [ 'iso_code' ],

  attributes: {

    name: {
      type: DataTypeString,
      description: 'The name of the language',
      maxLength: 30,
      required: true
    },

    nativeName: {
      type: DataTypeString,
      description: 'The native name of the language',
      maxLength: 30,
      required: true
    },

    isoCode: {
      type: DataTypeString,
      description: 'ISO code of the language',
      pattern: '^[a-z]+$',
      minLength: 2,
      maxLength: 2,
      required: true
    },
  }

})

