
import { assert } from 'chai';
import Entity, { isEntity } from './Entity';
import Index, {
  INDEX_UNIQUE,
  isIndex,
} from '../index/Index';
import { passOrThrow } from '../util';
import {
  DataTypeID,
  DataTypeString,
} from '../datatype/dataTypes';


describe.only('Entity', () => {

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


    it('should throw if provided with an invalid validate function', () => {

      const entity = new Entity({
        name: 'SomeEntityName',
        description: 'Just some description',
        attributes: {
          someAttribute: {
            type: DataTypeString,
            description: 'Just some description',
            validate: 'not-a-function'
          }
        },
      })

      function fn() {
        entity.getAttributes()
      }

      assert.throws(fn, /has an invalid validate function/);

    })

  })



  describe('primary attribute', () => {

    it('should catch multiple primary attributes', () => {

      const entity = new Entity({
        name: 'SomeEntityName',
        description: 'Just some description',
        attributes: {
          someAttribute: {
            type: DataTypeID,
            description: 'Something',
            isPrimary: true,
          },
          anotherAttribute: {
            type: DataTypeID,
            description: 'Something else',
            isPrimary: true,
          }
        }
      })

      function fn() {
        entity.getAttributes()
      }

      assert.throws(fn, /cannot be set as primary attribute/);

    })


    it('should catch primary attributes with invalid data types', () => {

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
        description: 'A city',
        attributes: {
          someAttribute: {
            type: Country,
            description: 'Something',
            isPrimary: true,
          }
        }
      })

      function fn() {
        City.getAttributes()
      }

      assert.throws(fn, /has invalid data type/);

    })

  })



  describe('system attributes', () => {

    it('should extend model with time tracking attributes if requested', () => {

      const Country = new Entity({
        name: 'Country',
        description: 'A country',
        includeTimeTracking: true,
        attributes: {
          name: {
            type: DataTypeString,
            description: 'Country name'
          }
        }
      })

      const attributes = Country.getAttributes()

      assert.strictEqual(String(attributes.createdAt.type), 'DataTypeTimestampTz')
      assert.strictEqual(String(attributes.updatedAt.type), 'DataTypeTimestampTz')

    })


    it('should extend model with user tracking attributes if requested', () => {

      const Country = new Entity({
        name: 'Country',
        description: 'A country',
        includeUserTracking: true,
        attributes: {
          name: {
            type: DataTypeString,
            description: 'Country name'
          }
        }
      })

      const attributes = Country.getAttributes()

      assert.strictEqual(String(attributes.createdBy.type), 'DataTypeUserID')
      assert.strictEqual(String(attributes.updatedBy.type), 'DataTypeUserID')

    })


    it('should throw if user defined attribute name collides with a system attribute name', () => {

      const entity = new Entity({
        name: 'SomeEntityName',
        description: 'Just some description',
        includeTimeTracking: true,
        attributes: {
          updatedAt: {
            type: DataTypeString,
            description: 'Just some description',
          }
        },
      })

      function fn() {
        entity.getAttributes()
      }

      assert.throws(fn, /Attribute name collision with system attribute \'updatedAt\'/);

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


    it('should throw if provided with an invalid index', () => {

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
            { foo: 'bar' }
          ]
        })

        entity.getAttributes()
      }

      assert.throws(fn, /Invalid index defintion for entity/);

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


    it('should set isUnique flag on attributes based on index definition', () => {

      const entity = new Entity({
        name: 'SomeEntityName',
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

      const attributes = entity.getAttributes()

      assert.strictEqual(attributes.loginName.isUnique, true);
      assert.isNotTrue(attributes.firstName.isUnique);
      assert.isNotTrue(attributes.lastName.isUnique);
      assert.strictEqual(attributes.email.isUnique, true);

    })


    it('should return a list of indexes', () => {

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
            ]
          })
        ]
      })

      entity.getAttributes()
      const indexes = entity.getIndexes()

      assert.isArray(indexes)
      assert.isTrue(isIndex(indexes[0]));

    })


  })


})
