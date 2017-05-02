
import { expect } from 'chai';

import {
  passOrThrow,
  isDataType,
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

})
