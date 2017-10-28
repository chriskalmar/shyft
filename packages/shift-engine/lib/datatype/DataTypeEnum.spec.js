
import { assert } from 'chai';
import DataTypeEnum, { isDataTypeEnum } from './DataTypeEnum';

import {
  passOrThrow,
} from '../util';



describe('DataTypeEnum', () => {

  it('should have a set of values', () => {

    let fn

    fn = () => {
      new DataTypeEnum() // eslint-disable-line no-new
    }

    assert.throws(fn, /Missing enum values/);


    fn = () => {
      new DataTypeEnum({ // eslint-disable-line no-new
        values: [],
      })
    }

    assert.throws(fn, /Missing enum values/);

  })


  it('should have a set of valid values', () => {

    let fn

    fn = () => {
      new DataTypeEnum({ // eslint-disable-line no-new
        values: [ '8' ],
      })
    }

    assert.throws(fn, /Invalid enum value \'8\' for data type \'undefined\'/);

    fn = () => {
      new DataTypeEnum({ // eslint-disable-line no-new
        values: [ ' abc ' ],
        name: 'test'
      })
    }

    assert.throws(fn, /Invalid enum value \' abc \' for data type \'test\'/);

    fn = () => {
      new DataTypeEnum({ // eslint-disable-line no-new
        values: [ 'abc', 'def', 'hello-there' ],
        name: 'another'
      })
    }

    assert.throws(fn, /Invalid enum value \'hello-there\' for data type \'another\'/);

  })


  it('should have a name', () => {

    function fn() {
      new DataTypeEnum({ // eslint-disable-line no-new
        values: [ 'item' ],
      })
    }

    assert.throws(fn, /Missing data type name/);

  })


  it('should return it\'s name', () => {

    const dataType = new DataTypeEnum({
      name: 'someDataTypeName',
      description: 'Just some description',
      values: [ 'item' ],
    })

    assert.strictEqual(dataType.name, 'someDataTypeName');
    assert.strictEqual(String(dataType), 'someDataTypeName');

  })


  it('should have a fallback description', () => {

    const dataType = new DataTypeEnum({
      name: 'example',
      values: [ 'ACTION', 'COMEDY', 'DRAMA' ],
    })

    assert.strictEqual(dataType.description, 'Enumeration set: ACTION, COMEDY, DRAMA');
  })


  describe('isDataTypeEnum', () => {


    it('should recognize objects of type DataTypeEnum', () => {

      const enum1 = new DataTypeEnum({
        name: 'enum1',
        values: [ 'ACTION', 'COMEDY', 'DRAMA' ],
      })

      const enum2 = new DataTypeEnum({
        name: 'enum2',
        values: [ 'APPLE', 'PEAR', 'CHERRY' ],
      })

      function fn() {
        passOrThrow(
          isDataTypeEnum(enum1) &&
          isDataTypeEnum(enum2),
          () => 'This error will never happen'
        )
      }

      assert.doesNotThrow(fn)

    })


    it('should recognize non-DataTypeEnum objects', () => {

      function fn() {
        passOrThrow(
          isDataTypeEnum({}) ||
          isDataTypeEnum(function test() {}) ||
          isDataTypeEnum(assert),
          () => 'Not a DataTypeEnum object'
        )
      }


      assert.throws(fn, /Not a DataTypeEnum object/);

    })

  })


})
