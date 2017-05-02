
import { expect } from 'chai';

import {
  passOrThrow,
  isDataType,
  resolveFunctionMap,
  isMap,
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



  describe('isMap', () => {


    it('should accept maps', () => {

      expect(isMap({})).to.be.true
      expect(isMap({ a: 123 })).to.be.true
      expect(isMap(Object.create({}))).to.be.true
      expect(isMap(DataTypeBoolean)).to.be.true

    })


    it('should reject non-maps', () => {

      expect(isMap()).to.be.false
      expect(isMap(null)).to.be.false
      expect(isMap(undefined)).to.be.false
      expect(isMap([])).to.be.false
      expect(isMap([1, 2, 3])).to.be.false
      expect(isMap(() => {})).to.be.false
      expect(isMap(1234567)).to.be.false

    })


    it('should reject empty maps if flag `nonEmpty` is set', () => {

      expect(isMap({}, true)).to.be.false

    })

  })

})
