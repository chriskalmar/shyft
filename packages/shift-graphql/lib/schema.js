
import util from './util';
import datatype from './datatype';
import _ from 'lodash';

import {
  engine,
  registry,
} from 'shift-engine';

import {
  GraphQLObjectType,
  GraphQLSchema,
  GraphQLNonNull,
  GraphQLID,
  GraphQLList,
  GraphQLInt,
} from 'graphql';


// generate a graphQL schema from shift entity models
export const generateGraphQLSchema = (entityModels) => {

  // collect object types for each entity
  const graphQLObjectTypes = {}

  entityModels.map( (entityModel) => {

    const typeName = util.generateTypeName(entityModel)

    const objectType = new GraphQLObjectType({

      name: util.generateTypeNameUpperCase(entityModel),
      description: entityModel.description,

      fields: () => {
        const fields = {}

        entityModel.attributes.map( (attribute) => {

          const field = {
            description: attribute.description,
          };

          // it's a reference
          if (attribute.target) {
            const targetStructurePath = engine.convertTargetToPath(attribute.target, entityModel.domain, entityModel.provider)
            const targetEntityModel = registry.getProviderEntityModelFromPath(targetStructurePath)
            const targetTypeName = util.generateTypeName(targetEntityModel)

            field.type = graphQLObjectTypes[ targetTypeName ]
          }
          // it's a regular attribute
          else {
            field.type = datatype.convertDataTypeToGraphQL(attribute.type)
          }

          fields[ attribute.name ] = field;

        });

        return fields
      }
    })

    graphQLObjectTypes[ typeName ] = objectType
  })



  // build the query type
  const queryType = new GraphQLObjectType({
    name: 'Query',
    root: 'The root query type',

    fields: () => {

      const listQueries = {}

      _.forEach(graphQLObjectTypes, ( type, typeName) => {
        const typePluralName = util.plural(typeName)
        const typePluralListName = util.upperCaseFirst(typePluralName)
        const fieldName = _.camelCase(`all_${typePluralName}`)

        listQueries[ fieldName ] = {
          type: new GraphQLList(type),
          description: `Fetch a list of \`${typePluralListName}\``,
          args: {
            page: { type: GraphQLInt }
          },
          resolve: (__, { page }) => {
            return {
              page
            }
          },
        }
      })


      const instanceQueries = {}

      _.forEach(graphQLObjectTypes, ( type, typeName) => {
        const typeUpperCaseName = util.upperCaseFirst(typeName)

        instanceQueries[ typeName ] = {
          type: type,
          description: `Fetch a single \`${typeUpperCaseName}\` using its ID`,
          args: {
            id: {
              type: new GraphQLNonNull( GraphQLID )
            }
          },
          resolve: (__, { id }) => {
            return {
              id
            }
          },
        }
      })


      return {
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
