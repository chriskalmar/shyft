
import {
  Entity,
  DataTypeString,
} from 'shift-engine';

import { Cluster } from './Cluster';


export const Server = new Entity({
  name: 'Server',
  domain: 'test',
  description: 'A server',

  attributes: {

    cluster: {
      type: Cluster,
      description: 'Server cluster',
      required: true,
    },

    name: {
      type: DataTypeString,
      description: 'Server name',
      required: true,
    },

    ip: {
      type: DataTypeString,
      description: 'IP of server',
      required: true,
    },

  }
})

