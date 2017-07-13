
import util from './util';
import _ from 'lodash';
import constants from './constants';
import ProtocolGraphQL from './ProtocolGraphQL';

import {
  isEntity,
} from 'shift-engine';

import {
  shaper,
} from 'json-shaper'

import {
  GraphQLObjectType,
  GraphQLSchema,
  GraphQLNonNull,
  GraphQLID,
} from 'graphql';

import {
  nodeDefinitions,
  fromGlobalId,
  toGlobalId,
} from 'graphql-relay';

import {
  generateConnectionArgs,
  validateConnectionArgs,
  forceSortByUnique,
  generateConnectionType,
  connectionFromData,
} from './connection';


// collect object types, connections ... for each entity
const graphRegistry = {}


// prepare models for graphql
const extendModelsForGql = (entities) => {

  _.forEach(entities, (entity) => {

    entity.graphql = entity.graphql || {}

    // generate type names for various cases
    entity.graphql.typeName = util.generateTypeName(entity.name)
    entity.graphql.typeNamePlural = util.generateTypeNamePlural(entity.name)
    entity.graphql.typeNamePascalCase = util.generateTypeNamePascalCase(entity.name)
    entity.graphql.typeNamePluralPascalCase = util.generateTypeNamePluralPascalCase(entity.name)


    const dataShaperMap = {}

    _.forEach(entity.getAttributes(), (attribute) => {
      attribute.gqlFieldName = _.camelCase(attribute.name)
      dataShaperMap[ attribute.gqlFieldName ] = attribute.name
    })

    // forward relay type promoter field as well
    dataShaperMap[ constants.RELAY_TYPE_PROMOTER_FIELD ] = constants.RELAY_TYPE_PROMOTER_FIELD

    // generate json shaper - translate schema attribute names to graphql attribute names
    const dataShaper = shaper(dataShaperMap)
    entity.graphql.dataShaper = dataShaper;
    entity.graphql.dataSetShaper = (set) => {
      return set.map(dataShaper)
    }

  })
}


// get node definitions for relay
const getNodeDefinitions = () => {

  const idFetcher = (globalId, context, info) => {
    const {
      type,
      id
    } = fromGlobalId(globalId);

    // resolve based on type and id
    const entity = graphRegistry[ type ]
      ? graphRegistry[ type ].entity
      : null


    if (entity) {
      const storageType = entity.storageType
      return storageType.findOne(entity, id, null, null, context, info, constants.RELAY_TYPE_PROMOTER_FIELD)
        .then(entity.graphql.dataShaper)
    }

    return null

  }


  const typeResolver = (obj) => {

    const type = util.generateTypeName( obj[ constants.RELAY_TYPE_PROMOTER_FIELD ] )

    // return the graphql type definition
    return graphRegistry[ type ]
      ? graphRegistry[ type ].type
      : null
  }


  return {
    ...nodeDefinitions(idFetcher, typeResolver),
    idFetcher,
  }
}



// register a new connection
const registerConnection = (entity) => {

  const typeName = entity.graphql.typeName
  const type = graphRegistry[ typeName ].type

  const { connectionType } = generateConnectionType({
    nodeType: type,
    entity,
  })

  const connectionArgs = generateConnectionArgs(entity, type)

  graphRegistry[ typeName ].connection = connectionType
  graphRegistry[ typeName ].connectionArgs = connectionArgs

}



const generateListQueries = () => {

  const listQueries = {}

  _.forEach(graphRegistry, ( { type, entity }, typeName) => {

    const storageType = entity.storageType

    const typeNamePlural = entity.graphql.typeNamePlural
    const typeNamePluralListName = entity.graphql.typeNamePluralPascalCase
    const queryName = _.camelCase(`all_${typeNamePlural}`)


    listQueries[ queryName ] = {
      type: graphRegistry[ typeName ].connection,
      description: `Fetch a list of **\`${typeNamePluralListName}\`**`,
      args: graphRegistry[ typeName ].connectionArgs,
      resolve: async (source, args, context, info) => {

        validateConnectionArgs(args)
        forceSortByUnique(args.orderBy, entity)

        const {
          data,
          pageInfo,
        } = await storageType.find(entity, source, args, context, info)

        const transformedData = entity.graphql.dataSetShaper(data)

        return connectionFromData(
          {
            transformedData,
            originalData: data,
          },
          entity,
          source,
          args,
          context,
          info,
          null,
          pageInfo,
        )
      },
    }
  })

  return listQueries
}



const generateInstanceQueries = () => {

  const instanceQueries = {}

  _.forEach(graphRegistry, ( { type, entity }, typeName) => {

    const storageType = entity.storageType

    const typeNamePascalCase = entity.graphql.typeNamePascalCase
    const queryName = typeName

    instanceQueries[ queryName ] = {
      type: type,
      description: `Fetch a single **\`${typeNamePascalCase}\`** using its node ID`,
      args: {
        id: {
          type: new GraphQLNonNull( GraphQLID )
        }
      },
      resolve: (source, args, context, info) => {
        return storageType.findOne(entity, args.id, source, args, context, info)
          .then(entity.graphql.dataShaper)
      },
    }


    // find the primary attribute and add a query for it
    const attributes = entity.getAttributes()
    const primaryAttributeName = _.findKey(attributes, { isPrimary: true })

    if (primaryAttributeName) {

      const primaryAttribute = attributes[ primaryAttributeName ]

      const fieldName = primaryAttribute.gqlFieldName
      const graphqlDataType = ProtocolGraphQL.convertToProtocolDataType(primaryAttribute.type)
      const queryNamePrimaryAttribute = _.camelCase(`${typeName}_by_${fieldName}`)

      instanceQueries[ queryNamePrimaryAttribute ] = {
        type: type,
        description: `Fetch a single **\`${typeNamePascalCase}\`** using its **\`${fieldName}\`**`,
        args: {
          [ fieldName ]: {
            type: new GraphQLNonNull( graphqlDataType )
          }
        },
        resolve: (source, args, context, info) => {
          return storageType.findOne(entity, args[ fieldName ], source, args, context, info)
            .then(entity.graphql.dataShaper)
        },
      }
    }

  })

  return instanceQueries
}



