
import util from './util';
import datatype from './datatype';
import _ from 'lodash';
import constants from './constants';

import {
  engine,
  registry,
} from 'shift-engine';

import {
  GraphQLObjectType,
  GraphQLSchema,
  GraphQLNonNull,
  GraphQLID,
} from 'graphql';

import {
  globalIdField,
  nodeDefinitions,
  fromGlobalId,
  connectionDefinitions,
  connectionFromPromisedArray,
  connectionArgs,
} from 'graphql-relay';



// collect object types, connections ... for each entity
const graphRegistry = {}


// get node definitions for relay
const getNodeDefinitions = (resolverMap) => {

  return nodeDefinitions(

    (globalId) => {

      const {
        type,
        id
      } = fromGlobalId(globalId);

      // resolve based on type and id
      return resolverMap.findById(type, id)
    },

    (obj) => {

      const type = obj[ constants.RELAY_TYPE_PROMOTER_FIELD ]

      // return the graphql type definition
      return graphRegistry[ type ]
        ? graphRegistry[ type ].type
        : null
    }
  );
}



// fix relay ID field collisions
const fixRelayNodeIdNameCollision = (entityModel) => {

  entityModel.attributes.map( (attribute) => {

    // name collision with relay ID field
    if (attribute.name === constants.RELAY_ID_FIELD) {
      attribute.name = constants.FALLBACK_ID_FIELD
    }
  })
}



// register a new connection
const registerConnection = (entityModel) => {

  const typeName = util.generateTypeName(entityModel)

  const { connectionType } = connectionDefinitions({
    nodeType: graphRegistry[ typeName ].type
  })

  graphRegistry[ typeName ].connection = connectionType

}



// generate a graphQL schema from shift entity models
export const generateGraphQLSchema = (entityModels, resolverMap) => {

  const {
    nodeInterface,
    nodeField,
  } = getNodeDefinitions(resolverMap)


  entityModels.map( (entityModel) => {

    fixRelayNodeIdNameCollision(entityModel)

    const typeName = util.generateTypeName(entityModel)

    const objectType = new GraphQLObjectType({

      name: util.generateTypeNameUpperCase(entityModel),
      description: entityModel.description,
      interfaces: [nodeInterface],

      fields: () => {
        const fields = {
          id: globalIdField(typeName)
        }

        entityModel.attributes.map( (attribute) => {

          const field = {
            description: attribute.description,
          };


          // it's a reference
          if (attribute.target) {
            const targetStructurePath = engine.convertTargetToPath(attribute.target, entityModel.domain, entityModel.provider)
            const targetEntityModel = registry.getProviderEntityModelFromPath(targetStructurePath)
            const targetTypeName = util.generateTypeName(targetEntityModel)

            field.type = graphRegistry[ targetTypeName ].type
            field.resolve = (source, args, context, info) => {
              const referenceId = source[ attribute.name ]
              return resolverMap.findById(targetEntityModel, referenceId, source, args, context, info)
            }

          }
          // it's a regular attribute
          else {
            field.type = datatype.convertDataTypeToGraphQL(attribute.type)
          }

          // make it non-nullable if it's required
          if (attribute.required) {
            field.type = new GraphQLNonNull(field.type)
          }

          fields[ attribute.name ] = field;

        });

        return fields
      }
    })

    graphRegistry[ typeName ] = {
      entityModel,
      type: objectType
    }

    registerConnection(entityModel)
  })



  // build the query type
  const queryType = new GraphQLObjectType({
    name: 'Query',
    root: 'The root query type',

    fields: () => {

      const listQueries = {}

      _.forEach(graphRegistry, ( { type, entityModel }, typeName) => {
        const typePluralName = util.plural(typeName)
        const typePluralListName = util.upperCaseFirst(typePluralName)
        const fieldName = _.camelCase(`all_${typePluralName}`)

        listQueries[ fieldName ] = {
          type: graphRegistry[ typeName ].connection,
          description: `Fetch a list of \`${typePluralListName}\``,
          args: connectionArgs,
          resolve: (source, args, context, info) => connectionFromPromisedArray(
            resolverMap.find(entityModel, source, args, context, info),
            args,
          ),
        }
      })


      const instanceQueries = {}

      _.forEach(graphRegistry, ( { type, entityModel }, typeName) => {
        const typeUpperCaseName = util.upperCaseFirst(typeName)

        instanceQueries[ typeName ] = {
          type: type,
          description: `Fetch a single \`${typeUpperCaseName}\` using its node ID`,
          args: {
            id: {
              type: new GraphQLNonNull( GraphQLID )
            }
          },
          resolve: (source, args, context, info) => {
            return resolverMap.findById(entityModel, args.id, source, args, context, info)
          },
        }


        // find the primary attribute and add a query for it
        const primaryAttribute = _.find(entityModel.attributes, { isPrimary: true })

        if (primaryAttribute) {

          const attributeName = primaryAttribute.name
          const graphqlDataType = datatype.convertDataTypeToGraphQL(primaryAttribute.type)
          const fieldName = _.camelCase(`${typeName}_by_${attributeName}`)

          instanceQueries[ fieldName ] = {
            type: type,
            description: `Fetch a single \`${typeUpperCaseName}\` using its \`${attributeName}\``,
            args: {
              [ attributeName ]: {
                type: new GraphQLNonNull( graphqlDataType )
              }
            },
            resolve: (source, args, context, info) => {
              return resolverMap.findById(entityModel, args[ attributeName ], source, args, context, info)
            },
          }
        }

      })


      return {
        node: nodeField,
        ...instanceQueries,
        ...listQueries,
      };
    },
  });



  // put it all together into a graphQL schema
  const schema = new GraphQLSchema({
    query: queryType,
  });


  return schema
}


export default {
  generateGraphQLSchema
}
