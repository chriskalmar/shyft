/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable @typescript-eslint/explicit-function-return-type */

import { validateFilterLevel } from './filter';
import { Entity } from './entity/Entity';

import {
  DataTypeBoolean,
  DataTypeString,
  DataTypeInteger,
} from './datatype/dataTypes';

import { StorageType } from './storage/StorageType';
import { StorageDataType } from './storage/StorageDataType';

describe('filter', () => {
  const filteredEntity = new Entity({
    name: 'FilteredEntityName',
    description: 'Just some description',
    attributes: {
      id: {
        type: DataTypeInteger,
        description: 'ID of user',
        primary: true,
      },
      firstName: {
        type: DataTypeString,
        description: 'First name',
      },
      lastName: {
        type: DataTypeString,
        description: 'Last name',
      },
      isActive: {
        type: DataTypeBoolean,
        description: 'User has been active within this month',
      },
    },
  });

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

  const StorageDataTypeAny = new StorageDataType({
    name: 'StorageDataTypeAny',
    description: 'Just some description',
    nativeDataType: 'text',
    serialize() {},
    capabilities: ['lt', 'lte', 'gt', 'gte'],
  });

  const StorageDataTypeText = new StorageDataType({
    name: 'StorageDataTypeText',
    description: 'Just some description',
    nativeDataType: 'text',
    serialize() {},
    capabilities: ['in', 'lt', 'lte', 'gt', 'gte', 'starts_with', 'ends_with'],
  });

  SomeStorageType.addDataTypeMap(DataTypeInteger, StorageDataTypeAny);
  SomeStorageType.addDataTypeMap(DataTypeBoolean, StorageDataTypeAny);
  SomeStorageType.addDataTypeMap(DataTypeString, StorageDataTypeText);

  describe('validateFilterLevel', () => {
    it('should validate filter level', () => {
      const goodFilter1 = {
        lastName: 'Doe',
        firstName: {
          $gte: 'J',
        },
      };

      const goodFilter2 = {
        lastName: {
          $in: ['Doe', 'Smith'],
        },
        firstName: {
          $starts_with: 'Joh',
          $ends_with: 'an',
        },
        isActive: true,
      };

      expect(() =>
        validateFilterLevel(
          goodFilter1,
          filteredEntity.getAttributes(),
          ['somewhere'],
          SomeStorageType,
        ),
      ).not.toThrow();

      expect(() =>
        validateFilterLevel(
          goodFilter2,
          filteredEntity.getAttributes(),
          ['somewhere'],
          SomeStorageType,
        ),
      ).not.toThrow();
    });

    it('should validate nested filter levels', () => {
      const goodFilter1 = {
        lastName: 'Doe',
        $or: [
          {
            firstName: 'Jack',
          },
          {
            firstName: {
              $starts_with: 'A',
            },
            isActive: true,
          },
        ],
      };

      const goodFilter2 = {
        lastName: {
          $gt: 'Tomson',
        },
        firstName: {
          $starts_with: 'Joh',
          $ends_with: 'an',
        },
        $and: [
          {
            lastName: {
              $starts_with: 'Und',
              $ends_with: 'ton',
            },
          },
        ],
        isActive: true,
      };

      expect(() =>
        validateFilterLevel(
          goodFilter1,
          filteredEntity.getAttributes(),
          ['somewhere'],
          SomeStorageType,
        ),
      ).not.toThrow();

      expect(() =>
        validateFilterLevel(
          goodFilter2,
          filteredEntity.getAttributes(),
          ['somewhere'],
          SomeStorageType,
        ),
      ).not.toThrow();
    });

    it('should throw if provided params are invalid', () => {
      function fn1() {
        validateFilterLevel(undefined, undefined, undefined, undefined);
      }

      function fn2() {
        validateFilterLevel([], null, [], undefined);
      }

      function fn3() {
        validateFilterLevel([], null, ['somewhere'], SomeStorageType);
      }

      function fn4() {
        validateFilterLevel(
          [],
          null,
          ['somewhere', 'deeply', 'nested'],
          SomeStorageType,
        );
      }

      function fn5() {
        validateFilterLevel(
          {},
          null,
          ['somewhere', 'deeply', 'nested'],
          SomeStorageType,
        );
      }

      expect(fn1).toThrowErrorMatchingSnapshot();
      expect(fn2).toThrowErrorMatchingSnapshot();
      expect(fn3).toThrowErrorMatchingSnapshot();
      expect(fn4).toThrowErrorMatchingSnapshot();
      expect(fn5).toThrowErrorMatchingSnapshot();
    });

    it('should throw if invalid attributes are used in filter', () => {
      const badFilter1 = {
        lastName: 'Doe',
        firstName: {
          $gte: 'J',
        },
        something: {
          $ne: true,
        },
      };

      const badFilter2 = {
        lastName: 'Doe',
        firstName: {
          gte: 'J',
        },
        anything_here: 'test',
      };

      function fn1() {
        validateFilterLevel(
          badFilter1,
          filteredEntity.getAttributes(),
          null,
          SomeStorageType,
        );
      }

      function fn2() {
        validateFilterLevel(
          badFilter2,
          filteredEntity.getAttributes(),
          null,
          SomeStorageType,
        );
      }

      function fn3() {
        validateFilterLevel(
          badFilter2,
          filteredEntity.getAttributes(),
          ['just', 'here'],
          SomeStorageType,
        );
      }

      expect(fn1).toThrowErrorMatchingSnapshot();
      expect(fn2).toThrowErrorMatchingSnapshot();
      expect(fn3).toThrowErrorMatchingSnapshot();
    });

    it('should throw if invalid operators are used in filter', () => {
      const badFilter1 = {
        lastName: 'Doe',
        isActive: {
          $ends_with: 'J',
        },
      };

      const badFilter2 = {
        lastName: 'Doe',
        firstName: {
          anything: 'J',
        },
      };

      function fn1() {
        validateFilterLevel(
          badFilter1,
          filteredEntity.getAttributes(),
          null,
          SomeStorageType,
        );
      }

      function fn2() {
        validateFilterLevel(
          badFilter2,
          filteredEntity.getAttributes(),
          null,
          SomeStorageType,
        );
      }

      expect(fn1).toThrowErrorMatchingSnapshot();
      expect(fn2).toThrowErrorMatchingSnapshot();
    });
  });
});
