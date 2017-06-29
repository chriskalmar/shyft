
import GraphQLJSON from 'graphql-type-json';

import {
  GraphQLScalarType,
  Kind,
  GraphQLError,
} from 'graphql';


export {
  GraphQLJSON,
}

import {
  serializeCursor,
  deserializeCursor,
} from './util';


export const GraphQLCursor = new GraphQLScalarType({
  name: 'Cursor',
  description:
    'A cursor to define a location in a data set used for pagination.',
  serialize: serializeCursor,
  parseValue: deserializeCursor,
  parseLiteral(ast) {
    return ast.kind === Kind.STRING ? deserializeCursor(ast.value) : null;
  }
});


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


export const GraphQLDateTime = new GraphQLScalarType({
  name: 'DateTime',
  description:
    'The `DateTime` scalar type represents a date and time string.',
  serialize: (value) => {
    return value
  },
  parseValue: String,
  parseLiteral(ast) {
    if (ast.kind !== Kind.STRING) {
      throw new GraphQLError('Query error: Can only parse strings but got a: ' + ast.kind, [ ast ]);
    }

    if (isNaN(Date.parse(ast.value))) {
      throw new GraphQLError('Query error: String is not a valid date time string', [ ast ]);
    }

    return ast.value
  }
});

