
import Entity from '../entity/Entity';
import { DataTypeString } from '../datatype/dataTypes';
import Index, { INDEX_UNIQUE } from '../index/Index';


export const Language = new Entity({
  name: 'Language',
  description: 'A language',

  indexes: [
    new Index({
      type: INDEX_UNIQUE,
      attributes: [ 'name' ],
    }),
    new Index({
      type: INDEX_UNIQUE,
      attributes: [ 'isoCode' ],
    }),
  ],

  attributes: {

    name: {
      type: DataTypeString,
      description: 'The name of the language',
      required: true
    },

    nativeName: {
      type: DataTypeString,
      description: 'The native name of the language',
      required: true
    },

    isoCode: {
      type: DataTypeString,
      description: 'ISO code of the language',
      required: true
    },
  }

})

