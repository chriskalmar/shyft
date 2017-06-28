
import {
  GraphQLInt,
} from 'graphql';

import {
  GraphQLCursor,
} from './dataTypes';

import { generateSortInput } from './sort';



export const generateConnectionsArgs = (entity) => {

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
