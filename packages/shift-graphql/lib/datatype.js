
import {
  GraphQLInt,
  GraphQLFloat,
  GraphQLString,
  GraphQLBoolean,
} from 'graphql';

import GraphQLBigInt from './datatypes/bigint';


const dataTypeMap = {
  string: GraphQLString,
  integer: GraphQLInt,
  bigint: GraphQLBigInt,
  boolean: GraphQLBoolean,
  email: GraphQLString,
  date: GraphQLString,
  time: GraphQLString,
  timetz: GraphQLString,
  timestamp: GraphQLString,
  timestamptz: GraphQLString,
  json: GraphQLString,
  password: GraphQLString,
  reference: GraphQLBigInt,
  float: GraphQLFloat,
}


export function convertDataTypeToGraphQL(dataType) {
  // return graphql type based on mapping or fall back to string type
  return dataTypeMap[ dataType] || GraphQLString
}


export default {
  convertDataTypeToGraphQL
}

