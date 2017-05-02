
import { expect } from 'chai';

import {
  passOrThrow,
  isDataType,
  resolveFunctionMap,
} from './util';

import {
  DataTypeBoolean,
  DataTypeString,
} from './datatypes';

describe('util', () => {


  describe('passOrThrow', () => {


    it('should pass on positive condition', () => {

      function fn() {
        passOrThrow(
          1 < 2,
          'This error will never happen'
        )
      }

      expect(fn).to.not.throw();

    })


    it('should throw on negative condition', () => {

      function fn() {
        passOrThrow(
          1 > 2,
          'This is the very very super important error'
        )
      }


      expect(fn).to.throw(/This is the very very super important error/);

    })

  })



  describe('isDataType', () => {


    it('should recognize objects of type DataType', () => {

      function fn() {
        passOrThrow(
          isDataType(DataTypeBoolean) &&
          isDataType(DataTypeString),
          'This error will never happen'
        )
      }

      expect(fn).to.not.throw();

    })


    it('should recognize non-DataType objects', () => {

      function fn() {
        passOrThrow(
          isDataType({}) ||
          isDataType(function test() {}) ||
          isDataType(expect),
          'Not a DataType object'
        )
      }


      expect(fn).to.throw(/Not a DataType object/);

    })

  })



  describe('resolveFunctionMap', () => {

    const dataMap = {
      a: 123,
      b: 456,
    }


    it('should return the provided map', () => {

      const result = resolveFunctionMap(dataMap)

      expect(result).to.equal(dataMap)
    })


    it('should return the result of the provided function', () => {

      const result = resolveFunctionMap(() => {
        return dataMap
      })

      expect(result).to.equal(dataMap)

    })

  })

})
