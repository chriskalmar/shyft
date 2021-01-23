/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable no-new */

import { StorageDataType, isStorageDataType } from './StorageDataType';
import { passOrThrow } from '../util';

describe('StorageDataType', () => {
  it('should have a name', () => {
    function fn() {
      // eslint-disable-next-line no-new
      new StorageDataType();
    }

    expect(fn).toThrowErrorMatchingSnapshot();
  });

  it('should have a description', () => {
    function fn() {
      // @ts-expect-error test input validators
      new StorageDataType({
        name: 'example',
      });
    }

    expect(fn).toThrowErrorMatchingSnapshot();
  });

  it('should have a native data type', () => {
    function fn() {
      // @ts-expect-error test input validators
      new StorageDataType({
        name: 'someStorageDataType',
        description: 'Just some description',
      });
    }

    expect(fn).toThrowErrorMatchingSnapshot();
  });

  it('should have a serialize function', () => {
    function fn() {
      // eslint-disable-next-line no-new
      new StorageDataType({
        name: 'someStorageDataType',
        description: 'Just some description',
        nativeDataType: String,
      });
    }

    expect(fn).toThrowErrorMatchingSnapshot();
  });

  it('should have a valid parse function if provided', () => {
    function fn() {
      new StorageDataType({
        name: 'someStorageDataType',
        description: 'Just some description',
        nativeDataType: String,
        serialize() {},
        // @ts-expect-error test input validators
        parse: 12345,
      });
    }

    expect(fn).toThrowErrorMatchingSnapshot();
  });

  it('should have a valid list of capabilities if provided', () => {
    function fn() {
      new StorageDataType({
        name: 'someStorageDataType',
        description: 'Just some description',
        nativeDataType: String,
        serialize() {},
        // @ts-expect-error test input validators
        capabilities: 123,
      });
    }

    expect(fn).toThrowErrorMatchingSnapshot();
  });

  it('should reject invalid capabilities', () => {
    function fn() {
      new StorageDataType({
        name: 'someStorageDataType',
        description: 'Just some description',
        nativeDataType: String,
        serialize() {},
        capabilities: ['in', 'ne', 'magic_unicorn_filter'],
      });
    }

    expect(fn).toThrowErrorMatchingSnapshot();
  });

  it('should accept a correct list of capabilities', () => {
    const storageDataType = new StorageDataType({
      name: 'someStorageDataType',
      description: 'Just some description',
      nativeDataType: String,
      serialize() {},
      capabilities: ['in', 'ne', 'contains'],
    });

    expect(storageDataType.capabilities).toEqual(['in', 'ne', 'contains']);
  });

  it('should fall back to a simple parse function if none provided', () => {
    const storageDataType = new StorageDataType({
      name: 'someStorageDataType',
      description: 'Just some description',
      nativeDataType: 'integer',
      serialize() {},
    });

    const parsed1 = storageDataType.parse(123);
    const parsed2 = storageDataType.parse('Hello there!');

    expect(parsed1).toBe(123);
    expect(parsed2).toBe('Hello there!');
  });

  it("should return it's name", () => {
    const storageDataType = new StorageDataType({
      name: 'someStorageDataType',
      description: 'Just some description',
      nativeDataType: 'integer',
      serialize() {},
    });

    expect(storageDataType.name).toBe('someStorageDataType');
    expect(String(storageDataType)).toBe('someStorageDataType');
  });

  it.skip('should have a unique name', () => {});

  describe('isStorageDataType', () => {
    it('should recognize objects of type StorageDataType', () => {
      const storageDataType = new StorageDataType({
        name: 'someStorageDataType',
        description: 'Just some description',
        nativeDataType: 'integer',
        serialize() {},
      });

      function fn() {
        passOrThrow(
          isStorageDataType(storageDataType),
          () => 'This error will never happen',
        );
      }

      expect(fn).not.toThrow();
    });

    it('should recognize non-StorageDataType objects', () => {
      function fn() {
        passOrThrow(
          isStorageDataType({}) ||
            isStorageDataType(function test() {}) ||
            isStorageDataType(Error),
          () => 'Not a StorageDataType object',
        );
      }

      expect(fn).toThrowErrorMatchingSnapshot();
    });
  });
});
