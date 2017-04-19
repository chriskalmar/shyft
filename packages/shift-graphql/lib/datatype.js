
import {
  // GraphQLID,
  GraphQLInt,
  // GraphQLFloat,
  GraphQLString,
  GraphQLBoolean,
} from 'graphql';


const dataTypeMap = {
  string: GraphQLString,
  integer: GraphQLInt,
  bigint: GraphQLString,
  boolean: GraphQLBoolean,
  email: GraphQLString,
  date: GraphQLString,
  time: GraphQLString,
  timetz: GraphQLString,
  timestamp: GraphQLString,
  timestamptz: GraphQLString,
  json: GraphQLString,
  password: GraphQLString,
  reference: GraphQLString,
}


export function convertDataTypeToGraphQL(dataType) {
  // return graphql type based on mapping or fall back to string type
  return dataTypeMap[ dataType] || GraphQLString
}


export default {
  convertDataTypeToGraphQL
}


