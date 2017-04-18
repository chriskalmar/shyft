
import {
  GraphQLObjectType,
  GraphQLSchema,
} from 'graphql';


// generate a graphQL schema from shift entity models
export const generateGraphQLSchema = (entityModels) => {

  // collect object types for each entity
  const graphQLObjectTypes = {}

  entityModels.map( (entityModel) => {

    const nodeName = entityModel.name

    const objectType = new GraphQLObjectType({
      name: nodeName,
      description: entityModel.description,
    })

    graphQLObjectTypes[ nodeName ] = objectType
  })



  // build the query type
  const queryType = new GraphQLObjectType({
    name: 'Query',
    root: 'The root query type',
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
