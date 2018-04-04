
import {
  addRelayTypePromoterToInstanceFn,
} from './util';
import _ from 'lodash';
import constants from './constants';
import ProtocolGraphQL from './ProtocolGraphQL';

import {
  isEntity,
  isConfiguration,
  ACTION_TYPE_QUERY,
  ACTION_TYPE_MUTATION,
  DataTypeI18n,
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
  registerConnection,
  generateReverseConnections,
} from './connection';

import {
  generateListQueries,
  generateInstanceQueries,
} from './query';

import {
  generateMutations,
} from './mutation';

import {
  generateActions,
} from './action';



// collect object types, connections ... for each entity
const graphRegistry = {
  types: {},
  actions: {},
}


// prepare models for graphql
export const extendModelsForGql = (entities) => {

  const protocolConfiguration = ProtocolGraphQL.getProtocolConfiguration()

  _.forEach(entities, (entity) => {

    entity.graphql = entity.graphql || {}
    // generate type names for various cases
    entity.graphql.typeName = protocolConfiguration.generateEntityTypeName(entity)
    entity.graphql.typeNamePlural = protocolConfiguration.generateEntityTypeNamePlural(entity)
    entity.graphql.typeNamePascalCase = protocolConfiguration.generateEntityTypeNamePascalCase(entity)
    entity.graphql.typeNamePluralPascalCase = protocolConfiguration.generateEntityTypeNamePluralPascalCase(entity)


    const dataShaperMap = {}

    _.forEach(entity.getAttributes(), (attribute) => {
      attribute.gqlFieldName = attribute.isPrimary
        ? 'id'
        : protocolConfiguration.generateFieldName(attribute)

      dataShaperMap[ attribute.gqlFieldName ] = attribute.name

      if (attribute.i18n) {
        attribute.gqlFieldNameI18n = protocolConfiguration.generateI18nFieldName(attribute)
        dataShaperMap[ attribute.gqlFieldNameI18n ] = `${attribute.name}.i18n`

        attribute.gqlFieldNameI18nJson = protocolConfiguration.generateI18nJsonFieldName(attribute)
        dataShaperMap[ attribute.gqlFieldNameI18nJson ] = `${attribute.name}.i18n`
      }
    })

    // forward relay type promoter field as well
    dataShaperMap[ constants.RELAY_TYPE_PROMOTER_FIELD ] = constants.RELAY_TYPE_PROMOTER_FIELD

    // generate json shaper - translate schema attribute names to graphql attribute names
    const dataShaper = shaper(dataShaperMap)
    entity.graphql.dataShaper = (data) => {
      return data ? dataShaper(data) : data
    }
    entity.graphql.dataSetShaper = (set) => {
      return set.map(entity.graphql.dataShaper)
    }

    // remove i18n JSON output mapping so it doesn't overwrite values in mutation inputs
    _.forEach(entity.getAttributes(), (attribute) => {
      if (attribute.i18n) {
        delete dataShaperMap[ attribute.gqlFieldNameI18nJson ]
      }
    })

    const reverseDataShaper = shaper(_.invert(dataShaperMap))
    entity.graphql.reverseDataShaper = (data) => {
      return data ? reverseDataShaper(data) : data
    }

  })
}


// get node definitions for relay
const getNodeDefinitions = () => {

  const protocolConfiguration = ProtocolGraphQL.getProtocolConfiguration()

  const idFetcher = (globalId, context) => {
    const {
      type,
      id
    } = fromGlobalId(globalId);

    // resolve based on type and id
    const entity = graphRegistry.types[ type ]
      ? graphRegistry.types[ type ].entity
      : null


    if (entity) {
      const storageType = entity.storageType
      return storageType.findOne(entity, id, null, context)
        .then(
          addRelayTypePromoterToInstanceFn(
            protocolConfiguration.generateEntityTypeName(entity)
          )
        )
        .then(entity.graphql.dataShaper)
    }

    return null

  }


  const typeResolver = (obj) => {
    const typeName = obj[constants.RELAY_TYPE_PROMOTER_FIELD]

    return graphRegistry.types[typeName]
      ? graphRegistry.types[typeName].type
      : null
  }


  return {
    ...nodeDefinitions(idFetcher, typeResolver),
    idFetcher,
  }
}



const registerAction = (action) => {
  const actionName = action.name
  graphRegistry.actions[ actionName ] = {
    action
  }
}


export const registerActions = (actions) => {
  _.forEach(actions, (action) => registerAction(action))
}



