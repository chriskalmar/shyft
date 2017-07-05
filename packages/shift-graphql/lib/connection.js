
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

import _ from 'lodash';


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


export const validateConnectionArgs = (args) => {
  if (args.first >= 0 && args.last >= 0) {
    throw new Error('`first` and `last` settings are mutual exclusive')
  }

  if (args.first && (args.first < 0 || args.first > constants.MAX_PAGE_SIZE)) {
    throw new Error('`first` needs to be within the range of 0 and ' + constants.MAX_PAGE_SIZE)
  }

  if (args.last && (args.last < 0 || args.last > constants.MAX_PAGE_SIZE)) {
    throw new Error('`last` needs to be within the range of 0 and ' + constants.MAX_PAGE_SIZE)
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

  const {
    nodeType,
    entity,
  } = config

  const name = config.name || nodeType.name;

  const typeNamePluralListName = entity.graphql.typeNamePluralPascalCase

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
      totalCount: {
        type: GraphQLInt,
        description: `The count of all **\`${typeNamePluralListName}\`** you could get from the connection.`,
      },
      resultCount: {
        type: GraphQLInt,
        description: `The count of **\`${typeNamePluralListName}\`** in this result set.`,
        resolve: ({ edges }) => edges.length
      },
    }),
  });

  return {
    edgeType,
    connectionType,
  }

}


export const buildCursor = (entityName, primaryAttributeName, args, data ) => {

  const cursor = []
  let primaryAttributeAdded = false

  if (args && args.orderBy) {
    args.orderBy.map(({ attribute }) => {
      cursor.push([
        attribute,
        data[ attribute ],
      ])

      if (attribute === primaryAttributeName) {
        primaryAttributeAdded = true
      }
    })
  }

  if (!primaryAttributeAdded) {
    cursor.push([
      primaryAttributeName,
      data[ primaryAttributeName ],
    ])
  }

  return {
    [ entityName ]: cursor
  }
}


export const connectionFromData = ({transformedData, originalData}, entity, source, args, context, info, pageInfoFromData) => {

  const entityName = entity.name
  const primaryAttributeName = entity.getPrimaryAttribute().name

  const nodeToEdge = (node, idx) => ({
    cursor: buildCursor(entityName, primaryAttributeName, args, originalData[idx]),
    node,
  });

  const edges = transformedData.map(nodeToEdge)

  const firstNode = _.first(edges)
  const lastNode = _.last(edges)

  return {
    edges,
    totalCount: async () => {
      const storageType = entity.storageType
      return await storageType.count(entity, source, args, context)
    },
    pageInfo: {
      startCursor: firstNode ? firstNode.cursor : null,
      endCursor: lastNode ? lastNode.cursor : null,
      hasPreviousPage: pageInfoFromData.hasPreviousPage,
      hasNextPage: pageInfoFromData.hasNextPage,
    },
  }
}
