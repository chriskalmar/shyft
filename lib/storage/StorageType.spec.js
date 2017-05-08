
import { assert } from 'chai';
import StorageType, { isStorageType } from './StorageType';
import StorageDataType from './StorageDataType';
import { passOrThrow } from '../util';

import {
  StorageTypeMemory,
} from './StorageTypeMemory';

import {
  DataTypeID,
  DataTypeString,
} from '../datatype/dataTypes';


describe('StorageType', () => {

  it('should have a name', () => {

    function fn() {
      new StorageType() // eslint-disable-line no-new
    }

    assert.throws(fn, /Missing storage type name/);

  })


  it('should have a description', () => {

    function fn() {
      new StorageType({ // eslint-disable-line no-new
        name: 'Example'
      })
    }

    assert.throws(fn, /Missing description for storage type/);

  })


  it('should return it\'s name', () => {

    const SomeStorageType = new StorageType({
      name: 'SomeStorageType',
      description: 'Just some description',
      findOne() {},
      find() {},
    })

    assert.strictEqual(SomeStorageType.name, 'SomeStorageType');
    assert.strictEqual(String(SomeStorageType), 'SomeStorageType');

  })


  it('should throw on missing data fetching implementations', () => {

    function fn1() {
      new StorageType({ // eslint-disable-line no-new
        name: 'SomeStorageType',
        description: 'Just some description',
      })
    }

    assert.throws(fn1, /needs to implement findOne\(\)/);


    function fn2() {
      new StorageType({ // eslint-disable-line no-new
        name: 'SomeStorageType',
        description: 'Just some description',
        findOne() {},
      })
    }

    assert.throws(fn2, /needs to implement find\(\)/);

  })



  describe('data type mapping', () => {

    const SomeStorageType = new StorageType({
      name: 'SomeStorageType',
      description: 'Just some description',
      findOne() {},
      find() {},
    })

    const StorageDataTypeText = new StorageDataType({
      name: 'StorageDataTypeText',
      description: 'Just some description',
      nativeDataType: 'text',
      serialize() {},
    })


    it('should accept new mappings', () => {

      SomeStorageType.addDataTypeMap(DataTypeID, StorageDataTypeText)
      SomeStorageType.addDataTypeMap(DataTypeString, StorageDataTypeText)

    })


    it('should reject invalid schema data types', () => {

      function fn() {
        SomeStorageType.addDataTypeMap({ some: 'thing' }, StorageDataTypeText)
      }

      assert.throws(fn, /schemaDataType is not a valid data type/);

    })


    it('should reject invalid storage data types', () => {

      function fn() {
        SomeStorageType.addDataTypeMap(DataTypeString, { someThing: 'else' })
      }

      assert.throws(fn, /not a valid storage data type/);

    })


    it('should throw on duplicate mappings', () => {

      function fn() {
        SomeStorageType.addDataTypeMap(DataTypeID, StorageDataTypeText)
      }

      assert.throws(fn, /already registered with storage type/);

    })

  })


  describe('isStorageType', () => {


    it('should recognize objects of type StorageType', () => {

      const SomeStorageType = new StorageType({
        name: 'SomeStorageType',
        description: 'Just some description',
        findOne() {},
        find() {},
      })

      function fn() {
        passOrThrow(
          isStorageType(SomeStorageType) && isStorageType(StorageTypeMemory),
          () => 'This error will never happen'
        )
      }

      assert.doesNotThrow(fn)

    })


    it('should recognize non-StorageType objects', () => {

      function fn() {
        passOrThrow(
          isStorageType({}) ||
          isStorageType(function test() {}) ||
          isStorageType(assert),
          () => 'Not an StorageType object'
        )
      }


      assert.throws(fn, /Not an StorageType object/);

    })

  })


})