export const generateGraphQLSchema = (configuration) => {

  if (!isConfiguration(configuration)) {
    throw new Error('Invalid configuration object provided to generateGraphQLSchema()')
  }

  const schema = configuration.getSchema()
  const protocolConfiguration = configuration.getProtocolConfiguration()

  ProtocolGraphQL.setProtocolConfiguration(protocolConfiguration)

  const {
    nodeInterface,
    nodeField,
    idFetcher,
  } = getNodeDefinitions()

  registerActions(schema.getActions())

  // prepare models for graphql
  extendModelsForGql(schema.getEntities())

  _.forEach(schema.getEntities(), (entity) => {

    const typeName = entity.graphql.typeName

    const storageType = entity.storageType

    const objectType = new GraphQLObjectType({
      name: protocolConfiguration.generateEntityTypeNamePascalCase(entity),
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

          if (attribute.hidden) {
            return
          }

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

            reference.type = graphRegistry.types[ targetTypeName ].type
            reference.resolve = (source, args, context) => {
              const referenceId = source[ attribute.gqlFieldName ]

              if (referenceId === null) {
                return Promise.resolve(null)
              }

              return storageType.findOne(targetEntity, referenceId, args, context)
                .then(
                  addRelayTypePromoterToInstanceFn(
                    protocolConfiguration.generateEntityTypeName(targetEntity)
                  )
                )
                .then(targetEntity.graphql.dataShaper)
            }

            const referenceFieldName = protocolConfiguration.generateReferenceFieldName(targetEntity, attribute)
            fields[ referenceFieldName ] = reference;

          }

          const fieldType = ProtocolGraphQL.convertToProtocolDataType(attributeType, entity.name, false)

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

          if (attribute.i18n) {

            // JSON i18n output
            const i18nJsonFieldType = ProtocolGraphQL.convertToProtocolDataType(DataTypeI18n, entity.name, false)

            const i18nJsonField = {
              type: attribute.required
                ? new GraphQLNonNull(i18nJsonFieldType)
                : i18nJsonFieldType,
              description: `Translations of **\`${attribute.gqlFieldName}\`** in JSON format`,
            }

            fields[ attribute.gqlFieldNameI18nJson ] = i18nJsonField;


            // Object Type i18n output
            const i18nFieldType = new GraphQLObjectType({
              name: protocolConfiguration.generateI18nFieldTypeName(entity, attribute),
              description: `Translations of **\`${attribute.gqlFieldName}\`**`,

              fields: () => {
                const languages = configuration.getLanguageCodes()
                const i18nFields = {}

                languages.map((language, idx) => {
                  const type = (idx === 0 && attribute.required)
                    ? new GraphQLNonNull(fieldType)
                    : fieldType

                  i18nFields[ language ] = {
                    type,
                  }
                })

                return i18nFields
              }
            })

            fields[ attribute.gqlFieldNameI18n ] = {
              type: attribute.required
                ? new GraphQLNonNull(i18nFieldType)
                : i18nFieldType
            };
          }
        });

        Object.assign(fields, generateReverseConnections(configuration, graphRegistry, entity))

        return fields
      }
    })

    graphRegistry.types[ typeName ] = {
      entity,
      type: objectType
    }

    registerConnection(graphRegistry, entity)
  })



  // build the query type
  const queryType = new GraphQLObjectType({
    name: 'Query',
    root: 'The root query type',

    fields: () => {

      const listQueries = generateListQueries(graphRegistry)
      const instanceQueries = generateInstanceQueries(graphRegistry, idFetcher)
      const actions = generateActions(graphRegistry, ACTION_TYPE_QUERY)

      // override args.id of relay to args.nodeId
      nodeField.args.nodeId = nodeField.args.id
      nodeField.resolve = (obj, { nodeId }, context, info) => idFetcher(nodeId, context, info)
      delete nodeField.args.id;

      return {
        node: nodeField,
        ...instanceQueries,
        ...listQueries,
        ...actions,
      };
    },
  });



  const mutationType = new GraphQLObjectType({
    name: 'Mutation',
    root: 'The root mutation type',

    fields: () => {

      const mutations = generateMutations(graphRegistry)
      const actions = generateActions(graphRegistry, ACTION_TYPE_MUTATION)

      return {
        ...mutations,
        ...actions,
      };
    },
  });



  // put it all together into a graphQL schema
  return new GraphQLSchema({
    query: queryType,
    mutation: mutationType,
  });
}


export default {
  generateGraphQLSchema
}
