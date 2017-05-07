
import {
  datatypes,
  Entity,
} from '../../../../';

const {
  DataTypeString,
} = datatypes


export const GeoContinent = new Entity({
  name: 'continent',
  domain: 'geo',
  description: 'A continent on our beautiful planet',

  attributes: {

    name: {
      type: DataTypeString,
      description: 'The name of the continent',
      minLength: 1
    },

    iso_code: {
      type: DataTypeString,
      description: 'ISO code of the country',
      pattern: '^[a-z]+$',
      minLength: 3,
      maxLength: 3
    }

  }
})
