
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

import {
  addRelayTypePromoterToList,
} from './util';

import {
  transformFilterLevel,
} from './filter';

import ProtocolGraphQL from './ProtocolGraphQL';
import constants from './constants';
import { generateSortInput } from './sort';
import { generateFilterInput } from './filter';

import _ from 'lodash';


export const generateConnectionArgs = (entity, type) => {

  const sortInput = generateSortInput(entity)
  const filterInput = generateFilterInput(entity, type)

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

    offset: {
      type: GraphQLInt
    },

    orderBy: {
      ...sortInput
    },

    filter: {
      ...filterInput
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

  if (args.offset && args.offset < 0) {
    throw new Error('`offset` needs to be an integer starting from 0')
  }

}


export const forceSortByUnique = (orderBy, entity) => {

  const attributes = entity.getAttributes()
  let foundUnique = false

  orderBy.map(({ attribute }) => {
    const { isUnique } = attributes[ attribute ]
    if (isUnique) {
      foundUnique = true
    }
  })

  if (!foundUnique) {
    const primaryAttribute = entity.getPrimaryAttribute()
    orderBy.push({
      attribute: primaryAttribute.name,
      direction: 'ASC',
    })
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


export const connectionFromData = ({transformedData, originalData}, entity, source, args, context, info, parentConnection, pageInfoFromData) => {

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
      return await storageType.count(entity, args, context, parentConnection)
    },
    pageInfo: {
      startCursor: firstNode ? firstNode.cursor : null,
      endCursor: lastNode ? lastNode.cursor : null,
      hasPreviousPage: pageInfoFromData.hasPreviousPage,
      hasNextPage: pageInfoFromData.hasNextPage,
    },
  }
}



export const registerConnection = (graphRegistry, entity) => {

  const typeName = entity.graphql.typeName
  const type = graphRegistry.types[typeName].type

  const { connectionType } = generateConnectionType({
    nodeType: type,
    entity,
  })

  const connectionArgs = generateConnectionArgs(entity, type)

  graphRegistry.types[typeName].connection = connectionType
  graphRegistry.types[typeName].connectionArgs = connectionArgs

}


export const generateReverseConnections = (configuration, graphRegistry, entity) => {

  const schema = configuration.getSchema()
  const schemaEntities = schema.getEntities()
  const protocolConfiguration = ProtocolGraphQL.getProtocolConfiguration()

  const fields = {}

  const typeNamePascalCase = entity.graphql.typeNamePascalCase

  entity.referencedByEntities.map(({ sourceEntityName, sourceAttributeName }) => {

    const sourceEntity = schemaEntities[sourceEntityName]
    if (!sourceEntity) {
      throw new Error(`Failed to create reverse connection for entity '${sourceEntityName}' as it was not found`)
    }

    const sourceEntityTypeName = protocolConfiguration.generateEntityTypeName(sourceEntity)

    const storageType = sourceEntity.storageType

    const fieldName = protocolConfiguration.generateReverseConnectionFieldName(sourceEntity, sourceAttributeName)

    const typeNamePluralListName = sourceEntity.graphql.typeNamePluralPascalCase

    fields[fieldName] = {
      type: graphRegistry.types[sourceEntityTypeName].connection,
      description: `Fetch a list of **\`${typeNamePluralListName}\`** for a given **\`${typeNamePascalCase}\`**\n${sourceEntity.descriptionPermissionsFind || ''}`,
      args: graphRegistry.types[sourceEntityTypeName].connectionArgs,
      resolve: async (source, args, context, info) => {

        validateConnectionArgs(args)
        forceSortByUnique(args.orderBy, sourceEntity)
        args.filter = transformFilterLevel(args.filter, entity.getAttributes())

        const parentEntityTypeName = protocolConfiguration.generateEntityTypeName(info.parentType)
        const parentEntity = graphRegistry.types[parentEntityTypeName].entity
        const parentAttribute = parentEntity.getPrimaryAttribute()

        const parentConnection = {
          id: source[parentAttribute.gqlFieldName],
          attribute: sourceAttributeName
        }


        const {
          data,
          pageInfo,
        } = await storageType.find(sourceEntity, args, context, parentConnection)

        const transformedData = sourceEntity.graphql.dataSetShaper(
          addRelayTypePromoterToList(
            protocolConfiguration.generateEntityTypeName(sourceEntity),
            data
          )
        )

        return connectionFromData(
          {
            transformedData,
            originalData: data,
          },
          sourceEntity,
          source,
          args,
          context,
          info,
          parentConnection,
          pageInfo,
        )
      },
    }

  })

  return fields
}

