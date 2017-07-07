
import { assert } from 'chai';
import StorageDataType, { isStorageDataType } from './StorageDataType';

import {
  passOrThrow,
} from '../util';


describe('StorageDataType', () => {

  it('should have a name', () => {

    function fn() {
      new StorageDataType() // eslint-disable-line no-new
    }

    assert.throws(fn, /Missing storage data type name/);

  })


  it('should have a description', () => {

    function fn() {
      new StorageDataType({ // eslint-disable-line no-new
        name: 'example'
      })
    }

    assert.throws(fn, /Missing description for storage data type/);

  })


  it('should have a native data type', () => {

    function fn() {
      new StorageDataType({ // eslint-disable-line no-new
        name: 'someStorageDataType',
        description: 'Just some description',
      })
    }

    assert.throws(fn, /Missing native data type for storage data type/);

  })


  it('should have a serialize function', () => {

    function fn() {
      new StorageDataType({ // eslint-disable-line no-new
        name: 'someStorageDataType',
        description: 'Just some description',
        nativeDataType: String,
      })
    }

    assert.throws(fn, /has an invalid serialize function/);

  })


  it('should have a valid parse function if provided', () => {

    function fn() {
      new StorageDataType({ // eslint-disable-line no-new
        name: 'someStorageDataType',
        description: 'Just some description',
        nativeDataType: String,
        serialize() {},
        parse: 12345,
      })
    }

    assert.throws(fn, /has an invalid parse function/);

  })


  it('should have a valid list of capabilities if provided', () => {

    function fn() {
      new StorageDataType({ // eslint-disable-line no-new
        name: 'someStorageDataType',
        description: 'Just some description',
        nativeDataType: String,
        serialize() {},
        capabilities: 123,
      })
    }

    assert.throws(fn, /has an invalid list of capabilities/);

  })

  it('should reject invalid capabilities', () => {

    function fn() {
      new StorageDataType({ // eslint-disable-line no-new
        name: 'someStorageDataType',
        description: 'Just some description',
        nativeDataType: String,
        serialize() {},
        capabilities: [
          'in',
          'not',
          'magic_unicorn_filter',
        ],
      })
    }

    assert.throws(fn, /has an unknown capability/);

  })

  it('should accept a correct list of capabilities', () => {


    const storageDataType = new StorageDataType({
      name: 'someStorageDataType',
      description: 'Just some description',
      nativeDataType: String,
      serialize() {},
      capabilities: [
        'in',
        'not',
        'contains',
      ],
    })

    assert.deepEqual(storageDataType.capabilities, [ 'in', 'not', 'contains' ]);

  })


  it('should fall back to a simple parse function if none provided', () => {

    const storageDataType = new StorageDataType({
      name: 'someStorageDataType',
      description: 'Just some description',
      nativeDataType: 'integer',
      serialize() {},
    })

    const parsed1 = storageDataType.parse(123)
    const parsed2 = storageDataType.parse('Hello there!')

    assert.strictEqual(parsed1, 123);
    assert.strictEqual(parsed2, 'Hello there!');

  })


  it('should return it\'s name', () => {

    const storageDataType = new StorageDataType({
      name: 'someStorageDataType',
      description: 'Just some description',
      nativeDataType: 'integer',
      serialize() {},
    })

    assert.strictEqual(storageDataType.name, 'someStorageDataType');
    assert.strictEqual(String(storageDataType), 'someStorageDataType');

  })


  it.skip('should have a unique name', () => {
  })


  describe('isStorageDataType', () => {


    it('should recognize objects of type StorageDataType', () => {

      const storageDataType = new StorageDataType({
        name: 'someStorageDataType',
        description: 'Just some description',
        nativeDataType: 'integer',
        serialize() {},
      })

      function fn() {
        passOrThrow(
          isStorageDataType(storageDataType),
          () => 'This error will never happen'
        )
      }

      assert.doesNotThrow(fn)

    })


    it('should recognize non-StorageDataType objects', () => {

      function fn() {
        passOrThrow(
          isStorageDataType({}) ||
          isStorageDataType(function test() {}) ||
          isStorageDataType(assert),
          () => 'Not a StorageDataType object'
        )
      }


      assert.throws(fn, /Not a StorageDataType object/);

    })

  })


})
