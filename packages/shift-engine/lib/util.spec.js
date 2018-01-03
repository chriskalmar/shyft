
import Entity from './entity/Entity';
import Index, { INDEX_UNIQUE } from './index/Index';

import {
  passOrThrow,
  resolveFunctionMap,
  isMap,
  isArray,
  mergeMaps,
  mapOverProperties,
  sortDataByKeys,
  processCursor,
  reverseString,
  splitAttributeAndFilterOperator,
  processFilterLevel,
  // processFilter,
} from './util';

import {
  DataTypeBoolean,
  DataTypeString,
  DataTypeInteger,
} from './datatype/dataTypes';

import StorageType from './storage/StorageType';
import StorageDataType from './storage/StorageDataType';


describe('util', () => {


  describe('passOrThrow', () => {


    it('should pass on positive condition', () => {

      function fn() {
        passOrThrow(
          1 < 2,
          () => 'This error will never happen'
        )
      }

      expect(fn).not.toThrow()

    })


    it('should throw on negative condition', () => {

      function fn() {
        passOrThrow(
          1 > 2,
          () => 'This is the very very super important error'
        )
      }


      expect(fn).toThrowErrorMatchingSnapshot();

    })


    it('should throw if message is not a function', () => {

      function fn() {
        passOrThrow(
          1 > 0,
          'This is the very very super important error'
        )
      }


      expect(fn).toThrowErrorMatchingSnapshot();

    })

  })



  describe('resolveFunctionMap', () => {

    const dataMap = {
      a: 123,
      b: 456,
    }


    it('should return the provided map', () => {

      const result = resolveFunctionMap(dataMap)

      expect(result).toEqual(dataMap)
    })


    it('should return the result of the provided function', () => {

      const result = resolveFunctionMap(() => {
        return dataMap
      })

      expect(result).toEqual(dataMap)

    })

  })



  describe('isMap', () => {


    it('should accept maps', () => {

      expect(isMap({})).toBe(true)
      expect(isMap({ a: 123 })).toBe(true)
      expect(isMap(Object.create({}))).toBe(true)
      expect(isMap(DataTypeBoolean)).toBe(true)

    })


    it('should reject non-maps', () => {

      expect(isMap()).toBe(false)
      expect(isMap(null)).toBe(false)
      expect(isMap(undefined)).toBe(false)
      expect(isMap([])).toBe(false)
      expect(isMap([1, 2, 3])).toBe(false)
      expect(isMap(() => {})).toBe(false)
      expect(isMap(1234567)).toBe(false)

    })


    it('should reject empty maps if flag `nonEmpty` is set', () => {

      expect(isMap({}, true)).toBe(false)

    })

  })



  describe('isArray', () => {


    it('should accept arrays', () => {

      expect(isArray([])).toBe(true)
      expect(isArray([ 'test' ])).toBe(true)
      expect(isArray([1, 2, 3])).toBe(true)

    })


    it('should reject non-arrays', () => {

      expect(isArray()).toBe(false)
      expect(isArray(null)).toBe(false)
      expect(isArray(undefined)).toBe(false)
      expect(isArray(Object.create({}))).toBe(false)
      expect(isArray(DataTypeBoolean)).toBe(false)
      expect(isArray(() => {})).toBe(false)
      expect(isArray(1234567)).toBe(false)

    })


    it('should reject empty arrays if flag `nonEmpty` is set', () => {

      expect(isArray([], true)).toBe(false)

    })

  })


  describe('mergeMaps', () => {


    it('should merge 2 maps', () => {

      let obj

      obj = mergeMaps({}, {})
      expect(obj).toEqual({})

      obj = mergeMaps({ a: 123 }, {})
      expect(obj).toEqual({ a: 123 })

      obj = mergeMaps({}, { b: 456 })
      expect(obj).toEqual({ b: 456 })

      obj = mergeMaps({ a: 123 }, { b: 456 })
      expect(obj).toEqual({ a: 123, b: 456 })

      obj = mergeMaps({ b: 456 }, { a: 123 })
      expect(obj).toEqual({ a: 123, b: 456 })

      obj = mergeMaps({ a: 123, b: 456 }, { b: 789 })
      expect(obj).toEqual({ a: 123, b: 789 })

      obj = mergeMaps({ a: 123, b: [ 1, 2, 4], c: { deep: [ 7, 8, 9 ]} }, { b: { b1: 1, b2: 2 } })
      expect(obj).toEqual({ a: 123, b: { b1: 1, b2: 2 }, c: { deep: [ 7, 8, 9 ]} })

    })


    it('should throw if non-maps are provided', () => {

      function fn1() {
        mergeMaps()
      }

      function fn2() {
        mergeMaps({ a: 123 }, [])
      }

      function fn3() {
        mergeMaps('string', {})
      }

      expect(fn1).toThrowErrorMatchingSnapshot();
      expect(fn2).toThrowErrorMatchingSnapshot();
      expect(fn3).toThrowErrorMatchingSnapshot();

    })

  })


  describe('mapOverProperties', () => {


    it('should map over properties and call interatee', () => {

      const keys = []
      let sum = 0

      function iteratee(val, key) {
        sum += val;
        keys.push(key)
      }

      const someMap = {
        a: 1,
        b: 4,
        c: 8,
      }

      mapOverProperties(someMap, iteratee)

      expect(keys).toEqual([ 'a', 'b', 'c' ])
      expect(sum).toBe(13)

    })


    it('should throw if non-maps are provided', () => {

      function fn1() {
        mapOverProperties()
      }

      function fn2() {
        mapOverProperties([])
      }

      function fn3() {
        mapOverProperties('string')
      }

      expect(fn1).toThrowErrorMatchingSnapshot();
      expect(fn2).toThrowErrorMatchingSnapshot();
      expect(fn3).toThrowErrorMatchingSnapshot();

    })


    it('should throw if iteratee is not a function', () => {

      function fn1() {
        mapOverProperties({})
      }

      function fn2() {
        mapOverProperties({}, [])
      }

      function fn3() {
        mapOverProperties({}, 'string')
      }

      expect(fn1).toThrowErrorMatchingSnapshot();
      expect(fn2).toThrowErrorMatchingSnapshot();
      expect(fn3).toThrowErrorMatchingSnapshot();

    })

  })



  describe('sortDataByKeys', () => {


    it('should return empty result if keys list is empty or invalid', () => {

      const result1 = sortDataByKeys([], { a: 1, b: 3})
      const result2 = sortDataByKeys({}, { a: 1, b: 3})
      const result3 = sortDataByKeys(null, { a: 1, b: 3})

      expect(result1).toEqual([])
      expect(result2).toEqual([])
      expect(result3).toEqual([])

    })


    it('should return null-filled array if data list is empty or invalid', () => {

      const result1 = sortDataByKeys([ 'a', 'b' ], null)
      const result2 = sortDataByKeys([ 'a' ], {})
      const result3 = sortDataByKeys([ 'a', 'b', 'f' ], [])

      expect(result1).toEqual([ null, null ])
      expect(result2).toEqual([ null ])
      expect(result3).toEqual([ null, null, null ])

    })


    it('should sort data based on keys', () => {

      const data = [
        { id: 'a', val: 'lorem' },
        { id: 'b', val: 'ipsum' },
        { id: 'c', val: 'dolor' },
        { id: 'd', val: 'et' },
        { id: 'e', val: 'unde' },
        { id: 'f', val: 'omnis' },
        { id: 'g', val: 'iste' },
        { id: 'a', val: 'natus' },
        { id: 'b', val: 'voluptatem' },
        { id: 'c', val: 'doloremque' },
      ]

      const keys1 = [ 'a', 'c', 'f' ]
      const keys2 = [ 'e', 'e', 'b', 'b', 'c' ]
      const keys3 = [ 'g' ]
      const keys4 = [ 'a-unknown', 'f', 'c-unknown', 'g', 'c', 'd-unkown', 'c', 'hh' ]

      const result1 = sortDataByKeys(keys1, data)
      const result2 = sortDataByKeys(keys2, data)
      const result3 = sortDataByKeys(keys3, data)
      const result4 = sortDataByKeys(keys4, data)

      expect(result1).toEqual([
        { id: 'a', val: 'lorem' },
        { id: 'c', val: 'dolor' },
        { id: 'f', val: 'omnis' },
      ])

      expect(result2).toEqual([
        { id: 'e', val: 'unde' },
        { id: 'e', val: 'unde' },
        { id: 'b', val: 'ipsum' },
        { id: 'b', val: 'voluptatem' },
        { id: 'c', val: 'dolor' },
      ])

      expect(result3).toEqual([
        { id: 'g', val: 'iste' },
      ])

      expect(result4).toEqual([
        null,
        { id: 'f', val: 'omnis' },
        null,
        { id: 'g', val: 'iste' },
        { id: 'c', val: 'dolor' },
        null,
        { id: 'c', val: 'doloremque' },
        null,
      ])

    })

  })



  describe('processCursor', () => {

    const SomeEntity = new Entity({
      name: 'SomeEntity',
      description: 'Just some description',
      attributes: {
        loginName: {
          type: DataTypeString,
          description: 'Just some description',
        },
        firstName: {
          type: DataTypeString,
          description: 'Just some description',
        },
        lastName: {
          type: DataTypeString,
          description: 'Just some description',
        },
        email: {
          type: DataTypeString,
          description: 'Just some description',
        },
      },
      indexes: [
        new Index({
          type: INDEX_UNIQUE,
          attributes: [
            'loginName',
          ]
        }),
        new Index({
          type: INDEX_UNIQUE,
          attributes: [
            'firstName',
            'lastName',
          ]
        }),
        new Index({
          type: INDEX_UNIQUE,
          attributes: [
            'email',
          ]
        }),
      ]
    })

    SomeEntity.getIndexes()


    it('should return empty clause if no cursor provided', () => {

      const result = processCursor()

      expect(result).toEqual({})
    })


    it('should throw if incompatible cursor provided', () => {

      function fn() {
        processCursor({}, { a: 'b' })
      }

      expect(fn).toThrowErrorMatchingSnapshot();

    })


    it('should throw if cursor is malformed', () => {

      function fn1() {
        processCursor(SomeEntity, { 'SomeEntity': [ 'b' ] }, [])
      }

      function fn2() {
        processCursor(SomeEntity, { 'SomeEntity': [ [ {}, {}, {} ] ] }, [])
      }

      function fn3() {
        processCursor(SomeEntity, { 'SomeEntity': [ {} ] }, [])
      }

      expect(fn1).toThrowErrorMatchingSnapshot();
      expect(fn2).toThrowErrorMatchingSnapshot();
      expect(fn3).toThrowErrorMatchingSnapshot();

    })



    it('should throw if unknown attribute is used', () => {

      function fn() {
        processCursor(SomeEntity, {
          'SomeEntity': [
            [ 'iDontKnow', 123 ]
          ]
        }, [])
      }

      expect(fn).toThrowErrorMatchingSnapshot();

    })


    it('should throw if an attribute is used which the data set is not sorted by', () => {

      function fn1() {
        processCursor(SomeEntity, {
          'SomeEntity': [
            [ 'loginName', 123 ]
          ]
        })
      }

      function fn2() {
        processCursor(SomeEntity, {
          'SomeEntity': [
            [ 'loginName', 123 ]
          ]
        }, [
          {
            attribute: 'a',
            direction: 'ASC'
          }
        ])
      }

      function fn3() {
        processCursor(SomeEntity, {
          'SomeEntity': [
            [ 'loginName', 123 ],
            [ 'email', 123 ]
          ]
        }, [
          {
            attribute: 'loginName',
            direction: 'ASC'
          }
        ])
      }

      expect(fn1).toThrowErrorMatchingSnapshot();
      expect(fn2).toThrowErrorMatchingSnapshot();
      expect(fn3).toThrowErrorMatchingSnapshot();

    })


    it('should throw if none of the attributes are defined as unique', () => {

      function fn1() {
        processCursor(SomeEntity, {
          'SomeEntity': [
            [ 'firstName', 'John' ]
          ]
        }, [
          {
            attribute: 'firstName',
            direction: 'ASC'
          }
        ])
      }

      function fn2() {
        processCursor(SomeEntity, {
          'SomeEntity': [
            [ 'firstName', 'John' ],
            [ 'lastName', 'Snow' ],
          ]
        }, [
          {
            attribute: 'firstName',
            direction: 'ASC'
          },
          {
            attribute: 'lastName',
            direction: 'ASC'
          }
        ])
      }

      expect(fn1).toThrowErrorMatchingSnapshot();
      expect(fn2).toThrowErrorMatchingSnapshot();

    })



    describe('should return a filter clause based on the provided cursor', () => {


      it('when using attributes that are defined as unique', () => {

        const cursor1 = processCursor(
          SomeEntity,
          {
            'SomeEntity': [
              [ 'loginName', 'user1' ]
            ]
          },
          [
            {
              attribute: 'loginName',
              direction: 'ASC',
            }
          ]
        )

        const result1 = {
          loginName: {
            $gt: 'user1',
          }
        }


        const cursor2 = processCursor(
          SomeEntity,
          {
            'SomeEntity': [
              [ 'loginName', 123 ]
            ]
          },
          [
            {
              attribute: 'loginName',
              direction: 'DESC',
            }
          ]
        )

        const result2 = {
          loginName: {
            $lt: 123,
          }
        }


        const cursor3 = processCursor(
          SomeEntity,
          {
            'SomeEntity': [
              [ 'loginName', 'user1' ],
              [ 'email', 'user1@example.com' ],
            ]
          },
          [
            {
              attribute: 'email',
              direction: 'ASC',
            },
            {
              attribute: 'loginName',
              direction: 'DESC',
            },
          ]
        )

        const result3 = {
          loginName: {
            $lt: 'user1',
          },
        }

        expect(cursor1).toEqual(result1)
        expect(cursor2).toEqual(result2)
        expect(cursor3).toEqual(result3)

      })


      it('when using attributes that are not all defined as unique', () => {

        const row1 = {
          'SomeEntity': [
            [ 'firstName', 'John' ],
            [ 'id', 1123 ],
          ]
        }

        const cursor1 = processCursor(
          SomeEntity,
          row1,
          [
            {
              attribute: 'firstName',
              direction: 'ASC',
            },
            {
              attribute: 'id',
              direction: 'ASC',
            },
          ]
        )

        const result1 = {
          firstName: {
            $gte: 'John',
          },
          $not: {
            id: {
              $lte: 1123,
            },
            firstName: 'John',
          }
        }


        const cursor2 = processCursor(
          SomeEntity,
          row1,
          [
            {
              attribute: 'firstName',
              direction: 'ASC',
            },
            {
              attribute: 'id',
              direction: 'DESC',
            },
          ]
        )

        const result2 = {
          firstName: {
            $gte: 'John',
          },
          $not: {
            id: {
              $gte: 1123,
            },
            firstName: 'John',
          }
        }


        const cursor3 = processCursor(
          SomeEntity,
          row1,
          [
            {
              attribute: 'firstName',
              direction: 'DESC',
            },
            {
              attribute: 'id',
              direction: 'DESC',
            },
          ]
        )

        const result3 = {
          firstName: {
            $lte: 'John',
          },
          $not: {
            id: {
              $gte: 1123,
            },
            firstName: 'John',
          }
        }


        const cursor4 = processCursor(
          SomeEntity,
          row1,
          [
            {
              attribute: 'firstName',
              direction: 'DESC',
            },
            {
              attribute: 'id',
              direction: 'ASC',
            },
          ]
        )

        const result4 = {
          firstName: {
            $lte: 'John',
          },
          $not: {
            id: {
              $lte: 1123,
            },
            firstName: 'John',
          }
        }



        const row2 = {
          'SomeEntity': [
            [ 'firstName', 'John' ],
            [ 'lastName', 'Snow' ],
            [ 'id', 1123 ],
          ]
        }

        const cursor5 = processCursor(
          SomeEntity,
          row2,
          [
            {
              attribute: 'firstName',
              direction: 'ASC',
            },
            {
              attribute: 'lastName',
              direction: 'ASC',
            },
            {
              attribute: 'id',
              direction: 'ASC',
            },
          ]
        )

        const result5 = {
          firstName: {
            $gte: 'John',
          },
          $not: {
            id: {
              $lte: 1123,
            },
            firstName: 'John',
          }
        }


        const cursor6 = processCursor(
          SomeEntity,
          row2,
          [
            {
              attribute: 'firstName',
              direction: 'ASC',
            },
            {
              attribute: 'lastName',
              direction: 'DESC',
            },
            {
              attribute: 'id',
              direction: 'DESC',
            },
          ]
        )

        const result6 = {
          firstName: {
            $gte: 'John',
          },
          $not: {
            id: {
              $gte: 1123,
            },
            firstName: 'John',
          }
        }


        const row3 = {
          'SomeEntity': [
            [ 'firstName', 'John' ],
            [ 'email', 'john@example.com' ],
            [ 'lastName', 'Snow' ],
            [ 'id', 1123 ],
          ]
        }

        const cursor7 = processCursor(
          SomeEntity,
          row3,
          [
            {
              attribute: 'firstName',
              direction: 'ASC',
            },
            {
              attribute: 'email',
              direction: 'DESC',
            },
            {
              attribute: 'lastName',
              direction: 'DESC',
            },
            {
              attribute: 'id',
              direction: 'DESC',
            },
          ]
        )

        const result7 = {
          firstName: {
            $gte: 'John',
          },
          $not: {
            email: {
              $gte: 'john@example.com',
            },
            firstName: 'John',
          }
        }



        expect(cursor1).toEqual(result1)
        expect(cursor2).toEqual(result2)
        expect(cursor3).toEqual(result3)
        expect(cursor4).toEqual(result4)
        expect(cursor5).toEqual(result5)
        expect(cursor6).toEqual(result6)
        expect(cursor7).toEqual(result7)

      })



      it('when using in reverse mode', () => {

        const cursor0 = processCursor(
          SomeEntity,
          {
            'SomeEntity': [
              [ 'loginName', 123 ]
            ]
          },
          [
            {
              attribute: 'loginName',
              direction: 'DESC',
            }
          ],
          true
        )

        const result0 = {
          loginName: {
            $gt: 123,
          }
        }


        const row1 = {
          'SomeEntity': [
            [ 'firstName', 'John' ],
            [ 'id', 1123 ],
          ]
        }


        const cursor1 = processCursor(
          SomeEntity,
          row1,
          [
            {
              attribute: 'firstName',
              direction: 'ASC',
            },
            {
              attribute: 'id',
              direction: 'ASC',
            },
          ],
          true
        )

        const result1 = {
          firstName: {
            $lte: 'John',
          },
          $not: {
            id: {
              $gte: 1123,
            },
            firstName: 'John',
          }
        }


        const cursor2 = processCursor(
          SomeEntity,
          row1,
          [
            {
              attribute: 'firstName',
              direction: 'ASC',
            },
            {
              attribute: 'id',
              direction: 'DESC',
            },
          ],
          true
        )

        const result2 = {
          firstName: {
            $lte: 'John',
          },
          $not: {
            id: {
              $lte: 1123,
            },
            firstName: 'John',
          }
        }


        const cursor3 = processCursor(
          SomeEntity,
          row1,
          [
            {
              attribute: 'firstName',
              direction: 'DESC',
            },
            {
              attribute: 'id',
              direction: 'DESC',
            },
          ],
          true
        )

        const result3 = {
          firstName: {
            $gte: 'John',
          },
          $not: {
            id: {
              $lte: 1123,
            },
            firstName: 'John',
          }
        }


        const cursor4 = processCursor(
          SomeEntity,
          row1,
          [
            {
              attribute: 'firstName',
              direction: 'DESC',
            },
            {
              attribute: 'id',
              direction: 'ASC',
            },
          ],
          true
        )

        const result4 = {
          firstName: {
            $gte: 'John',
          },
          $not: {
            id: {
              $gte: 1123,
            },
            firstName: 'John',
          }
        }


        const row2 = {
          'SomeEntity': [
            [ 'firstName', 'John' ],
            [ 'lastName', 'Snow' ],
            [ 'id', 1123 ],
          ]
        }

        const cursor5 = processCursor(
          SomeEntity,
          row2,
          [
            {
              attribute: 'firstName',
              direction: 'ASC',
            },
            {
              attribute: 'lastName',
              direction: 'ASC',
            },
            {
              attribute: 'id',
              direction: 'ASC',
            },
          ],
          true
        )

        const result5 = {
          firstName: {
            $lte: 'John',
          },
          $not: {
            id: {
              $gte: 1123,
            },
            firstName: 'John',
          }
        }


        const cursor6 = processCursor(
          SomeEntity,
          row2,
          [
            {
              attribute: 'firstName',
              direction: 'ASC',
            },
            {
              attribute: 'lastName',
              direction: 'DESC',
            },
            {
              attribute: 'id',
              direction: 'DESC',
            },
          ],
          true
        )

        const result6 = {
          firstName: {
            $lte: 'John',
          },
          $not: {
            id: {
              $lte: 1123,
            },
            firstName: 'John',
          }
        }


        const row3 = {
          'SomeEntity': [
            [ 'firstName', 'John' ],
            [ 'email', 'john@example.com' ],
            [ 'lastName', 'Snow' ],
            [ 'id', 1123 ],
          ]
        }

        const cursor7 = processCursor(
          SomeEntity,
          row3,
          [
            {
              attribute: 'firstName',
              direction: 'ASC',
            },
            {
              attribute: 'email',
              direction: 'DESC',
            },
            {
              attribute: 'lastName',
              direction: 'DESC',
            },
            {
              attribute: 'id',
              direction: 'DESC',
            },
          ],
          true
        )

        const result7 = {
          firstName: {
            $lte: 'John',
          },
          $not: {
            email: {
              $lte: 'john@example.com',
            },
            firstName: 'John',
          }
        }


        expect(cursor0).toEqual(result0)
        expect(cursor1).toEqual(result1)
        expect(cursor2).toEqual(result2)
        expect(cursor3).toEqual(result3)
        expect(cursor4).toEqual(result4)
        expect(cursor5).toEqual(result5)
        expect(cursor6).toEqual(result6)
        expect(cursor7).toEqual(result7)

      })

    })

  })



  describe('reverseString', () => {


    it('should reverse a string', () => {

      expect(reverseString('hello')).toEqual('olleh')
      expect(reverseString('')).toEqual('')
      expect(reverseString('a')).toEqual('a')
      expect(reverseString('aBC')).toEqual('CBa')
      expect(reverseString(' x y ')).toEqual(' y x ')

    })
  })



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
      findOne() {},
      findOneByValues() {},
      find() {},
      count() {},
      mutate() {},
    })

    const StorageDataTypeAny = new StorageDataType({
      name: 'StorageDataTypeAny',
      description: 'Just some description',
      nativeDataType: 'text',
      serialize() {},
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
      serialize() {},
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
        expect(splitAttributeAndFilterOperator('firstName__gte')).toEqual({ attributeName: 'firstName', operator: 'gte'})
        expect(splitAttributeAndFilterOperator('last_name__not')).toEqual({ attributeName: 'last_name', operator: 'not' })
        expect(splitAttributeAndFilterOperator('some__long_attribute__name__lte')).toEqual({ attributeName: 'some__long_attribute__name', operator: 'lte' })
        expect(splitAttributeAndFilterOperator('__some_name__not')).toEqual({ attributeName: '__some_name', operator: 'not' })
        expect(splitAttributeAndFilterOperator('___some_name__not')).toEqual({ attributeName: '___some_name', operator: 'not' })
        expect(splitAttributeAndFilterOperator('___some_name___not')).toEqual({ attributeName: '___some_name_', operator: 'not' })

      })


      it('should fail on wrong inputs', () => {


        function fn1() {
          splitAttributeAndFilterOperator()
        }

        function fn2() {
          splitAttributeAndFilterOperator([])
        }

        function fn3() {
          splitAttributeAndFilterOperator({ any: 'thing'})
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
          lastName__in: [ 'Doe', 'Smith' ],
          firstName__starts_with: 'Joh',
          firstName__ends_with: 'an',
          isActive: true,
        }

        const result2 = {
          lastName: {
            $in: [ 'Doe', 'Smith' ],
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
          something__not: true,
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
          lastName__in: [ 'Doe', 'Smith' ],
          firstName__starts_with: 'Joh',
          firstName__ends_with: 'an',
          firstName: 'Frank',
          isActive: true,
        }

        const badFilter2 = {
          lastName__in: [ 'Doe', 'Smith' ],
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

})
