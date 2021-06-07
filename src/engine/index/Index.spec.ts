/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable @typescript-eslint/explicit-function-return-type */

import { Index, isIndex, INDEX_UNIQUE, processEntityIndexes } from './Index';
import { Entity } from '../entity/Entity';
import { DataTypeString } from '../datatype/dataTypes';
import { passOrThrow } from '../util';

describe('Index', () => {
  it('should have a type', () => {
    function fn() {
      // eslint-disable-next-line no-new
      new Index();
    }

    expect(fn).toThrowErrorMatchingSnapshot();
  });

  it('should have a valid type', () => {
    function fn() {
      // eslint-disable-next-line no-new
      new Index({
        type: 'something',
      });
    }

    expect(fn).toThrowErrorMatchingSnapshot();
  });

  it('should have a list of attributes', () => {
    function fn1() {
      // eslint-disable-next-line no-new
      new Index({
        type: INDEX_UNIQUE,
      });
    }

    expect(fn1).toThrowErrorMatchingSnapshot();

    function fn2() {
      // eslint-disable-next-line no-new
      new Index({
        type: INDEX_UNIQUE,
        attributes: [],
      });
    }

    expect(fn2).toThrowErrorMatchingSnapshot();
  });

  it('should accept attribute names only', () => {
    function fn1() {
      // eslint-disable-next-line no-new
      new Index({
        type: INDEX_UNIQUE,
        attributes: [null],
      });
    }

    expect(fn1).toThrowErrorMatchingSnapshot();

    function fn2() {
      // eslint-disable-next-line no-new
      new Index({
        type: INDEX_UNIQUE,
        attributes: [((123 as unknown) as string)],
      });
    }

    expect(fn2).toThrowErrorMatchingSnapshot();
  });

  it('should accept unique attribute names only', () => {
    function fn() {
      // eslint-disable-next-line no-new
      new Index({
        type: INDEX_UNIQUE,
        attributes: ['a', 'b', 'a'],
      });
    }

    expect(fn).toThrowErrorMatchingSnapshot();
  });

  it('should accept a correct definition', () => {
    const index1 = new Index({
      type: INDEX_UNIQUE,
      attributes: ['a'],
    });

    const index2 = new Index({
      type: INDEX_UNIQUE,
      attributes: ['a', 'b', 'c'],
    });

    expect(index1.attributes).toEqual(['a']);
    expect(index2.attributes).toEqual(['a', 'b', 'c']);

    expect(String(index1)).toEqual('unique');
  });

  describe('isIndex', () => {
    it('should recognize objects of type Index', () => {
      const index = new Index({
        type: INDEX_UNIQUE,
        attributes: ['a'],
      });

      function fn() {
        passOrThrow(isIndex(index), () => 'This error will never happen');
      }

      expect(fn).not.toThrow();
    });

    it('should recognize non-Index objects', () => {
      function fn() {
        passOrThrow(
          isIndex({}) || isIndex(function test() {}) || isIndex(Error),
          () => 'Not an Index object',
        );
      }

      expect(fn).toThrowErrorMatchingSnapshot();
    });
  });

  describe('processEntityIndexes', () => {
    const entity = new Entity({
      name: 'SomeEntityName',
      description: 'Just some description',
      attributes: {
        someAttribute: {
          type: DataTypeString,
          description: 'Just some description',
          required: true,
        },
      },
    });

    entity.getIndexes();

    it('should throw if provided with an invalid list of indexes', () => {
      const indexes = {
        unique: [{}],
      };

      function fn() {
        processEntityIndexes(entity, (indexes as unknown) as Index[]);
      }

      expect(fn).toThrowErrorMatchingSnapshot();
    });

    it('should throw if provided with an invalid index', () => {
      const indexes = [{ foo: 'bar' }];

      function fn() {
        processEntityIndexes(entity, (indexes as unknown) as Index[]);
      }

      expect(fn).toThrowErrorMatchingSnapshot();
    });

    it('should throw if attribute used in index does not exist', () => {
      const indexes = [
        new Index({
          type: INDEX_UNIQUE,
          attributes: ['someAttribute', 'notHere'],
        }),
      ];

      function fn() {
        processEntityIndexes(entity, indexes);
      }

      expect(fn).toThrowErrorMatchingSnapshot();
    });
  });
});
