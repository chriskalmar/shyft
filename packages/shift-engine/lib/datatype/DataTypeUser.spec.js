
import { assert } from 'chai';
import DataTypeUser, { isDataTypeUser } from './DataTypeUser';

import {
  passOrThrow,
} from '../util';


describe('DataTypeUser', () => {

  describe('isDataTypeUser', () => {


    it('should recognize objects of type DataTypeUser', () => {

      const dataTypeUser = new DataTypeUser({
        name: 'user',
        description: 'some description',
        mock() {},
      })

      function fn() {
        passOrThrow(
          isDataTypeUser(dataTypeUser),
          () => 'This error will never happen'
        )
      }

      assert.doesNotThrow(fn)

    })


    it('should recognize non-DataTypeUser objects', () => {

      function fn() {
        passOrThrow(
          isDataTypeUser({}) ||
          isDataTypeUser(function test() {}) ||
          isDataTypeUser(assert),
          () => 'Not a DataType object'
        )
      }


      assert.throws(fn, /Not a DataType object/);

    })

  })


})
