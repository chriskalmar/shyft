/* eslint-disable @typescript-eslint/no-empty-function */

import { StorageType, isStorageType } from './StorageType';
import { StorageDataType } from './StorageDataType';
import { passOrThrow } from '../util';

import { StorageTypeNull } from './StorageTypeNull';

import { DataTypeID, DataTypeString } from '../datatype/dataTypes';

describe('StorageType', () => {
  it('should have a name', () => {
    function fn() {
      new StorageType(); // eslint-disable-line no-new
    }

    expect(fn).toThrowErrorMatchingSnapshot();
  });

  it('should have a description', () => {
    function fn() {
      // eslint-disable-next-line no-new
      new StorageType({
        name: 'Example',
      });
    }

    expect(fn).toThrowErrorMatchingSnapshot();
  });

  it("should return it's name", () => {
    const SomeStorageType = new StorageType({
      name: 'SomeStorageType',
      description: 'Just some description',
      findOne() {},
      findOneByValues() {},
      find() {},
      count() {},
      mutate() {},
      checkLookupPermission() {},
    });

    expect(SomeStorageType.name).toBe('SomeStorageType');
    expect(String(SomeStorageType)).toBe('SomeStorageType');
  });

  it('should throw on missing data fetching implementations', () => {
    let fn;

    fn = () => {
      // eslint-disable-next-line no-new
      new StorageType({
        name: 'SomeStorageType',
        description: 'Just some description',
      });
    };

    expect(fn).toThrowErrorMatchingSnapshot();

    fn = () => {
      // eslint-disable-next-line no-new
      new StorageType({
        name: 'SomeStorageType',
        description: 'Just some description',
        findOne() {},
      });
    };

    expect(fn).toThrowErrorMatchingSnapshot();

    fn = () => {
      // eslint-disable-next-line no-new
      new StorageType({
        name: 'SomeStorageType',
        description: 'Just some description',
        findOne() {},
        findOneByValues() {},
      });
    };

    expect(fn).toThrowErrorMatchingSnapshot();

    fn = () => {
      // eslint-disable-next-line no-new
      new StorageType({
        name: 'SomeStorageType',
        description: 'Just some description',
        findOne() {},
        findOneByValues() {},
        find() {},
      });
    };

    expect(fn).toThrowErrorMatchingSnapshot();

    fn = () => {
      // eslint-disable-next-line no-new
      new StorageType({
        name: 'SomeStorageType',
        description: 'Just some description',
        findOne() {},
        findOneByValues() {},
        find() {},
        count() {},
      });
    };

    expect(fn).toThrowErrorMatchingSnapshot();
  });

  describe('data type mapping', () => {
    const SomeStorageType = new StorageType({
      name: 'SomeStorageType',
      description: 'Just some description',
      findOne() {},
      findOneByValues() {},
      find() {},
      count() {},
      mutate() {},
      checkLookupPermission() {},
    });

    const StorageDataTypeText = new StorageDataType({
      name: 'StorageDataTypeText',
      description: 'Just some description',
      nativeDataType: 'text',
      serialize() {},
    });

    it('should accept new mappings', () => {
      SomeStorageType.addDataTypeMap(DataTypeID, StorageDataTypeText);
      SomeStorageType.addDataTypeMap(DataTypeString, StorageDataTypeText);
    });

    it('should reject invalid schema data types', () => {
      function fn() {
        SomeStorageType.addDataTypeMap({ some: 'thing' }, StorageDataTypeText);
      }

      expect(fn).toThrowErrorMatchingSnapshot();
    });

    it('should reject invalid storage data types', () => {
      function fn() {
        SomeStorageType.addDataTypeMap(DataTypeString, { someThing: 'else' });
      }

      expect(fn).toThrowErrorMatchingSnapshot();
    });

    it('should throw on duplicate mappings', () => {
      function fn() {
        SomeStorageType.addDataTypeMap(DataTypeID, StorageDataTypeText);
      }

      expect(fn).toThrowErrorMatchingSnapshot();
    });
  });

  describe('isStorageType', () => {
    it('should recognize objects of type StorageType', () => {
      const SomeStorageType = new StorageType({
        name: 'SomeStorageType',
        description: 'Just some description',
        findOne() {},
        findOneByValues() {},
        find() {},
        count() {},
        mutate() {},
        checkLookupPermission() {},
      });

      function fn() {
        passOrThrow(
          isStorageType(SomeStorageType) && isStorageType(StorageTypeNull),
          () => 'This error will never happen',
        );
      }

      expect(fn).not.toThrow();
    });

    it('should recognize non-StorageType objects', () => {
      function fn() {
        passOrThrow(
          isStorageType({}) ||
            isStorageType(function test() {}) ||
            isStorageType(Error),
          () => 'Not an StorageType object',
        );
      }

      expect(fn).toThrowErrorMatchingSnapshot();
    });
  });
});
