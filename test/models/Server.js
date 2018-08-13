import { Entity, DataTypeString } from 'shift-engine';

import { ClusterZone } from './ClusterZone';

export const Server = new Entity({
  name: 'Server',
  description: 'A server',

  attributes: {
    clusterZone: {
      type: ClusterZone,
      description: 'Server cluster zone',
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
  },
});
