
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
} from './util';

import {
  DataTypeBoolean,
  DataTypeString,
} from './datatype/dataTypes';



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



  describe.only('processCursor', () => {

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
          $and: {
            firstName: {
              $gte: 'John',
            },
            $not: {
              $and: {
                id: {
                  $lte: 1123,
                },
                firstName: 'John',
              }
            }
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
          $and: {
            firstName: {
              $gte: 'John',
            },
            $not: {
              $and: {
                id: {
                  $gte: 1123,
                },
                firstName: 'John',
              }
            }
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
          $and: {
            firstName: {
              $lte: 'John',
            },
            $not: {
              $and: {
                id: {
                  $gte: 1123,
                },
                firstName: 'John',
              }
            }
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
          $and: {
            firstName: {
              $lte: 'John',
            },
            $not: {
              $and: {
                id: {
                  $lte: 1123,
                },
                firstName: 'John',
              }
            }
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
          $and: {
            firstName: {
              $gte: 'John',
            },
            lastName: {
              $gte: 'Snow',
            },
            $not: {
              $and: {
                id: {
                  $lte: 1123,
                },
                firstName: 'John',
                lastName: 'Snow',
              }
            }
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
          $and: {
            firstName: {
              $gte: 'John',
            },
            lastName: {
              $lte: 'Snow',
            },
            $not: {
              $and: {
                id: {
                  $gte: 1123,
                },
                firstName: 'John',
                lastName: 'Snow',
              }
            }
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
          $and: {
            firstName: {
              $gte: 'John',
            },
            $not: {
              $and: {
                email: {
                  $gte: 'john@example.com',
                },
                firstName: 'John',
              }
            }
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

    })

  })

})
