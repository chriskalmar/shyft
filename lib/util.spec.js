
import { assert } from 'chai';

import {
  passOrThrow,
  resolveFunctionMap,
  isMap,
} from './util';

import {
  DataTypeBoolean,
  DataTypeString,
} from './datatype/datatypes';

import { isDataType } from './datatype/DataType';

describe('util', () => {


  describe('passOrThrow', () => {


    it('should pass on positive condition', () => {

      function fn() {
        passOrThrow(
          1 < 2,
          () => 'This error will never happen'
        )
      }

      assert.doesNotThrow(fn)

    })


    it('should throw on negative condition', () => {

      function fn() {
        passOrThrow(
          1 > 2,
          () => 'This is the very very super important error'
        )
      }


      assert.throws(fn, /This is the very very super important error/);

    })


    it('should throw if message is not a function', () => {

      function fn() {
        passOrThrow(
          1 > 0,
          'This is the very very super important error'
        )
      }


      assert.throws(fn, /expects messageFn to be a function/);

    })

  })



  describe('isDataType', () => {


    it('should recognize objects of type DataType', () => {

      function fn() {
        passOrThrow(
          isDataType(DataTypeBoolean) &&
          isDataType(DataTypeString),
          () => 'This error will never happen'
        )
      }

      assert.doesNotThrow(fn)

    })


    it('should recognize non-DataType objects', () => {

      function fn() {
        passOrThrow(
          isDataType({}) ||
          isDataType(function test() {}) ||
          isDataType(assert),
          () => 'Not a DataType object'
        )
      }


      assert.throws(fn, /Not a DataType object/);

    })

  })



  describe('resolveFunctionMap', () => {

    const dataMap = {
      a: 123,
      b: 456,
    }


    it('should return the provided map', () => {

      const result = resolveFunctionMap(dataMap)

      assert.strictEqual(result, dataMap)
    })


    it('should return the result of the provided function', () => {

      const result = resolveFunctionMap(() => {
        return dataMap
      })

      assert.strictEqual(result, dataMap)

    })

  })



  describe('isMap', () => {


    it('should accept maps', () => {

      assert.isTrue(isMap({}))
      assert.isTrue(isMap({ a: 123 }))
      assert.isTrue(isMap(Object.create({})))
      assert.isTrue(isMap(DataTypeBoolean))

    })


    it('should reject non-maps', () => {

      assert.isFalse(isMap())
      assert.isFalse(isMap(null))
      assert.isFalse(isMap(undefined))
      assert.isFalse(isMap([]))
      assert.isFalse(isMap([1, 2, 3]))
      assert.isFalse(isMap(() => {}))
      assert.isFalse(isMap(1234567))

    })


    it('should reject empty maps if flag `nonEmpty` is set', () => {

      assert.isFalse(isMap({}, true))

    })

  })

})
