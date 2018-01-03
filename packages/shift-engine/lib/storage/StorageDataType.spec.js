
import StorageDataType, { isStorageDataType } from './StorageDataType';

import {
  passOrThrow,
} from '../util';


describe('StorageDataType', () => {

  it('should have a name', () => {

    function fn() {
      new StorageDataType() // eslint-disable-line no-new
    }

    expect(fn).toThrow();

  })


  it('should have a description', () => {

    function fn() {
      new StorageDataType({ // eslint-disable-line no-new
        name: 'example'
      })
    }

    expect(fn).toThrow();

  })


  it('should have a native data type', () => {

    function fn() {
      new StorageDataType({ // eslint-disable-line no-new
        name: 'someStorageDataType',
        description: 'Just some description',
      })
    }

    expect(fn).toThrow();

  })


  it('should have a serialize function', () => {

    function fn() {
      new StorageDataType({ // eslint-disable-line no-new
        name: 'someStorageDataType',
        description: 'Just some description',
        nativeDataType: String,
      })
    }

    expect(fn).toThrow();

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

    expect(fn).toThrow();

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

    expect(fn).toThrow();

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

    expect(fn).toThrow();

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

    expect(storageDataType.capabilities).toEqual([ 'in', 'not', 'contains' ]);

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

    expect(parsed1).toBe(123);
    expect(parsed2).toBe('Hello there!');

  })


  it('should return it\'s name', () => {

    const storageDataType = new StorageDataType({
      name: 'someStorageDataType',
      description: 'Just some description',
      nativeDataType: 'integer',
      serialize() {},
    })

    expect(storageDataType.name).toBe('someStorageDataType');
    expect(String(storageDataType)).toBe('someStorageDataType');

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

      expect(fn).not.toThrow()

    })


    it('should recognize non-StorageDataType objects', () => {

      function fn() {
        passOrThrow(
          isStorageDataType({}) ||
          isStorageDataType(function test() {}) ||
          isStorageDataType(Error),
          () => 'Not a StorageDataType object'
        )
      }


      expect(fn).toThrow();

    })

  })


})
