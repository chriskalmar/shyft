import { GraphQLObjectType } from 'graphql';
import { Action, Entity, ViewEntity } from '..';

export interface GraphRegistryType {
  types: {
    [key: string]: {
      entity: Entity | ViewEntity;
      type: GraphQLObjectType;
      connection?: GraphQLObjectType;
      connectionArgs?: unknown;
    };
  };
  actions: {
    [key: string]: {
      action: Action;
    };
  };
}

// collect object types, connections ... for each entity
export const graphRegistry: GraphRegistryType = {
  types: {},
  actions: {},
};
