
import {
  splitAttributeAndFilterOperator,
  transformFilterLevel,
} from './filter'

import {
  extendModelsForGql,
} from './generator';

import {
  Entity,
  DataTypeBoolean,
  DataTypeString,
  DataTypeInteger,
} from 'shift-engine';

import ProtocolGraphQL from './ProtocolGraphQL';
import ProtocolGraphQLConfiguration from './ProtocolGraphQLConfiguration';


ProtocolGraphQL.setProtocolConfiguration(new ProtocolGraphQLConfiguration())


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


  extendModelsForGql([filteredEntity])


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



  describe('transformFilterLevel', () => {


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
        transformFilterLevel(goodFilter1, filteredEntity.getAttributes(), ['somewhere'])
      ).toEqual(result1)

      expect(
        transformFilterLevel(goodFilter2, filteredEntity.getAttributes(), ['somewhere'])
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
        transformFilterLevel(goodFilter1, filteredEntity.getAttributes(), ['somewhere'])
      ).toEqual(result1)

      expect(
        transformFilterLevel(goodFilter2, filteredEntity.getAttributes(), ['somewhere'])
      ).toEqual(result2)

    })


    it('should throw if provided params are invalid', () => {

      function fn1() {
        transformFilterLevel('a')
      }

      function fn2() {
        transformFilterLevel([], null, [])
      }

      function fn3() {
        transformFilterLevel([], null, ['somewhere'])
      }

      function fn4() {
        transformFilterLevel([], null, ['somewhere', 'deeply', 'nested'])
      }

      function fn5() {
        transformFilterLevel({}, null, ['somewhere', 'deeply', 'nested'])
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
        transformFilterLevel(badFilter1, filteredEntity.getAttributes(), null)
      }

      function fn2() {
        transformFilterLevel(badFilter2, filteredEntity.getAttributes(), null)
      }

      function fn3() {
        transformFilterLevel(badFilter2, filteredEntity.getAttributes(), ['just', 'here'])
      }

      expect(fn1).toThrowErrorMatchingSnapshot();
      expect(fn2).toThrowErrorMatchingSnapshot();
      expect(fn3).toThrowErrorMatchingSnapshot();
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
        transformFilterLevel(badFilter1, filteredEntity.getAttributes(), null)
      }

      function fn2() {
        transformFilterLevel(badFilter2, filteredEntity.getAttributes(), null)
      }

      expect(fn1).toThrowErrorMatchingSnapshot();
      expect(fn2).toThrowErrorMatchingSnapshot();

    })

  })

})
