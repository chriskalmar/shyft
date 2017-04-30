
import util from './util';
import datatype from './datatype';
import _ from 'lodash';
import constants from './constants';

import { generateSortInput } from './sort';

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


// prepare models for graphql
const extendModelsForGql = (entityModels) => {

  entityModels.map( (entityModel) => {

    // generate type names for various cases
    entityModel.gqlTypeName = util.generateTypeName(entityModel)
    entityModel.gqlTypeNamePlural = util.generateTypeNamePlural(entityModel)
    entityModel.gqlTypeNameUpperCase = util.generateTypeNameUpperCase(entityModel)
    entityModel.gqlTypeNamePluralUpperCase = util.generateTypeNamePluralUpperCase(entityModel)


    // build a map of graphql field names to original attribute names
    entityModel.gqlFieldAttributeMap = {}

    entityModel.attributes.map( (attribute) => {

      // exception: name collision with relay ID field
      if (attribute.name === constants.RELAY_ID_FIELD) {
        attribute.gqlFieldName = constants.FALLBACK_ID_FIELD
      }
      // otherwise generate a field name for graphql
      else {
        attribute.gqlFieldName = _.camelCase(attribute.name)
      }

      // add to map
      entityModel.gqlFieldAttributeMap[ attribute.gqlFieldName ] = attribute.name
    })

  })
}


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



// register a new connection
const registerConnection = (entityModel) => {

  const typeName = entityModel.gqlTypeName

  const { connectionType } = connectionDefinitions({
    nodeType: graphRegistry[ typeName ].type
  })

  graphRegistry[ typeName ].connection = connectionType

}



const generateListQueries = (resolverMap) => {

  const listQueries = {}

  _.forEach(graphRegistry, ( { type, entityModel }, typeName) => {
    const typeNamePlural = entityModel.gqlTypeNamePlural
    const typeNamePluralListName = entityModel.gqlTypeNamePluralUpperCase
    const queryName = _.camelCase(`all_${typeNamePlural}`)

    listQueries[ queryName ] = {
      type: graphRegistry[ typeName ].connection,
      description: `Fetch a list of **\`${typeNamePluralListName}\`**`,
      args: {
        ...connectionArgs,
        orderBy: {
          ...generateSortInput(entityModel),
        }
      },
      resolve: (source, args, context, info) => connectionFromPromisedArray(
        resolverMap.find(entityModel, source, args, context, info),
        args,
      ),
    }
  })

  return listQueries
}


const generateInstanceQueries = (resolverMap) => {

  const instanceQueries = {}

  _.forEach(graphRegistry, ( { type, entityModel }, typeName) => {
    const typeNameUpperCase = entityModel.gqlTypeNameUpperCase
    const queryName = typeName

    instanceQueries[ queryName ] = {
      type: type,
      description: `Fetch a single **\`${typeNameUpperCase}\`** using its node ID`,
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

      const fieldName = primaryAttribute.gqlFieldName
      const graphqlDataType = datatype.convertDataTypeToGraphQL(primaryAttribute.type)
      const queryNamePrimaryAttribute = _.camelCase(`${typeName}_by_${fieldName}`)

      instanceQueries[ queryNamePrimaryAttribute ] = {
        type: type,
        description: `Fetch a single **\`${typeNameUpperCase}\`** using its **\`${fieldName}\`**`,
        args: {
          [ fieldName ]: {
            type: new GraphQLNonNull( graphqlDataType )
          }
        },
        resolve: (source, args, context, info) => {
          return resolverMap.findById(entityModel, args[ fieldName ], source, args, context, info)
        },
      }
    }

  })

  return instanceQueries
}



// generate a graphQL schema from shift entity models
export const generateGraphQLSchema = (entityModels, resolverMap) => {

  const {
    nodeInterface,
    nodeField,
  } = getNodeDefinitions(resolverMap)

  // prepare models for graphql
  extendModelsForGql(entityModels)

  entityModels.map( (entityModel) => {

    const typeName = entityModel.gqlTypeName

    const objectType = new GraphQLObjectType({

      name: entityModel.gqlTypeNameUpperCase,
      description: entityModel.description,
      interfaces: [ nodeInterface ],

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
            const targetTypeName = targetEntityModel.gqlTypeName

            field.type = graphRegistry[ targetTypeName ].type
            field.resolve = (source, args, context, info) => {
              const referenceId = source[ attribute.gqlFieldName ]
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

          fields[ attribute.gqlFieldName ] = field;

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

      const listQueries = generateListQueries(resolverMap)
      const instanceQueries = generateInstanceQueries(resolverMap)

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
