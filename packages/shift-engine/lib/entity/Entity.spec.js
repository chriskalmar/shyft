
import { assert } from 'chai';
import Entity, { isEntity } from './Entity';
import Index, {
  INDEX_UNIQUE,
  isIndex,
} from '../index/Index';
import Mutation, {
  isMutation,
  MUTATION_TYPE_CREATE,
  MUTATION_TYPE_UPDATE,
  MUTATION_TYPE_DELETE,
} from '../mutation/Mutation';
import Permission, {
  isPermission,
} from '../permission/Permission';
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


  describe('references', () => {

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


    it('should return a request attribute when used as reference', () => {

      const countryName = Country.referenceAttribute('name')

      assert.strictEqual(String(countryName.type), 'DataTypeString')
    })


    it('should throw if invalid attribute is to be referenced', () => {

      function fn() {
        Country.referenceAttribute('notHere')
      }

      assert.throws(fn, /Cannot reference attribute \'Country.notHere\'/);
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

      assert.throws(fn, /Invalid index definition for entity/);

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


  describe('mutations', () => {


    it('should return a list of mutations', () => {

      const entity = new Entity({
        name: 'SomeEntityName',
        description: 'Just some description',
        attributes: {
          someAttribute: {
            type: DataTypeString,
            description: 'Just some description',
          }
        },
        mutations: [
          new Mutation({
            type: MUTATION_TYPE_CREATE,
            name: 'build',
            description: 'build item',
            attributes: [
              'someAttribute',
            ]
          })
        ]
      })

      const mutations = entity.getMutations()

      assert.isArray(mutations)
      assert.isTrue(isMutation(mutations[0]));

    })


    it('should throw if provided with an invalid list of mutations', () => {

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
          mutations: {
            foo: [{}]
          }
        })

        entity.getAttributes()
      }

      assert.throws(fn, /mutations definition needs to be an array of mutations/);

    })


    it('should throw if provided with an invalid mutation', () => {

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
          mutations: [
            { foo: 'bar' }
          ]
        })

        entity.getAttributes()
      }

      assert.throws(fn, /Invalid mutation definition for entity/);

    })


    it('should throw if required attribute (without defaultValue) is missing in CREATE type mutations', () => {

      function fn() {
        const entity = new Entity({
          name: 'SomeEntityName',
          description: 'Just some description',
          attributes: {
            someAttribute: {
              type: DataTypeString,
              description: 'Just some description',
            },
            neededAttribute: {
              type: DataTypeString,
              description: 'This is important',
              required: true,
            }
          },
          mutations: [
            new Mutation({
              type: MUTATION_TYPE_CREATE,
              name: 'build',
              description: 'build item',
              attributes: [
                'someAttribute',
              ]
            })
          ]
        })

        entity.getAttributes()

        entity.getMutationByName('build')
      }

      assert.throws(fn, /Missing required attributes in mutation/);

    })


    it('should throw on duplicate mutation names', () => {

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
          mutations: [
            new Mutation({
              type: MUTATION_TYPE_CREATE,
              name: 'build',
              description: 'build item',
              attributes: [
                'someAttribute',
              ]
            }),
            new Mutation({
              type: MUTATION_TYPE_CREATE,
              name: 'build',
              description: 'build item',
              attributes: [
                'someAttribute',
              ]
            })
          ]
        })

        entity.getAttributes()
      }

      assert.throws(fn, /Duplicate mutation name/);

    })


    it('should throw if unknown attributes are used', () => {

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
          mutations: [
            new Mutation({
              type: MUTATION_TYPE_CREATE,
              name: 'build',
              description: 'build item',
              attributes: [
                'doesNotExist',
              ]
            })
          ]
        })

        entity.getAttributes()
      }

      assert.throws(fn, /as it does not exist/);

    })


    it('should automatically default mutations', () => {

      const entity = new Entity({
        name: 'SomeEntityName',
        description: 'Just some description',
        attributes: {
          someAttribute: {
            type: DataTypeString,
            description: 'Just some description',
          }
        },
        mutations: [
          new Mutation({
            type: MUTATION_TYPE_CREATE,
            name: 'create',
            description: 'create item',
            attributes: [
              'someAttribute',
            ]
          })
        ]
      })

      entity.getAttributes()

      assert.isTrue(isMutation(entity.getMutationByName('create')));
      assert.isTrue(isMutation(entity.getMutationByName('update')));
      assert.isTrue(isMutation(entity.getMutationByName('delete')));

    })


    it('should allow for empty attribute lists on DELETE type mutations', () => {

      const entity = new Entity({
        name: 'SomeEntityName',
        description: 'Just some description',
        attributes: {
          someAttribute: {
            type: DataTypeString,
            description: 'Just some description',
          }
        },
        mutations: [
          new Mutation({
            type: MUTATION_TYPE_UPDATE,
            name: 'edit',
            description: 'edit item',
            attributes: [
              'someAttribute'
            ]
          }),
          new Mutation({
            type: MUTATION_TYPE_DELETE,
            name: 'drop',
            description: 'drop item',
            attributes: []
          })
        ]
      })

      entity.getAttributes()

      assert.isTrue(isMutation(entity.getMutationByName('create')));
      assert.isTrue(isMutation(entity.getMutationByName('update')));
      assert.isTrue(isMutation(entity.getMutationByName('delete')));

    })

  })



  describe('permissions', () => {


    it('should return a list of mutations', () => {

      const entity = new Entity({
        name: 'SomeEntityName',
        description: 'Just some description',
        attributes: {},
        permissions: {
          read: new Permission()
        }
      })

      const permissions = entity.getPermissions()

      assert.isTrue(isPermission(permissions.read));

    })


    it('should accept a correct permissions setup', () => {

      const entity = new Entity({
        name: 'SomeEntityName',
        description: 'Just some description',
        attributes: {
          someAttribute: {
            type: DataTypeString,
            description: 'Some description',
          }
        },
        permissions: {
          read: new Permission().value('someAttribute', 123),
          mutations: {
            update: new Permission().role('manager'),
          }
        }
      })

      entity.getAttributes()
    })


    it('should throw if provided with an invalid map of permissions', () => {

      function fn() {
        new Entity({ // eslint-disable-line no-new
          name: 'SomeEntityName',
          description: 'Just some description',
          attributes: {},
          permissions: [ 'bad' ]
        })
      }

      assert.throws(fn, /permissions definition needs to be an object/);

    })


    it('should throw if provided with an invalid map of mutation permissions', () => {

      function fn() {
        new Entity({ // eslint-disable-line no-new
          name: 'SomeEntityName',
          description: 'Just some description',
          attributes: {},
          permissions: {
            mutations: [ 'bad' ]
          }
        })
      }

      assert.throws(fn, /permissions definition for mutations needs to be a map of mutations and permissions/);

    })


    it('should throw if provided with an invalid permissions', () => {

      function fn1() {
        new Entity({ // eslint-disable-line no-new
          name: 'SomeEntityName',
          description: 'Just some description',
          attributes: {},
          permissions: {
            read: [ 'bad' ]
          }
        })
      }

      assert.throws(fn1, /Invalid \'read\' permission definition/);


      function fn2() {
        new Entity({ // eslint-disable-line no-new
          name: 'SomeEntityName',
          description: 'Just some description',
          attributes: {},
          permissions: {
            find: [ 'bad' ]
          }
        })
      }

      assert.throws(fn2, /Invalid \'find\' permission definition/);


      function fn3() {
        new Entity({ // eslint-disable-line no-new
          name: 'SomeEntityName',
          description: 'Just some description',
          attributes: {},
          permissions: {
            mutations: {
              create: [ 'bad' ]
            }
          }
        })
      }

      assert.throws(fn3, /Invalid mutation permission definition/);

    })


    it('should throw if permissions have unknown attributes defined', () => {

      function fn1() {
        const entity = new Entity({
          name: 'SomeEntityName',
          description: 'Just some description',
          attributes: {
            someAttribute: {
              type: DataTypeString,
              description: 'Some description',
            }
          },
          permissions: {
            read: new Permission().ownerAttribute('notHere')
          }
        })

        entity.getAttributes()
      }

      assert.throws(
        fn1,
        /Cannot use attribute \'notHere\' in \'SomeEntityName.permissions\' for \'read\' as it does not exist/
      );


      function fn2() {
        const entity = new Entity({
          name: 'SomeEntityName',
          description: 'Just some description',
          attributes: {
            someAttribute: {
              type: DataTypeString,
              description: 'Some description',
            }
          },
          permissions: {
            find: new Permission().value('notHere', 123)
          }
        })

        entity.getAttributes()
      }

      assert.throws(
        fn2,
        /Cannot use attribute \'notHere\' in \'SomeEntityName.permissions\' for \'find\' as it does not exist/
      );


      function fn3() {
        const entity = new Entity({
          name: 'SomeEntityName',
          description: 'Just some description',
          attributes: {
            someAttribute: {
              type: DataTypeString,
              description: 'Some description',
            }
          },
          permissions: {
            mutations: {
              update: new Permission().ownerAttribute('notHere')
            }
          }
        })

        entity.getAttributes()
      }

      assert.throws(
        fn3,
        /Cannot use attribute \'notHere\' in \'SomeEntityName.permissions\' for \'update\' as it does not exist/
      );

    })


    it('should throw if permissions have invalid attributes defined', () => {

      function fn1() {
        const entity = new Entity({
          name: 'SomeEntityName',
          description: 'Just some description',
          attributes: {
            someAttribute: {
              type: DataTypeString,
              description: 'Some description',
            }
          },
          permissions: {
            read: new Permission().ownerAttribute('someAttribute')
          }
        })

        entity.getAttributes()
      }

      assert.throws(
        fn1,
        /Cannot use attribute \'someAttribute\' in \'SomeEntityName.permissions\' as \'ownerAttribute\' as it is not a reference to the User entity/
      );

    })


    it('should throw if permissions are assigned to unknown mutations', () => {

      function fn1() {
        const entity = new Entity({
          name: 'SomeEntityName',
          description: 'Just some description',
          attributes: {
            someAttribute: {
              type: DataTypeString,
              description: 'Some description',
            }
          },
          permissions: {
            mutations: {
              noSuchMutation: new Permission().ownerAttribute('someAttribute')
            }
          }
        })

        entity.getAttributes()
      }

      assert.throws(
        fn1,
        /Unknown mutation \'noSuchMutation\' used for permissions/
      );

    })

  })



  describe('states', () => {

    const entityDefinition = {
      name: 'SomeEntityName',
      description: 'Just some description',
      attributes: {
        something: {
          type: DataTypeString,
          description: 'Just some description',
        }
      },
    }

    const mutationTypeCreateDefinition = {
      type: MUTATION_TYPE_CREATE,
      name: 'build',
      description: 'build item',
      attributes: ['something']
    }

    const mutationTypeUpdateDefinition = {
      type: MUTATION_TYPE_UPDATE,
      name: 'change',
      description: 'change item',
      attributes: [ 'id', 'something']
    }

    const mutationTypeDeleteDefinition = {
      type: MUTATION_TYPE_DELETE,
      name: 'drop',
      description: 'drop item',
      attributes: [ 'id' ]
    }

    const states = {
      open: 10,
      closed: 20,
      inTransfer: 40,
      onHold: 50,
    }

    it('should return a list of states', () => {

      const entity = new Entity({
        ...entityDefinition,
        states
      })

      const theStates = entity.getStates()

      assert.deepEqual(states, theStates)

    })


    it('should throw if provided with an invalid map of states', () => {

      function fn() {
        new Entity({ // eslint-disable-line no-new
          ...entityDefinition,
          states: [ 'bad' ]
        })
      }

      assert.throws(fn, /states definition needs to be a map/);

    })


    it('should throw on invalid state names', () => {

      function fn() {
        new Entity({ // eslint-disable-line no-new
          ...entityDefinition,
          states: {
            [ 'bad-state-name' ]: 123
          }
        })
      }

      assert.throws(fn, /Invalid state name/);

    })


    it('should throw on invalid state IDs', () => {

      function fn1() {
        new Entity({ // eslint-disable-line no-new
          ...entityDefinition,
          states: {
            open: 1.234
          }
        })
      }

      assert.throws(fn1, /has an invalid unique ID/);


      function fn2() {
        new Entity({ // eslint-disable-line no-new
          ...entityDefinition,
          states: {
            open: -1
          }
        })
      }

      assert.throws(fn2, /has an invalid unique ID/);


      function fn3() {
        new Entity({ // eslint-disable-line no-new
          ...entityDefinition,
          states: {
            open: 0
          }
        })
      }

      assert.throws(fn3, /has an invalid unique ID/);


      function fn4() {
        new Entity({ // eslint-disable-line no-new
          ...entityDefinition,
          states: {
            open: 'not a number'
          }
        })
      }

      assert.throws(fn4, /has an invalid unique ID/);

    })


    it('should throw if state IDs are not unique', () => {

      function fn() {
        new Entity({ // eslint-disable-line no-new
          ...entityDefinition,
          states: {
            open: 100,
            closed: 100,
          }
        })
      }

      assert.throws(fn, /needs to have a unique ID/);

    })



    it('should throw if using state in a stateless entity', () => {

      function fn1() {
        const entity = new Entity({
          ...entityDefinition,
          mutations: [
            new Mutation({
              ...mutationTypeUpdateDefinition,
              fromState: 'open',
              toState: 'close',
            })
          ]
        })

        entity.getAttributes()
      }

      assert.throws(fn1, /cannot define fromState as the entity is stateless/);


      function fn2() {
        const entity = new Entity({
          ...entityDefinition,
          mutations: [
            new Mutation({
              ...mutationTypeCreateDefinition,
              toState: 'close',
            })
          ]
        })

        entity.getAttributes()
      }

      assert.throws(fn2, /cannot define toState as the entity is stateless/);

    })


    it('should throw if unknown state name is used', () => {

      function fn1() {
        const entity = new Entity({
          ...entityDefinition,
          states,
          mutations: [
            new Mutation({
              ...mutationTypeUpdateDefinition,
              fromState: 'fakeState',
              toState: 'close',
            })
          ]
        })

        entity.getAttributes()
      }

      assert.throws(fn1, /Unknown state 'fakeState' used in mutation/);


      function fn2() {
        const entity = new Entity({
          ...entityDefinition,
          states,
          mutations: [
            new Mutation({
              ...mutationTypeUpdateDefinition,
              fromState: [ 'open', 'whatever', 'close' ],
              toState: 'close',
            })
          ]
        })

        entity.getAttributes()
      }

      assert.throws(fn2, /Unknown state 'whatever' used in mutation/);


      function fn3() {
        const entity = new Entity({
          ...entityDefinition,
          states,
          mutations: [
            new Mutation({
              ...mutationTypeUpdateDefinition,
              fromState: 'open',
              toState: [ 'closed', 'randomState', 'open' ],
            })
          ]
        })

        entity.getAttributes()
      }

      assert.throws(fn3, /Unknown state 'randomState' used in mutation/);


      function fn4() {
        const entity = new Entity({
          ...entityDefinition,
          states,
          mutations: [
            new Mutation({
              ...mutationTypeDeleteDefinition,
              fromState: [ 'open', 'notHere', 'open' ],
            })
          ]
        })

        entity.getAttributes()
      }

      assert.throws(fn4, /Unknown state 'notHere' used in mutation/);

    })



  })

})