const generateReverseConnections = (entity) => {

  const fields = {}

  const typeName = entity.graphql.typeName
  const typeNamePascalCase = entity.graphql.typeNamePascalCase

  entity.referencedByEntities.map(({sourceEntityName, sourceAttributeName}) => {

    const sourceEntityTypeName = util.generateTypeName(sourceEntityName)
    const sourceType = graphRegistry[ sourceEntityTypeName ]
    const sourceEntity = sourceType.entity

    const storageType = sourceEntity.storageType

    const fieldName = util.generateTypeName(`${sourceEntity.graphql.typeNamePlural}-by-${typeName}`)

    const typeNamePluralListName = sourceEntity.graphql.typeNamePluralPascalCase

    fields[ fieldName ] = {
      type: graphRegistry[ sourceEntityTypeName ].connection,
      description: `Fetch a list of **\`${typeNamePluralListName}\`** for a given **\`${typeNamePascalCase}\`**`,
      args: graphRegistry[ sourceEntityTypeName ].connectionArgs,
      resolve: async (source, args, context, info) => {

        validateConnectionArgs(args)
        forceSortByUnique(args.orderBy, sourceEntity)

        const parentEntityTypeName = util.generateTypeName(info.parentType.name)
        const parentEntity = graphRegistry[ parentEntityTypeName ].entity
        const parentAttribute = parentEntity.getPrimaryAttribute()

        const parentConnection = {
          id: source[ parentAttribute.gqlFieldName ],
          attribute: sourceAttributeName
        }


        const {
          data,
          pageInfo,
        } = await storageType.find(sourceEntity, source, args, context, info, parentConnection)

        const transformedData = sourceEntity.graphql.dataSetShaper(data)

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



export const generateGraphQLSchema = (schema) => {

  const {
    nodeInterface,
    nodeField,
    idFetcher,
  } = getNodeDefinitions()

  // prepare models for graphql
  extendModelsForGql(schema.getEntities())


  _.forEach(schema.getEntities(), (entity) => {

    const typeName = entity.graphql.typeName

    const storageType = entity.storageType

    const objectType = new GraphQLObjectType({

      name: entity.graphql.typeNamePascalCase,
      description: entity.description,
      interfaces: [ nodeInterface ],

      fields: () => {
        const fields = {
          id: {
            type: new GraphQLNonNull(GraphQLID),
          },
          nodeId: {
            description: 'The node ID of an object',
            type: new GraphQLNonNull(GraphQLID),
            resolve: (obj) => toGlobalId(
              typeName,
              obj.id
            )
          }
        }

        _.forEach(entity.getAttributes(), (attribute) => {

          const field = {
            description: attribute.description,
          };

          let attributeType = attribute.type

          // it's a reference
          if (isEntity(attributeType)) {

            const targetEntity = attributeType
            const primaryAttribute = targetEntity.getPrimaryAttribute()
            attributeType = primaryAttribute.type

            const reference = {
              description: attribute.description,
            };

            const targetTypeName = targetEntity.graphql.typeName

            reference.type = graphRegistry[ targetTypeName ].type
            reference.resolve = (source, args, context, info) => {
              const referenceId = source[ attribute.gqlFieldName ]

              if (referenceId === null) {
                return Promise.resolve(null)
              }

              return storageType.findOne(targetEntity, referenceId, source, args, context, info)
                .then(targetEntity.graphql.dataShaper)
            }

            const referenceFieldName = util.generateTypeName(`${reference.type.name}-by-${attribute.gqlFieldName}`)
            fields[ referenceFieldName ] = reference;

          }

          const fieldType = ProtocolGraphQL.convertToProtocolDataType(attributeType)

          // make it non-nullable if it's required
          if (attribute.required) {
            field.type = new GraphQLNonNull(fieldType)
          }
          else {
            field.type = fieldType
          }

          // use computed value's function as the field resolver
          if (attribute.resolve) {
            field.resolve = attribute.resolve
          }

          fields[ attribute.gqlFieldName ] = field;

        });

        Object.assign(fields, generateReverseConnections(entity))

        return fields
      }
    })

    graphRegistry[ typeName ] = {
      entity,
      type: objectType
    }

    registerConnection(entity)
  })



  // build the query type
  const queryType = new GraphQLObjectType({
    name: 'Query',
    root: 'The root query type',

    fields: () => {

      const listQueries = generateListQueries()
      const instanceQueries = generateInstanceQueries()

      // override args.id of relay to args.nodeId
      nodeField.args.nodeId = nodeField.args.id
      nodeField.resolve = (obj, { nodeId }, context, info) => idFetcher(nodeId, context, info)
      delete nodeField.args.id;

      return {
        node: nodeField,
        ...instanceQueries,
        ...listQueries,
      };
    },
  });



  // put it all together into a graphQL schema
  return new GraphQLSchema({
    query: queryType,
  });
}


export default {
  generateGraphQLSchema
}
