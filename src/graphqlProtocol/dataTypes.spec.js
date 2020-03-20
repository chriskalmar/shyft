/* eslint-disable @typescript-eslint/explicit-function-return-type */

import { GraphQLDateTime, GraphQLDate, GraphQLTime } from './dataTypes';
import { parseValue } from 'graphql';

describe('dataTypes', () => {
  it('GraphQLDateTime', () => {
    const bad1 = () => GraphQLDateTime.parseLiteral(parseValue('"foo"'));
    expect(bad1).toThrowErrorMatchingSnapshot();

    const bad2 = () =>
      GraphQLDateTime.parseLiteral(parseValue('"2000-01-02 111:12:13+14:15"'));
    expect(bad2).toThrowErrorMatchingSnapshot('bad hour');

    const bad3 = () =>
      GraphQLDateTime.parseLiteral(parseValue('"2000-31-02 11:12:13+14:15"'));
    expect(bad3).toThrowErrorMatchingSnapshot('bad month');

    const bad4 = () =>
      GraphQLDateTime.parseLiteral(parseValue('"2000-01-02 11:62:13+14:15"'));
    expect(bad4).toThrowErrorMatchingSnapshot('bad minute');

    const good1 = () =>
      GraphQLDateTime.parseLiteral(parseValue('"2000-01-02 11:12:13+14:15"'));
    expect(good1).not.toThrow();

    const good2 = () =>
      GraphQLDateTime.parseLiteral(parseValue('"0003-01-02 21:12:13+14:15"'));
    expect(good2).not.toThrow();
  });

  it('GraphQLDate', () => {
    const bad1 = () => GraphQLDate.parseLiteral(parseValue('"foo"'));
    expect(bad1).toThrowErrorMatchingSnapshot();

    const bad2 = () => GraphQLDate.parseLiteral(parseValue('"2000-01-32"'));
    expect(bad2).toThrowErrorMatchingSnapshot('bad day');

    const bad3 = () => GraphQLDate.parseLiteral(parseValue('"2000-31-02"'));
    expect(bad3).toThrowErrorMatchingSnapshot('bad month');

    const bad4 = () => GraphQLDate.parseLiteral(parseValue('"01-02"'));
    expect(bad4).toThrowErrorMatchingSnapshot('bad date');

    const good1 = () => GraphQLDate.parseLiteral(parseValue('"2000-01-02"'));
    expect(good1).not.toThrow();

    const good2 = () => GraphQLDate.parseLiteral(parseValue('"0003-01-02"'));
    expect(good2).not.toThrow();
  });

  it('GraphQLTime', () => {
    const bad1 = () => GraphQLTime.parseLiteral(parseValue('"foo"'));
    expect(bad1).toThrowErrorMatchingSnapshot();

    const bad2 = () =>
      GraphQLTime.parseLiteral(parseValue('"111:12:13+14:15"'));
    expect(bad2).toThrowErrorMatchingSnapshot('bad hour');

    const bad3 = () => GraphQLTime.parseLiteral(parseValue('"11:12:13+24:15"'));
    expect(bad3).toThrowErrorMatchingSnapshot('bad tz hour');

    const bad4 = () => GraphQLTime.parseLiteral(parseValue('"11:62:13+14:15"'));
    expect(bad4).toThrowErrorMatchingSnapshot('bad minute');

    const good1 = () =>
      GraphQLTime.parseLiteral(parseValue('"11:12:13+14:15"'));
    expect(good1).not.toThrow();

    const good2 = () => GraphQLTime.parseLiteral(parseValue('"21:12:13"'));
    expect(good2).not.toThrow();

    const good3 = () => GraphQLTime.parseLiteral(parseValue('"21:12"'));
    expect(good3).not.toThrow();
  });
});
