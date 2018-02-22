
import {
  Entity,
  DataTypeString,
} from 'shift-engine';


export const Cluster = new Entity({
  name: 'Cluster',
  domain: 'test',
  description: 'A server cluster',

  attributes: {

    name: {
      type: DataTypeString,
      description: 'Cluster name',
      required: true,
    },

  }
})

