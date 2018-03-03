
import {
  splitAttributeAndFilterOperator,
  processFilterLevel
} from './filter'

import Entity from './entity/Entity';

import {
  DataTypeBoolean,
  DataTypeString,
  DataTypeInteger,
} from './datatype/dataTypes';

import StorageType from './storage/StorageType';
import StorageDataType from './storage/StorageDataType';



describe('filter', () => {

  const filteredEntity = new Entity({
    name: 'FilteredEntityName',
    description: 'Just some description',
    attributes: {
      id: {
        type: DataTypeInteger,
        description: 'ID of user',
        isPrimary: true,
      },
      firstName: {
        type: DataTypeString,
        description: 'First name'
      },
      lastName: {
        type: DataTypeString,
        description: 'Last name'
      },
      isActive: {
        type: DataTypeBoolean,
        description: 'User has been active within this month'
      },
    }
  })


  const SomeStorageType = new StorageType({
    name: 'SomeStorageType',
    description: 'Just some description',
    findOne() { },
    findOneByValues() { },
    find() { },
    count() { },
    mutate() { },
  })

  const StorageDataTypeAny = new StorageDataType({
    name: 'StorageDataTypeAny',
    description: 'Just some description',
    nativeDataType: 'text',
    serialize() { },
    capabilities: [
      'lt',
      'lte',
      'gt',
      'gte',
    ]
  })

  const StorageDataTypeText = new StorageDataType({
    name: 'StorageDataTypeText',
    description: 'Just some description',
    nativeDataType: 'text',
    serialize() { },
    capabilities: [
      'in',
      'lt',
      'lte',
      'gt',
      'gte',
      'starts_with',
      'ends_with',
    ],
  })


  SomeStorageType.addDataTypeMap(DataTypeInteger, StorageDataTypeAny)
  SomeStorageType.addDataTypeMap(DataTypeBoolean, StorageDataTypeAny)
  SomeStorageType.addDataTypeMap(DataTypeString, StorageDataTypeText)



  describe('splitAttributeAndFilterOperator', () => {


    it('should split attributes from operators', () => {

      expect(splitAttributeAndFilterOperator('test')).toEqual({ attributeName: 'test' })
      expect(splitAttributeAndFilterOperator('__test')).toEqual({ attributeName: '__test' })
      expect(splitAttributeAndFilterOperator('login__lt')).toEqual({ attributeName: 'login', operator: 'lt' })
      expect(splitAttributeAndFilterOperator('firstName__gte')).toEqual({ attributeName: 'firstName', operator: 'gte' })
      expect(splitAttributeAndFilterOperator('last_name__ne')).toEqual({ attributeName: 'last_name', operator: 'ne' })
      expect(splitAttributeAndFilterOperator('some__long_attribute__name__lte')).toEqual({ attributeName: 'some__long_attribute__name', operator: 'lte' })
      expect(splitAttributeAndFilterOperator('__some_name__ne')).toEqual({ attributeName: '__some_name', operator: 'ne' })
      expect(splitAttributeAndFilterOperator('___some_name__ne')).toEqual({ attributeName: '___some_name', operator: 'ne' })
      expect(splitAttributeAndFilterOperator('___some_name___ne')).toEqual({ attributeName: '___some_name_', operator: 'ne' })

    })


    it('should fail on wrong inputs', () => {


      function fn1() {
        splitAttributeAndFilterOperator()
      }

      function fn2() {
        splitAttributeAndFilterOperator([])
      }

      function fn3() {
        splitAttributeAndFilterOperator({ any: 'thing' })
      }

      function fn4() {
        splitAttributeAndFilterOperator('name__')
      }

      function fn5() {
        splitAttributeAndFilterOperator('name___')
      }

      expect(fn1).toThrowErrorMatchingSnapshot();
      expect(fn2).toThrowErrorMatchingSnapshot();
      expect(fn3).toThrowErrorMatchingSnapshot();
      expect(fn4).toThrowErrorMatchingSnapshot();
      expect(fn5).toThrowErrorMatchingSnapshot();

    })

  })



  describe('processFilterLevel', () => {


    it('should process filter level', () => {

      const goodFilter1 = {
        lastName: 'Doe',
        firstName__gte: 'J',
      }

      const result1 = {
        lastName: 'Doe',
        firstName: {
          $gte: 'J'
        }
      }


      const goodFilter2 = {
        lastName__in: ['Doe', 'Smith'],
        firstName__starts_with: 'Joh',
        firstName__ends_with: 'an',
        isActive: true,
      }

      const result2 = {
        lastName: {
          $in: ['Doe', 'Smith'],
        },
        firstName: {
          $starts_with: 'Joh',
          $ends_with: 'an',
        },
        isActive: true,
      }


      expect(
        processFilterLevel(goodFilter1, filteredEntity.getAttributes(), ['somewhere'], SomeStorageType)
      ).toEqual(result1)

      expect(
        processFilterLevel(goodFilter2, filteredEntity.getAttributes(), ['somewhere'], SomeStorageType)
      ).toEqual(result2)

    })


    it('should process nested filter levels', () => {

      const goodFilter1 = {
        lastName: 'Doe',
        OR: [
          {
            firstName: 'Jack'
          },
          {
            firstName__starts_with: 'A',
            isActive: true
          }
        ]
      }

      const result1 = {
        lastName: 'Doe',
        $or: [
          {
            firstName: 'Jack'
          },
          {
            firstName: {
              $starts_with: 'A'
            },
            isActive: true
          }
        ]
      }


      const goodFilter2 = {
        lastName__gt: 'Tomson',
        firstName__starts_with: 'Joh',
        firstName__ends_with: 'an',
        AND: [
          {
            lastName__starts_with: 'Und',
            lastName__ends_with: 'ton',
          }
        ],
        isActive: true,
      }

      const result2 = {
        lastName: {
          $gt: 'Tomson'
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
            }
          }
        ],
        isActive: true,
      }


      expect(
        processFilterLevel(goodFilter1, filteredEntity.getAttributes(), ['somewhere'], SomeStorageType)
      ).toEqual(result1)

      expect(
        processFilterLevel(goodFilter2, filteredEntity.getAttributes(), ['somewhere'], SomeStorageType)
      ).toEqual(result2)

    })


    it('should throw if provided params are invalid', () => {

      function fn1() {
        processFilterLevel()
      }

      function fn2() {
        processFilterLevel([], null, [])
      }

      function fn3() {
        processFilterLevel([], null, ['somewhere'], SomeStorageType)
      }

      function fn4() {
        processFilterLevel([], null, ['somewhere', 'deeply', 'nested'], SomeStorageType)
      }

      function fn5() {
        processFilterLevel({}, null, ['somewhere', 'deeply', 'nested'], SomeStorageType)
      }

      expect(fn1).toThrowErrorMatchingSnapshot();
      expect(fn2).toThrowErrorMatchingSnapshot();
      expect(fn3).toThrowErrorMatchingSnapshot();
      expect(fn4).toThrowErrorMatchingSnapshot();
      expect(fn5).toThrowErrorMatchingSnapshot();

    })


    it('should throw if invalid attributes are used in filter', () => {

      const badFilter1 = {
        lastName: 'Doe',
        firstName__gte: 'J',
        something__ne: true,
      }

      const badFilter2 = {
        lastName: 'Doe',
        firstName__gte: 'J',
        anything_here: 'test',
      }


      function fn1() {
        processFilterLevel(badFilter1, filteredEntity.getAttributes(), null, SomeStorageType)
      }

      function fn2() {
        processFilterLevel(badFilter2, filteredEntity.getAttributes(), null, SomeStorageType)
      }

      function fn3() {
        processFilterLevel(badFilter2, filteredEntity.getAttributes(), ['just', 'here'], SomeStorageType)
      }

      expect(fn1).toThrowErrorMatchingSnapshot();
      expect(fn2).toThrowErrorMatchingSnapshot();
      expect(fn3).toThrowErrorMatchingSnapshot();
    })


    it('should throw if invalid operators are used in filter', () => {

      const badFilter1 = {
        lastName: 'Doe',
        isActive__ends_with: 'J',
      }

      const badFilter2 = {
        lastName: 'Doe',
        firstName__anything: 'J',
      }


      function fn1() {
        processFilterLevel(badFilter1, filteredEntity.getAttributes(), null, SomeStorageType)
      }

      function fn2() {
        processFilterLevel(badFilter2, filteredEntity.getAttributes(), null, SomeStorageType)
      }

      expect(fn1).toThrowErrorMatchingSnapshot();
      expect(fn2).toThrowErrorMatchingSnapshot();
    })


    it('should throw if exact match operators is used with another operator on the same attribute', () => {

      const badFilter1 = {
        lastName__in: ['Doe', 'Smith'],
        firstName__starts_with: 'Joh',
        firstName__ends_with: 'an',
        firstName: 'Frank',
        isActive: true,
      }

      const badFilter2 = {
        lastName__in: ['Doe', 'Smith'],
        firstName: 'Frank',
        firstName__starts_with: 'Joh',
        firstName__ends_with: 'an',
        isActive: true,
      }

      function fn1() {
        processFilterLevel(badFilter1, filteredEntity.getAttributes(), null, SomeStorageType)
      }

      function fn2() {
        processFilterLevel(badFilter2, filteredEntity.getAttributes(), null, SomeStorageType)
      }

      expect(fn1).toThrowErrorMatchingSnapshot();
      expect(fn2).toThrowErrorMatchingSnapshot();

    })

  })

})
