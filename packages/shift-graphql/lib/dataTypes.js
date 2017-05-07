
import GraphQLJSON from 'graphql-type-json';

import {
  GraphQLScalarType,
  Kind,
} from 'graphql';


export {
  GraphQLJSON,
}

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

