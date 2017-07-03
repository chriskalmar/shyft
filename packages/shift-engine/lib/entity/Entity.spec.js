
import { assert } from 'chai';
import Entity, { isEntity } from './Entity';
import Index, { INDEX_UNIQUE } from '../index/Index';
import { passOrThrow } from '../util';
import {
  DataTypeID,
  DataTypeString,
} from '../datatype/dataTypes';


describe('Entity', () => {

  it('should have a name', () => {

    function fn() {
      new Entity() // eslint-disable-line no-new
    }

    assert.throws(fn, /Missing entity name/);

  })


  it('should have a description', () => {

    function fn() {
      new Entity({ // eslint-disable-line no-new
        name: 'Example'
      })
    }

    assert.throws(fn, /Missing description for entity/);

  })


  it('should have a map of attributes', () => {

    function fn() {
      new Entity({ // eslint-disable-line no-new
        name: 'Example',
        description: 'Just some description',
      })
    }

    assert.throws(fn, /Missing attributes for entity/);

  })


  it('should return it\'s name', () => {

    const entity = new Entity({
      name: 'SomeEntityName',
      description: 'Just some description',
      attributes: () => {}
    })

    assert.strictEqual(entity.name, 'SomeEntityName');
    assert.strictEqual(String(entity), 'SomeEntityName');

  })


  it('should accept only maps or functions as attributes definition', () => {

    function fn() {
      new Entity({ // eslint-disable-line no-new
        name: 'Example',
        description: 'Just some description',
        attributes: [ 2, 7, 13 ]
      })
    }

    assert.throws(fn, /attribute definition as a map or a function/);

  })


  it('should reject non-map results of attribute definition functions', () => {

    function fn() {
      const entity = new Entity({ // eslint-disable-line no-new
        name: 'Example',
        description: 'Just some description',
        attributes: () => {
          return [ 2, 7, 13 ]
        }
      })

      entity.getAttributes()
    }

    assert.throws(fn, /does not return a map/);

  })


  it.skip('should have a unique name-domain combination', () => {
  })


  describe('should have a list of attributes', () => {

    it('as a map', () => {

      const entity = new Entity({
        name: 'SomeEntityName',
        description: 'Just some description',
        attributes: {
          id: {
            type: DataTypeID,
            description: 'ID of item',
            isPrimary: true,
          },
          name: {
            type: DataTypeString,
            description: 'Just another description'
          },
        }
      })

      const attributes = entity.getAttributes()

      assert.strictEqual(attributes.id.type, DataTypeID);
      assert.strictEqual(attributes.name.type, DataTypeString);

    })


    it('as a function return a map', () => {

      const entity = new Entity({
        name: 'SomeEntityName',
        description: 'Just some description',
        attributes: () => {
          return {
            id: {
              type: DataTypeID,
              description: 'ID of item',
              isPrimary: true,
            },
            name: {
              type: DataTypeString,
              description: 'Just another description'
            },
          }
        }
      })

      const attributes = entity.getAttributes()

      assert.strictEqual(attributes.id.type, DataTypeID);
      assert.strictEqual(attributes.name.type, DataTypeString);

    })

  })


  it('should throw if invalid storage type was provided', () => {

    function fn() {
      new Entity({ // eslint-disable-line no-new
        name: 'Example',
        description: 'Just some description',
        attributes: {
          id: {
            type: DataTypeID,
            description: 'ID of item',
            isPrimary: true,
          },
        },
        storageType: {}
      })

    }

    assert.throws(fn, /needs a valid storage type/);

  })


  describe('isEntity', () => {


    it('should recognize objects of type Entity', () => {

      const entity = new Entity({
        name: 'SomeEntityName',
        description: 'Just some description',
        attributes () {}
      })

      function fn() {
        passOrThrow(
          isEntity(entity),
          () => 'This error will never happen'
        )
      }

      assert.doesNotThrow(fn)

    })


    it('should recognize non-Entity objects', () => {

      function fn() {
        passOrThrow(
          isEntity({}) ||
          isEntity(function test() {}) ||
          isEntity(assert),
          () => 'Not an Entity object'
        )
      }


      assert.throws(fn, /Not an Entity object/);

    })

  })



  describe('attributes', () => {

    it('should catch invalid attribute names', () => {

      const entity = new Entity({
        name: 'SomeEntityName',
        description: 'Just some description',
        attributes: {
          [ 'wrong-named-attribute' ]: {
            type: DataTypeID,
            description: 'Something',
          }
        }
      })

      function fn() {
        entity.getAttributes()
      }

      assert.throws(fn, /Invalid attribute name/);

    })


    it('should reject an empty attributes map', () => {

      const entity = new Entity({
        name: 'SomeEntityName',
        description: 'Just some description',
        attributes: {}
      })

      function fn() {
        entity.getAttributes()
      }

      assert.throws(fn, /has no attributes defined/);

    })


    it('should reject attributes without a description', () => {

      const entity = new Entity({
        name: 'SomeEntityName',
        description: 'Just some description',
        attributes: {
          someAttribute: {}
        }
      })

      function fn() {
        entity.getAttributes()
      }

      assert.throws(fn, /Missing description for/);

    })


    it('should reject attributes with missing or invalid data type', () => {

      const entity = new Entity({
        name: 'SomeEntityName',
        description: 'Just some description',
        attributes: {
          someAttribute: {
            description: 'Just some description'
          }
        }
      })

      function fn() {
        entity.getAttributes()
      }

      assert.throws(fn, /has invalid data type/);

    })


    it('should accept attributes with valid data types or references to other entities', () => {

      const Country = new Entity({
        name: 'Country',
        description: 'A country',
        attributes: {
          name: {
            type: DataTypeString,
            description: 'Country name'
          }
        }
      })

      const City = new Entity({
        name: 'City',
        description: 'A city in a country',
        attributes: {
          name: {
            type: DataTypeString,
            description: 'City name'
          },
          country: {
            type: Country,
            description: 'Belongs to a country'
          }
        }
      })

      const attributes = City.getAttributes()

      assert.strictEqual(String(attributes.name.type), 'DataTypeString')
      assert.strictEqual(String(attributes.country.type), 'Country')

    })


    it('should throw if provided with an invalid resolve function', () => {

      const entity = new Entity({
        name: 'SomeEntityName',
        description: 'Just some description',
        attributes: {
          someAttribute: {
            type: DataTypeString,
            description: 'Just some description',
            resolve: {}
          }
        },
      })

      function fn() {
        entity.getAttributes()
      }

      assert.throws(fn, /has an invalid resolve function/);

    })


    it('should throw if provided with an invalid defaultValue function', () => {

      const entity = new Entity({
        name: 'SomeEntityName',
        description: 'Just some description',
        attributes: {
          someAttribute: {
            type: DataTypeString,
            description: 'Just some description',
            defaultValue: 'not-a-function'
          }
        },
      })

      function fn() {
        entity.getAttributes()
      }

      assert.throws(fn, /has an invalid defaultValue function/);

    })

  })


  describe('indexes', () => {

    it('should throw if provided with an invalid list of indexes', () => {

      function fn() {
        const entity = new Entity({
          name: 'SomeEntityName',
          description: 'Just some description',
          attributes: {
            someAttribute: {
              type: DataTypeString,
              description: 'Just some description',
            }
          },
          indexes: {
            unique: [{}]
          }
        })

        entity.getAttributes()
      }

      assert.throws(fn, /indexes definition needs to be an array of indexes/);

    })


    it('should throw if attribute used in index does not exist', () => {

      function fn() {
        const entity = new Entity({
          name: 'SomeEntityName',
          description: 'Just some description',
          attributes: {
            someAttribute: {
              type: DataTypeString,
              description: 'Just some description',
            }
          },
          indexes: [
            new Index({
              type: INDEX_UNIQUE,
              attributes: [
                'someAttribute',
                'notHere',
              ]
            })
          ]
        })

        entity.getAttributes()
      }

      assert.throws(fn, /in index as it does not exist/);

    })

  })


})
