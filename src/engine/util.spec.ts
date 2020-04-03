/* eslint-disable @typescript-eslint/explicit-function-return-type */

import {
  passOrThrow,
  resolveFunctionMap,
  isMap,
  isArray,
  mergeMaps,
  mapOverProperties,
  sortDataByKeys,
  reverseString,
} from './util';

import { DataTypeBoolean } from './datatype/dataTypes';

describe('util', () => {
  describe('passOrThrow', () => {
    it('should pass on positive condition', () => {
      function fn() {
        passOrThrow(1 < 2, () => 'This error will never happen');
      }

      expect(fn).not.toThrow();
    });

    it('should throw on negative condition', () => {
      function fn() {
        passOrThrow(1 > 2, () => 'This is the very very super important error');
      }

      expect(fn).toThrowErrorMatchingSnapshot();
    });

    it('should throw if message is not a function', () => {
      function fn() {
        passOrThrow(1 > 0, 'This is the very very super important error');
      }

      expect(fn).toThrowErrorMatchingSnapshot();
    });
  });

  describe('resolveFunctionMap', () => {
    const dataMap = {
      a: 123,
      b: 456,
    };

    it('should return the provided map', () => {
      const result = resolveFunctionMap(dataMap);

      expect(result).toEqual(dataMap);
    });

    it('should return the result of the provided function', () => {
      const result = resolveFunctionMap(() => {
        return dataMap;
      });

      expect(result).toEqual(dataMap);
    });
  });

  describe('isMap', () => {
    it('should accept maps', () => {
      expect(isMap({})).toBe(true);
      expect(isMap({ a: 123 })).toBe(true);
      expect(isMap(Object.create({}))).toBe(true);
      expect(isMap(DataTypeBoolean)).toBe(true);
    });

    it('should reject non-maps', () => {
      expect(isMap()).toBe(false);
      expect(isMap(null)).toBe(false);
      expect(isMap(undefined)).toBe(false);
      expect(isMap([])).toBe(false);
      expect(isMap([1, 2, 3])).toBe(false);
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      expect(isMap(() => {})).toBe(false);
      expect(isMap(1234567)).toBe(false);
    });

    it('should reject empty maps if flag `nonEmpty` is set', () => {
      expect(isMap({}, true)).toBe(false);
    });
  });

  describe('isArray', () => {
    it('should accept arrays', () => {
      expect(isArray([])).toBe(true);
      expect(isArray(['test'])).toBe(true);
      expect(isArray([1, 2, 3])).toBe(true);
    });

    it('should reject non-arrays', () => {
      expect(isArray()).toBe(false);
      expect(isArray(null)).toBe(false);
      expect(isArray(undefined)).toBe(false);
      expect(isArray(Object.create({}))).toBe(false);
      expect(isArray(DataTypeBoolean)).toBe(false);
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      expect(isArray(() => {})).toBe(false);
      expect(isArray(1234567)).toBe(false);
    });

    it('should reject empty arrays if flag `nonEmpty` is set', () => {
      expect(isArray([], true)).toBe(false);
    });
  });

  describe('mergeMaps', () => {
    it('should merge 2 maps', () => {
      let obj;

      obj = mergeMaps({}, {});
      expect(obj).toEqual({});

      obj = mergeMaps({ a: 123 }, {});
      expect(obj).toEqual({ a: 123 });

      obj = mergeMaps({}, { b: 456 });
      expect(obj).toEqual({ b: 456 });

      obj = mergeMaps({ a: 123 }, { b: 456 });
      expect(obj).toEqual({ a: 123, b: 456 });

      obj = mergeMaps({ b: 456 }, { a: 123 });
      expect(obj).toEqual({ a: 123, b: 456 });

      obj = mergeMaps({ a: 123, b: 456 }, { b: 789 });
      expect(obj).toEqual({ a: 123, b: 789 });

      obj = mergeMaps(
        { a: 123, b: [1, 2, 4], c: { deep: [7, 8, 9] } },
        { b: { b1: 1, b2: 2 } },
      );
      expect(obj).toEqual({
        a: 123,
        b: { b1: 1, b2: 2 },
        c: { deep: [7, 8, 9] },
      });
    });

    it('should throw if non-maps are provided', () => {
      function fn1() {
        mergeMaps();
      }

      function fn2() {
        mergeMaps({ a: 123 }, []);
      }

      function fn3() {
        mergeMaps('string', {});
      }

      expect(fn1).toThrowErrorMatchingSnapshot();
      expect(fn2).toThrowErrorMatchingSnapshot();
      expect(fn3).toThrowErrorMatchingSnapshot();
    });
  });

  describe('mapOverProperties', () => {
    it('should map over properties and call interatee', () => {
      const keys = [];
      let sum = 0;

      function iteratee(val, key) {
        sum += val;
        keys.push(key);
      }

      const someMap = {
        a: 1,
        b: 4,
        c: 8,
      };

      mapOverProperties(someMap, iteratee);

      expect(keys).toEqual(['a', 'b', 'c']);
      expect(sum).toBe(13);
    });

    it('should throw if non-maps are provided', () => {
      function fn1() {
        mapOverProperties();
      }

      function fn2() {
        mapOverProperties([]);
      }

      function fn3() {
        mapOverProperties('string');
      }

      expect(fn1).toThrowErrorMatchingSnapshot();
      expect(fn2).toThrowErrorMatchingSnapshot();
      expect(fn3).toThrowErrorMatchingSnapshot();
    });

    it('should throw if iteratee is not a function', () => {
      function fn1() {
        mapOverProperties({});
      }

      function fn2() {
        mapOverProperties({}, []);
      }

      function fn3() {
        mapOverProperties({}, 'string');
      }

      expect(fn1).toThrowErrorMatchingSnapshot();
      expect(fn2).toThrowErrorMatchingSnapshot();
      expect(fn3).toThrowErrorMatchingSnapshot();
    });
  });

  describe('sortDataByKeys', () => {
    it('should return empty result if keys list is empty or invalid', () => {
      const result1 = sortDataByKeys([], { a: 1, b: 3 });
      const result2 = sortDataByKeys({}, { a: 1, b: 3 });
      const result3 = sortDataByKeys(null, { a: 1, b: 3 });

      expect(result1).toEqual([]);
      expect(result2).toEqual([]);
      expect(result3).toEqual([]);
    });

    it('should return null-filled array if data list is empty or invalid', () => {
      const result1 = sortDataByKeys(['a', 'b'], null);
      const result2 = sortDataByKeys(['a'], {});
      const result3 = sortDataByKeys(['a', 'b', 'f'], []);

      expect(result1).toEqual([null, null]);
      expect(result2).toEqual([null]);
      expect(result3).toEqual([null, null, null]);
    });

    it('should sort data based on keys', () => {
      const data = [
        { id: 'a', val: 'lorem' },
        { id: 'b', val: 'ipsum' },
        { id: 'c', val: 'dolor' },
        { id: 'd', val: 'et' },
        { id: 'e', val: 'unde' },
        { id: 'f', val: 'omnis' },
        { id: 'g', val: 'iste' },
        { id: 'a', val: 'natus' },
        { id: 'b', val: 'voluptatem' },
        { id: 'c', val: 'doloremque' },
      ];

      const keys1 = ['a', 'c', 'f'];
      const keys2 = ['e', 'e', 'b', 'b', 'c'];
      const keys3 = ['g'];
      const keys4 = [
        'a-unknown',
        'f',
        'c-unknown',
        'g',
        'c',
        'd-unkown',
        'c',
        'hh',
      ];

      const result1 = sortDataByKeys(keys1, data);
      const result2 = sortDataByKeys(keys2, data);
      const result3 = sortDataByKeys(keys3, data);
      const result4 = sortDataByKeys(keys4, data);

      expect(result1).toEqual([
        { id: 'a', val: 'lorem' },
        { id: 'c', val: 'dolor' },
        { id: 'f', val: 'omnis' },
      ]);

      expect(result2).toEqual([
        { id: 'e', val: 'unde' },
        { id: 'e', val: 'unde' },
        { id: 'b', val: 'ipsum' },
        { id: 'b', val: 'voluptatem' },
        { id: 'c', val: 'dolor' },
      ]);

      expect(result3).toEqual([{ id: 'g', val: 'iste' }]);

      expect(result4).toEqual([
        null,
        { id: 'f', val: 'omnis' },
        null,
        { id: 'g', val: 'iste' },
        { id: 'c', val: 'dolor' },
        null,
        { id: 'c', val: 'doloremque' },
        null,
      ]);
    });
  });

  describe('reverseString', () => {
    it('should reverse a string', () => {
      expect(reverseString('hello')).toEqual('olleh');
      expect(reverseString('')).toEqual('');
      expect(reverseString('a')).toEqual('a');
      expect(reverseString('aBC')).toEqual('CBa');
      expect(reverseString(' x y ')).toEqual(' y x ');
    });
  });
});
