
import { assert } from 'chai';
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

      assert.doesNotThrow(fn)

    })


    it('should throw on negative condition', () => {

      function fn() {
        passOrThrow(
          1 > 2,
          () => 'This is the very very super important error'
        )
      }


      assert.throws(fn, /This is the very very super important error/);

    })


    it('should throw if message is not a function', () => {

      function fn() {
        passOrThrow(
          1 > 0,
          'This is the very very super important error'
        )
      }


      assert.throws(fn, /expects messageFn to be a function/);

    })

  })



  describe('resolveFunctionMap', () => {

    const dataMap = {
      a: 123,
      b: 456,
    }


    it('should return the provided map', () => {

      const result = resolveFunctionMap(dataMap)

      assert.strictEqual(result, dataMap)
    })


    it('should return the result of the provided function', () => {

      const result = resolveFunctionMap(() => {
        return dataMap
      })

      assert.strictEqual(result, dataMap)

    })

  })



  describe('isMap', () => {


    it('should accept maps', () => {

      assert.isTrue(isMap({}))
      assert.isTrue(isMap({ a: 123 }))
      assert.isTrue(isMap(Object.create({})))
      assert.isTrue(isMap(DataTypeBoolean))

    })


    it('should reject non-maps', () => {

      assert.isFalse(isMap())
      assert.isFalse(isMap(null))
      assert.isFalse(isMap(undefined))
      assert.isFalse(isMap([]))
      assert.isFalse(isMap([1, 2, 3]))
      assert.isFalse(isMap(() => {}))
      assert.isFalse(isMap(1234567))

    })


    it('should reject empty maps if flag `nonEmpty` is set', () => {

      assert.isFalse(isMap({}, true))

    })

  })



  describe('isArray', () => {


    it('should accept arrays', () => {

      assert.isTrue(isArray([]))
      assert.isTrue(isArray([ 'test' ]))
      assert.isTrue(isArray([1, 2, 3]))

    })


    it('should reject non-arrays', () => {

      assert.isFalse(isArray())
      assert.isFalse(isArray(null))
      assert.isFalse(isArray(undefined))
      assert.isFalse(isArray(Object.create({})))
      assert.isFalse(isArray(DataTypeBoolean))
      assert.isFalse(isArray(() => {}))
      assert.isFalse(isArray(1234567))

    })


    it('should reject empty arrays if flag `nonEmpty` is set', () => {

      assert.isFalse(isArray([], true))

    })

  })


  describe('mergeMaps', () => {


    it('should merge 2 maps', () => {

      let obj

      obj = mergeMaps({}, {})
      assert.deepEqual(obj, {})

      obj = mergeMaps({ a: 123 }, {})
      assert.deepEqual(obj, { a: 123 })

      obj = mergeMaps({}, { b: 456 })
      assert.deepEqual(obj, { b: 456 })

      obj = mergeMaps({ a: 123 }, { b: 456 })
      assert.deepEqual(obj, { a: 123, b: 456 })

      obj = mergeMaps({ b: 456 }, { a: 123 })
      assert.deepEqual(obj, { a: 123, b: 456 })

      obj = mergeMaps({ a: 123, b: 456 }, { b: 789 })
      assert.deepEqual(obj, { a: 123, b: 789 })

      obj = mergeMaps({ a: 123, b: [ 1, 2, 4], c: { deep: [ 7, 8, 9 ]} }, { b: { b1: 1, b2: 2 } })
      assert.deepEqual(obj, { a: 123, b: { b1: 1, b2: 2 }, c: { deep: [ 7, 8, 9 ]} })

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

      assert.throws(fn1, /expects 2 maps for a merge to work/);
      assert.throws(fn2, /expects 2 maps for a merge to work/);
      assert.throws(fn3, /expects 2 maps for a merge to work/);

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

      assert.deepEqual(keys, [ 'a', 'b', 'c' ])
      assert.strictEqual(sum, 13)

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

      assert.throws(fn1, /Provided object is not a map/);
      assert.throws(fn2, /Provided object is not a map/);
      assert.throws(fn3, /Provided object is not a map/);

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

      assert.throws(fn1, /Provided iteratee is not a function/);
      assert.throws(fn2, /Provided iteratee is not a function/);
      assert.throws(fn3, /Provided iteratee is not a function/);

    })

  })



  describe('sortDataByKeys', () => {


    it('should return empty result if keys list is empty or invalid', () => {

      const result1 = sortDataByKeys([], { a: 1, b: 3})
      const result2 = sortDataByKeys({}, { a: 1, b: 3})
      const result3 = sortDataByKeys(null, { a: 1, b: 3})

      assert.deepEqual(result1, [])
      assert.deepEqual(result2, [])
      assert.deepEqual(result3, [])

    })


    it('should return null-filled array if data list is empty or invalid', () => {

      const result1 = sortDataByKeys([ 'a', 'b' ], null)
      const result2 = sortDataByKeys([ 'a' ], {})
      const result3 = sortDataByKeys([ 'a', 'b', 'f' ], [])

      assert.deepEqual(result1, [ null, null ])
      assert.deepEqual(result2, [ null ])
      assert.deepEqual(result3, [ null, null, null ])

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

      assert.deepEqual(result1, [
        { id: 'a', val: 'lorem' },
        { id: 'c', val: 'dolor' },
        { id: 'f', val: 'omnis' },
      ])

      assert.deepEqual(result2, [
        { id: 'e', val: 'unde' },
        { id: 'e', val: 'unde' },
        { id: 'b', val: 'ipsum' },
        { id: 'b', val: 'voluptatem' },
        { id: 'c', val: 'dolor' },
      ])

      assert.deepEqual(result3, [
        { id: 'g', val: 'iste' },
      ])

      assert.deepEqual(result4, [
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


    it('should return empty clause if no cursor provided', () => {

      const result = processCursor()

      assert.deepEqual(result, {})
    })


    it('should throw if incompatible cursor provided', () => {

      function fn() {
        processCursor({}, { a: 'b' })
      }

      assert.throws(fn, /Incompatible cursor for this entity/);

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

      assert.throws(fn1, /Cursor malformed/);
      assert.throws(fn2, /Cursor malformed/);
      assert.throws(fn3, /Cursor malformed/);

    })



    it('should throw if unknown attribute is used', () => {

      function fn() {
        processCursor(SomeEntity, {
          'SomeEntity': [
            [ 'iDontKnow', 123 ]
          ]
        }, [])
      }

      assert.throws(fn, /Unknown attribute/);

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

      assert.throws(fn1, /orderBy needs to be an array of order definitions/);
      assert.throws(fn2, /Cursor works only on sorted attributes/);
      assert.throws(fn3, /Cursor works only on sorted attributes/);

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

      assert.throws(fn1, /Cursor needs to have at least one attribute defined as unique/);
      assert.throws(fn2, /Cursor needs to have at least one attribute defined as unique/);

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

        assert.deepEqual(cursor1, result1)
        assert.deepEqual(cursor2, result2)
        assert.deepEqual(cursor3, result3)

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



        assert.deepEqual(cursor1, result1)
        assert.deepEqual(cursor2, result2)
        assert.deepEqual(cursor3, result3)
        assert.deepEqual(cursor4, result4)
        assert.deepEqual(cursor5, result5)
        assert.deepEqual(cursor6, result6)
        assert.deepEqual(cursor7, result7)

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


        assert.deepEqual(cursor0, result0)
        assert.deepEqual(cursor1, result1)
        assert.deepEqual(cursor2, result2)
        assert.deepEqual(cursor3, result3)
        assert.deepEqual(cursor4, result4)
        assert.deepEqual(cursor5, result5)
        assert.deepEqual(cursor6, result6)
        assert.deepEqual(cursor7, result7)

      })

    })

  })



  describe('reverseString', () => {


    it('should reverse a string', () => {

      assert.equal( reverseString('hello'), 'olleh')
      assert.equal( reverseString(''), '')
      assert.equal( reverseString('a'), 'a')
      assert.equal( reverseString('aBC'), 'CBa')
      assert.equal( reverseString(' x y '), ' y x ')

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

        assert.deepEqual( splitAttributeAndFilterOperator('test'), { attributeName: 'test' })
        assert.deepEqual( splitAttributeAndFilterOperator('__test'), { attributeName: '__test' })
        assert.deepEqual( splitAttributeAndFilterOperator('login__lt'), { attributeName: 'login', operator: 'lt' })
        assert.deepEqual( splitAttributeAndFilterOperator('firstName__gte'), { attributeName: 'firstName', operator: 'gte'})
        assert.deepEqual( splitAttributeAndFilterOperator('last_name__not'), { attributeName: 'last_name', operator: 'not' })
        assert.deepEqual( splitAttributeAndFilterOperator('some__long_attribute__name__lte'), { attributeName: 'some__long_attribute__name', operator: 'lte' })
        assert.deepEqual( splitAttributeAndFilterOperator('__some_name__not'), { attributeName: '__some_name', operator: 'not' })
        assert.deepEqual( splitAttributeAndFilterOperator('___some_name__not'), { attributeName: '___some_name', operator: 'not' })
        assert.deepEqual( splitAttributeAndFilterOperator('___some_name___not'), { attributeName: '___some_name_', operator: 'not' })

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

        assert.throws(fn1, /invalid filter/);
        assert.throws(fn2, /invalid filter/);
        assert.throws(fn3, /invalid filter/);
        assert.throws(fn4, /invalid filter/);
        assert.throws(fn5, /invalid filter/);

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


        assert.deepEqual(
          processFilterLevel(goodFilter1, filteredEntity.getAttributes(), ['somewhere'], SomeStorageType),
          result1
        )

        assert.deepEqual(
          processFilterLevel(goodFilter2, filteredEntity.getAttributes(), ['somewhere'], SomeStorageType),
          result2
        )

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


        assert.deepEqual(
          processFilterLevel(goodFilter1, filteredEntity.getAttributes(), ['somewhere'], SomeStorageType),
          result1
        )

        assert.deepEqual(
          processFilterLevel(goodFilter2, filteredEntity.getAttributes(), ['somewhere'], SomeStorageType),
          result2
        )

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

        assert.throws(fn1, /filter needs to be an object of filter criteria/);
        assert.throws(fn2, /path in processFilterLevel\(\) needs to be an array/);
        assert.throws(fn3, /filter at 'somewhere' needs to be an object of filter criteria/);
        assert.throws(fn4, /filter at 'somewhere.deeply.nested' needs to be an object of filter criteria/);
        assert.throws(fn5, /expects an attribute map/);

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

        assert.throws(fn1, /Unknown attribute name 'something' used in filter/);
        assert.throws(fn2, /Unknown attribute name 'anything_here' used in filter/);
        assert.throws(fn3, /Unknown attribute name 'anything_here' used in filter at 'just.here'/);
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

        assert.throws(fn1, /Unknown or incompatible operator 'ends_with' used on 'isActive'/);
        assert.throws(fn2, /Unknown or incompatible operator 'anything' used on 'firstName'/);
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

        assert.throws(fn1, /Cannot combine 'exact match' operator with other operators on attribute 'firstName'/);
        assert.throws(fn2, /Cannot combine 'exact match' operator with other operators on attribute 'firstName'/);

      })

    })

  })

})
