
import {
  GraphQLInt,
  GraphQLObjectType,
  GraphQLNonNull,
  GraphQLList,
  GraphQLBoolean,
} from 'graphql';

import {
  GraphQLCursor,
} from './dataTypes';

import constants from './constants';

import { generateSortInput } from './sort';



export const generateConnectionArgs = (entity) => {

  const sortInput = generateSortInput(entity)

  return {

    first: {
      type: GraphQLInt
    },
    after: {
      type: GraphQLCursor
    },

    last: {
      type: GraphQLInt
    },
    before: {
      type: GraphQLCursor
    },

    orderBy: {
      ...sortInput
    }
  }
}


const pageInfoType = new GraphQLObjectType({
  name: 'PageInfo',
  description: 'Information about pagination in a connection.',
  fields: () => ({
    hasNextPage: {
      type: new GraphQLNonNull(GraphQLBoolean),
      description: 'When paginating forwards, are there more items?'
    },
    hasPreviousPage: {
      type: new GraphQLNonNull(GraphQLBoolean),
      description: 'When paginating backwards, are there more items?'
    },
    startCursor: {
      type: GraphQLCursor,
      description: 'When paginating backwards, the cursor to continue.'
    },
    endCursor: {
      type: GraphQLCursor,
      description: 'When paginating forwards, the cursor to continue.'
    },
  })
});


export const generateConnectionType = (config) => {

  const { nodeType } = config
  const name = config.name || nodeType.name;

  const edgeType = new GraphQLObjectType({
    name: `${name}Edge`,
    description: 'An edge in a connection.',
    fields: () => ({
      node: {
        type: nodeType,
        description: 'The item at the end of the edge',
      },
      cursor: {
        type: new GraphQLNonNull(GraphQLCursor),
        description: 'A cursor for use in pagination'
      },
    }),
  });

  const connectionType = new GraphQLObjectType({
    name: name + 'Connection',
    description: 'A connection to a list of items.',
    fields: () => ({
      pageInfo: {
        type: new GraphQLNonNull(pageInfoType),
        description: 'Information to aid in pagination.'
      },
      edges: {
        type: new GraphQLList(edgeType),
        description: 'A list of edges.'
      },
    }),
  });

  return {
    edgeType,
    connectionType,
  }

}
