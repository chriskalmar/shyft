
import {
  dataTypes,
  Entity,
} from '../../../../';

import GeoContinent from './GeoContinent';

const {
  DataTypeString,
} = dataTypes



export const GeoCountry = new Entity({
  name: 'country',
  domain: 'geo',
  description: 'A country on our beautiful planet',

  attributes: {

    name: {
      type: DataTypeString,
      description: 'The name of the country',
      minLength: 1
    },

    isoCode: {
      type: DataTypeString,
      description: 'ISO code of the country',
      pattern: '^[a-z]+$',
      minLength: 3,
      maxLength: 3
    },

    continent: {
      type: GeoContinent,
      description: 'The continent where the country is located',
    }

  }
})
