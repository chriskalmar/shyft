import { Entity, DataTypeString } from 'shyft';

export const ClusterZone = new Entity({
  name: 'ClusterZone',
  description: 'A server cluster zone',

  attributes: {
    name: {
      type: DataTypeString,
      description: 'Cluster zone name',
      required: true,
    },
  },
});
