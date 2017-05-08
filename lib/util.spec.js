
import { assert } from 'chai';

import {
  passOrThrow,
  resolveFunctionMap,
  isMap,
  isArray,
  mergeMaps,
} from './util';

import {
  DataTypeBoolean,
} from './datatype/dataTypes';



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



  describe('isArray', () => {


    it('should accept arrays', () => {

      assert.isTrue(isArray([]))
      assert.isTrue(isArray([ 'test' ]))
      assert.isTrue(isArray([1, 2, 3]))

    })


    it('should reject non-arrays', () => {

      assert.isFalse(isArray())
      assert.isFalse(isArray(null))
      assert.isFalse(isArray(undefined))
      assert.isFalse(isArray(Object.create({})))
      assert.isFalse(isArray(DataTypeBoolean))
      assert.isFalse(isArray(() => {}))
      assert.isFalse(isArray(1234567))

    })


    it('should reject empty arrays if flag `nonEmpty` is set', () => {

      assert.isFalse(isArray([], true))

    })

  })


  describe('mergeMaps', () => {


    it('should merge 2 maps', () => {

      let obj

      obj = mergeMaps({}, {})
      assert.deepEqual(obj, {})

      obj = mergeMaps({ a: 123 }, {})
      assert.deepEqual(obj, { a: 123 })

      obj = mergeMaps({}, { b: 456 })
      assert.deepEqual(obj, { b: 456 })

      obj = mergeMaps({ a: 123 }, { b: 456 })
      assert.deepEqual(obj, { a: 123, b: 456 })

      obj = mergeMaps({ b: 456 }, { a: 123 })
      assert.deepEqual(obj, { a: 123, b: 456 })

      obj = mergeMaps({ a: 123, b: 456 }, { b: 789 })
      assert.deepEqual(obj, { a: 123, b: 789 })

      obj = mergeMaps({ a: 123, b: [ 1, 2, 4], c: { deep: [ 7, 8, 9 ]} }, { b: { b1: 1, b2: 2 } })
      assert.deepEqual(obj, { a: 123, b: { b1: 1, b2: 2 }, c: { deep: [ 7, 8, 9 ]} })

    })


    it('should throw if non-maps are provided', () => {

      function fn1() {
        mergeMaps()
      }

      function fn2() {
        mergeMaps({ a: 123 }, [])
      }

      function fn3() {
        mergeMaps('string', {})
      }

      assert.throws(fn1, /expects 2 maps for a merge to work/);
      assert.throws(fn2, /expects 2 maps for a merge to work/);
      assert.throws(fn3, /expects 2 maps for a merge to work/);

    })

  })

})
