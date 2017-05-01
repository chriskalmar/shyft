
import {
  // GraphQLID,
  GraphQLInt,
  GraphQLFloat,
  GraphQLString,
  GraphQLBoolean,
  GraphQLScalarType,
  Kind,
} from 'graphql';


export const GraphQLBigInt = new GraphQLScalarType({
  name: 'BigInt',
  description:
    'The `BigInt` scalar type represents a 64-bit integer. As JavaScript ' +
    'is limited to a precision of 53 bits on integer values, all `BigInt` ' +
    'values will be output as strings.',
  serialize: String,
  parseValue: String,
  parseLiteral(ast) {
    return ast.kind === Kind.STRING ? ast.value : null;
  }
});


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

