import { GraphQLScalarType, Kind, GraphQLError } from 'graphql';
import { serializeCursor, deserializeCursor } from './util';
import * as dateFns from 'date-fns';

const dateTimeRegex = /^\d+-[0-9]{2}-[0-9]{2}[\sT]([0-1][0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?(\s?[+-]([0-1][0-9]|2[0-3])(:[0-5][0-9])?)?$/;
const timeRegex = /^([0-1][0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?(\s?[+-]([0-1][0-9]|2[0-3])(:[0-5][0-9])?)?$/;

export { GraphQLJSON } from 'graphql-type-json';

export const GraphQLCursor = new GraphQLScalarType({
  name: 'Cursor',
  description:
    'A cursor to define a location in a data set used for pagination.',
  serialize: serializeCursor,
  parseValue: deserializeCursor,
  parseLiteral(ast) {
    return ast.kind === Kind.STRING ? deserializeCursor(ast.value) : null;
  },
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
  },
});

export const GraphQLDateTime = new GraphQLScalarType({
  name: 'DateTime',
  description: 'The `DateTime` scalar type represents a date and time string.',
  serialize: value => {
    return value;
  },
  parseValue: String,
  parseLiteral(ast) {
    if (ast.kind !== Kind.STRING) {
      throw new GraphQLError(
        `Query error: Can only parse strings but got a: ${ast.kind}`,
        [ ast ],
      );
    }

    if (!dateTimeRegex.test(ast.value)) {
      throw new GraphQLError(
        'Query error: String is not a valid date time string',
        [ ast ],
      );
    }

    const dateString = ast.value.substring(0, 10);
    const asDate = dateFns.parse(dateString);

    if (
      !dateFns.isValid(asDate) ||
      dateString !== dateFns.format(asDate, 'YYYY-MM-DD')
    ) {
      throw new GraphQLError(
        'Query error: String is not a valid date time string',
        [ ast ],
      );
    }

    return ast.value;
  },
});

export const GraphQLDate = new GraphQLScalarType({
  name: 'Date',
  description: 'The `Date` scalar type represents a date string.',
  serialize: value => {
    return value;
  },
  parseValue: String,
  parseLiteral(ast) {
    if (ast.kind !== Kind.STRING) {
      throw new GraphQLError(
        `Query error: Can only parse strings but got a: ${ast.kind}`,
        [ ast ],
      );
    }

    const asDate = dateFns.parse(ast.value);

    if (
      !dateFns.isValid(asDate) ||
      ast.value !== dateFns.format(asDate, 'YYYY-MM-DD')
    ) {
      throw new GraphQLError('Query error: String is not a valid date string', [
        ast,
      ]);
    }

    return ast.value;
  },
});

export const GraphQLTime = new GraphQLScalarType({
  name: 'Time',
  description: 'The `Time` scalar type represents a time string.',
  serialize: value => {
    return value;
  },
  parseValue: String,
  parseLiteral(ast) {
    if (ast.kind !== Kind.STRING) {
      throw new GraphQLError(
        `Query error: Can only parse strings but got a: ${ast.kind}`,
        [ ast ],
      );
    }

    if (!timeRegex.test(ast.value)) {
      throw new GraphQLError('Query error: String is not a valid time string', [
        ast,
      ]);
    }

    return ast.value;
  },
});
