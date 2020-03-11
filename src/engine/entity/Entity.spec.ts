/* eslint-disable @typescript-eslint/no-explicit-any */
import { graphql, GraphQLSchema } from 'graphql';
import { Entity, isEntity } from './Entity';
import { Index, INDEX_UNIQUE, isIndex } from '../index/Index';
import {
  Mutation,
  isMutation,
  MUTATION_TYPE_CREATE,
} from '../mutation/Mutation';
import { Permission, isPermission } from '../permission/Permission';
import { passOrThrow } from '../util';
import { DataTypeID, DataTypeString } from '../datatype/dataTypes';

import { generateGraphQLSchema } from '../../graphqlProtocol/generator';
import { generateTestSchema } from '../../graphqlProtocol/test-helper';

describe('Entity', () => {
  it('should have a name', () => {
    function fn() {
      // eslint-disable-next-line no-new
      new Entity({} as any);
    }

    expect(fn).toThrowErrorMatchingSnapshot();
  });

  it('should have a description', () => {
    function fn() {
      // eslint-disable-next-line no-new
      new Entity({
        name: 'Example',
      } as any);
    }

    expect(fn).toThrowErrorMatchingSnapshot();
  });

  it('should have a map of attributes', () => {
    function fn() {
      // eslint-disable-next-line no-new
      new Entity({
        name: 'Example',
        description: 'Just some description',
      });
    }

    expect(fn).toThrowErrorMatchingSnapshot();
  });

  it("should return it's name", () => {
    const entity = new Entity({
      name: 'SomeEntityName',
      description: 'Just some description',
      attributesGenerator: () => {
        return {} as any;
      },
    });

    expect(entity.name).toBe('SomeEntityName');
    expect(String(entity)).toBe('SomeEntityName');
  });

  it('should accept only maps or functions as attributes definition', () => {
    function fn() {
      // eslint-disable-next-line no-new
      new Entity({
        name: 'Example',
        description: 'Just some description',
        attributes: [2, 7, 13] as any,
      });
    }

    expect(fn).toThrowErrorMatchingSnapshot();
  });

  it('should reject non-map results of attribute definition functions', () => {
    function fn() {
      // eslint-disable-next-line no-new
      const entity = new Entity({
        name: 'Example',
        description: 'Just some description',
        attributesGenerator: () => {
          return [2, 7, 13] as any;
        },
      });

      entity.getAttributes();
    }

    expect(fn).toThrowErrorMatchingSnapshot();
  });

  describe('should have a list of attributes', () => {
    it('as a map', () => {
      const entity = new Entity({
        name: 'SomeEntityName',
        description: 'Just some description',
        attributes: {
          id: {
            type: DataTypeID,
            description: 'ID of item',
            primary: true,
          },
          name: {
            type: DataTypeString,
            description: 'Just another description',
          },
        },
      });

      const attributes = entity.getAttributes();

      expect(attributes.id.type).toBe(DataTypeID);
      expect(attributes.name.type).toBe(DataTypeString);
    });

    it('as a function return a map', () => {
      const entity = new Entity({
        name: 'SomeEntityName',
        description: 'Just some description',
        attributesGenerator: () => {
          return {
            id: {
              type: DataTypeID,
              description: 'ID of item',
              primary: true,
            },
            name: {
              type: DataTypeString,
              description: 'Just another description',
            },
          };
        },
      });

      const attributes = entity.getAttributes();

      expect(attributes.id.type).toBe(DataTypeID);
      expect(attributes.name.type).toBe(DataTypeString);
    });
  });

  it('should throw if invalid storage type was provided', () => {
    function fn() {
      // eslint-disable-next-line no-new
      new Entity({
        name: 'Example',
        description: 'Just some description',
        attributes: {
          id: {
            type: DataTypeID,
            description: 'ID of item',
            primary: true,
          },
        },
        storageType: {},
      });
    }

    expect(fn).toThrowErrorMatchingSnapshot();
  });

  describe('isEntity', () => {
    it('should recognize objects of type Entity', () => {
      const entity = new Entity({
        name: 'SomeEntityName',
        description: 'Just some description',
        attributesGenerator() {
          return null as any;
        },
      });

      function fn() {
        passOrThrow(isEntity(entity), () => 'This error will never happen');
      }

      expect(fn).not.toThrow();
    });

    it('should recognize non-Entity objects', () => {
      function fn() {
        passOrThrow(
          // eslint-disable-next-line @typescript-eslint/no-empty-function
          isEntity({}) || isEntity(function test() {}) || isEntity(Error),
          () => 'Not an Entity object',
        );
      }

      expect(fn).toThrowErrorMatchingSnapshot();
    });
  });

  describe('attributes', () => {
    it('should catch invalid attribute names', () => {
      const entity = new Entity({
        name: 'SomeEntityName',
        description: 'Just some description',
        attributes: {
          ['wrong-named-attribute']: {
            type: DataTypeID,
            description: 'Something',
          },
        },
      });

      function fn() {
        entity.getAttributes();
      }

      expect(fn).toThrowErrorMatchingSnapshot();
    });

    it('should reject an empty attributes map', () => {
      const entity = new Entity({
        name: 'SomeEntityName',
        description: 'Just some description',
        attributes: {},
      });

      function fn() {
        entity.getAttributes();
      }

      expect(fn).toThrowErrorMatchingSnapshot();
    });

    it('should reject attributes without a description', () => {
      const entity = new Entity({
        name: 'SomeEntityName',
        description: 'Just some description',
        attributes: {
          someAttribute: {} as any,
        },
      });

      function fn() {
        entity.getAttributes();
      }

      expect(fn).toThrowErrorMatchingSnapshot();
    });

    it('should reject attributes with missing or invalid data type', () => {
      const entity = new Entity({
        name: 'SomeEntityName',
        description: 'Just some description',
        attributes: {
          someAttribute: {
            description: 'Just some description',
          } as any,
        },
      });

      function fn() {
        entity.getAttributes();
      }

      expect(fn).toThrowErrorMatchingSnapshot();
    });

    it('should accept attributes with valid data types or references to other entities', () => {
      const Country = new Entity({
        name: 'Country',
        description: 'A country',
        attributes: {
          name: {
            type: DataTypeString,
            description: 'Country name',
          },
        },
      });

      const City = new Entity({
        name: 'City',
        description: 'A city in a country',
        attributes: {
          name: {
            type: DataTypeString,
            description: 'City name',
          },
          country: {
            type: Country,
            description: 'Belongs to a country',
          },
        },
      });

      const attributes = City.getAttributes();

      expect(String(attributes.name.type)).toBe('DataTypeString');
      expect(String(attributes.country.type)).toBe('Country');
    });

    it('should throw if provided with an invalid resolve function', () => {
      const entity = new Entity({
        name: 'SomeEntityName',
        description: 'Just some description',
        attributes: {
          someAttribute: {
            type: DataTypeString,
            description: 'Just some description',
            resolve: {} as any,
          },
        },
      });

      function fn() {
        entity.getAttributes();
      }

      expect(fn).toThrowErrorMatchingSnapshot();
    });

    it('should throw if provided with an invalid defaultValue function', () => {
      const entity = new Entity({
        name: 'SomeEntityName',
        description: 'Just some description',
        attributes: {
          someAttribute: {
            type: DataTypeString,
            description: 'Just some description',
            defaultValue: 'not-a-function' as any,
          },
        },
      });

      function fn() {
        entity.getAttributes();
      }

      expect(fn).toThrowErrorMatchingSnapshot();
    });

    it('should throw if provided with an invalid validate function', () => {
      const entity = new Entity({
        name: 'SomeEntityName',
        description: 'Just some description',
        attributes: {
          someAttribute: {
            type: DataTypeString,
            description: 'Just some description',
            validate: 'not-a-function' as any,
          },
        },
      });

      function fn() {
        entity.getAttributes();
      }

      expect(fn).toThrowErrorMatchingSnapshot();
    });
  });

  describe('primary attribute', () => {
    it('should catch multiple primary attributes', () => {
      const entity = new Entity({
        name: 'SomeEntityName',
        description: 'Just some description',
        attributes: {
          someAttribute: {
            type: DataTypeID,
            description: 'Something',
            primary: true,
          },
          anotherAttribute: {
            type: DataTypeID,
            description: 'Something else',
            primary: true,
          },
        },
      });

      function fn() {
        entity.getAttributes();
      }

      expect(fn).toThrowErrorMatchingSnapshot();
    });

    it('should catch primary attributes with invalid data types', () => {
      const Country = new Entity({
        name: 'Country',
        description: 'A country',
        attributes: {
          name: {
            type: DataTypeString,
            description: 'Country name',
          },
        },
      });

      const City = new Entity({
        name: 'City',
        description: 'A city',
        attributes: {
          someAttribute: {
            type: Country,
            description: 'Something',
            primary: true,
          },
        },
      });

      function fn() {
        City.getAttributes();
      }

      expect(fn).toThrowErrorMatchingSnapshot();
    });
  });

  describe('references', () => {
    const Country = new Entity({
      name: 'Country',
      description: 'A country',
      attributes: {
        name: {
          type: DataTypeString,
          description: 'Country name',
        },
      },
    });

    it('should return a request attribute when used as reference', () => {
      const countryName = Country.referenceAttribute('name');

      expect(String(countryName.type)).toBe('DataTypeString');
    });

    it('should throw if invalid attribute is to be referenced', () => {
      function fn() {
        Country.referenceAttribute('notHere');
      }

      expect(fn).toThrowErrorMatchingSnapshot();
    });
  });

  describe('system attributes', () => {
    it('should extend model with time tracking attributes if requested', () => {
      const Country = new Entity({
        name: 'Country',
        description: 'A country',
        includeTimeTracking: true,
        attributes: {
          name: {
            type: DataTypeString,
            description: 'Country name',
          },
        },
      });

      const attributes = Country.getAttributes();

      expect(String(attributes.createdAt.type)).toBe('DataTypeTimestampTz');
      expect(String(attributes.updatedAt.type)).toBe('DataTypeTimestampTz');
    });

    it('should extend model with user tracking attributes if requested', () => {
      const Country = new Entity({
        name: 'Country',
        description: 'A country',
        includeUserTracking: true,
        attributes: {
          name: {
            type: DataTypeString,
            description: 'Country name',
          },
        },
      });

      const attributes = Country.getAttributes();

      expect(String(attributes.createdBy.type)).toBe('DataTypeUserID');
      expect(String(attributes.updatedBy.type)).toBe('DataTypeUserID');
    });

    it('should throw if user defined attribute name collides with a system attribute name', () => {
      const entity = new Entity({
        name: 'SomeEntityName',
        description: 'Just some description',
        includeTimeTracking: true,
        attributes: {
          updatedAt: {
            type: DataTypeString,
            description: 'Just some description',
          },
        },
      });

      function fn() {
        entity.getAttributes();
      }

      expect(fn).toThrowErrorMatchingSnapshot();
    });
  });

  describe('indexes', () => {
    it('should set unique flag on attributes based on index definition', () => {
      const entity = new Entity({
        name: 'SomeEntityName',
        description: 'Just some description',
        attributes: {
          loginName: {
            type: DataTypeString,
            description: 'Just some description',
            required: true,
          },
          firstName: {
            type: DataTypeString,
            description: 'Just some description',
            required: true,
          },
          lastName: {
            type: DataTypeString,
            description: 'Just some description',
            required: true,
          },
          email: {
            type: DataTypeString,
            description: 'Just some description',
            required: true,
          },
        },
        indexes: [
          new Index({
            type: INDEX_UNIQUE,
            attributes: ['loginName'],
          }),
          new Index({
            type: INDEX_UNIQUE,
            attributes: ['firstName', 'lastName'],
          }),
          new Index({
            type: INDEX_UNIQUE,
            attributes: ['email'],
          }),
        ],
      });

      entity.getIndexes();
      const attributes = entity.getAttributes();

      expect(attributes.loginName.unique).toBe(true);
      expect(attributes.firstName.unique).not.toBe(true);
      expect(attributes.lastName.unique).not.toBe(true);
      expect(attributes.email.unique).toBe(true);
    });

    it('should return a list of indexes', () => {
      const entity = new Entity({
        name: 'SomeEntityName',
        description: 'Just some description',
        attributes: {
          someAttribute: {
            type: DataTypeString,
            description: 'Just some description',
            required: true,
          },
        },
        indexes: [
          new Index({
            type: INDEX_UNIQUE,
            attributes: ['someAttribute'],
          }),
        ],
      });

      entity.getAttributes();
      const indexes = entity.getIndexes();

      expect(Array.isArray(indexes)).toBe(true);
      expect(isIndex(indexes[0])).toBe(true);
    });
  });

  describe('mutations', () => {
    it('should return a list of mutations', () => {
      const entity = new Entity({
        name: 'SomeEntityName',
        description: 'Just some description',
        attributes: {
          someAttribute: {
            type: DataTypeString,
            description: 'Just some description',
          },
        },
        mutations: [
          new Mutation({
            type: MUTATION_TYPE_CREATE,
            name: 'build',
            description: 'build item',
            attributes: ['someAttribute'],
          }),
        ],
      });

      const mutations = entity.getMutations();

      expect(Array.isArray(mutations)).toBe(true);
      expect(isMutation(mutations[0])).toBe(true);
    });

    it('should automatically have default mutations', () => {
      const entity = new Entity({
        name: 'SomeEntityName',
        description: 'Just some description',
        attributes: {
          someAttribute: {
            type: DataTypeString,
            description: 'Just some description',
          },
        },
      });

      entity.getAttributes();

      expect(isMutation(entity.getMutationByName('create'))).toBe(true);
      expect(isMutation(entity.getMutationByName('update'))).toBe(true);
      expect(isMutation(entity.getMutationByName('delete'))).toBe(true);
    });

    it('should allow to add default mutations', () => {
      const entity = new Entity({
        name: 'SomeEntityName',
        description: 'Just some description',
        attributes: {
          someAttribute: {
            type: DataTypeString,
            description: 'Just some description',
          },
        },
        mutations: ({ createMutation, deleteMutation }) => [
          createMutation,
          deleteMutation,
        ],
      });

      entity.getAttributes();

      expect(isMutation(entity.getMutationByName('create'))).toBe(true);
      expect(isMutation(entity.getMutationByName('update'))).toBe(false);
      expect(isMutation(entity.getMutationByName('delete'))).toBe(true);
    });
  });

  describe('permissions', () => {
    it('should return a list of permissions', () => {
      const entity = new Entity({
        name: 'SomeEntityName',
        description: 'Just some description',
        attributes: {
          someAttribute: {
            type: DataTypeString,
            description: 'Some description',
          },
        },
        permissions: {
          read: new Permission().authenticated(),
        },
      });

      const permissions = entity.getPermissions();

      expect(isPermission(permissions.read)).toBe(true);
    });

    it('should throw if empty permissions are provided', () => {
      const entity = new Entity({
        name: 'SomeEntityName',
        description: 'Just some description',
        attributes: {
          someAttribute: {
            type: DataTypeString,
            description: 'Some description',
          },
        },
        permissions: {
          read: new Permission(),
          find: [new Permission().authenticated(), new Permission()],
          mutations: {
            delete: new Permission(),
          },
        },
      });

      function fn() {
        entity.getPermissions();
      }

      expect(fn).toThrowErrorMatchingSnapshot();
    });
  });

  describe('states', () => {
    const entityDefinition = {
      name: 'SomeEntityName',
      description: 'Just some description',
      attributes: {
        something: {
          type: DataTypeString,
          description: 'Just some description',
        },
      },
    };

    const states = {
      open: 10,
      closed: 20,
      inTransfer: 40,
      onHold: 50,
    };

    it('should return a list of states', () => {
      const entity = new Entity({
        ...entityDefinition,
        states,
      });

      const theStates = entity.getStates();

      expect(states).toEqual(theStates);
    });

    it('should throw if provided with an invalid map of states', () => {
      function fn() {
        const entity = new Entity({
          ...entityDefinition,
          states: ['bad'],
        });

        entity.getStates();
      }

      expect(fn).toThrowErrorMatchingSnapshot();
    });

    it('should throw on invalid state names', () => {
      function fn() {
        const entity = new Entity({
          ...entityDefinition,
          states: {
            ['bad-state-name']: 123,
          },
        });

        entity.getStates();
      }

      expect(fn).toThrowErrorMatchingSnapshot();
    });

    it('should throw on invalid state IDs', () => {
      function fn1() {
        const entity = new Entity({
          ...entityDefinition,
          states: {
            open: 1.234,
          },
        });

        entity.getStates();
      }

      expect(fn1).toThrowErrorMatchingSnapshot();

      function fn2() {
        const entity = new Entity({
          ...entityDefinition,
          states: {
            open: -1,
          },
        });

        entity.getStates();
      }

      expect(fn2).toThrowErrorMatchingSnapshot();

      function fn3() {
        const entity = new Entity({
          ...entityDefinition,
          states: {
            open: 0,
          },
        });

        entity.getStates();
      }

      expect(fn3).toThrowErrorMatchingSnapshot();

      function fn4() {
        const entity = new Entity({
          ...entityDefinition,
          states: {
            open: 'not a number',
          },
        });

        entity.getStates();
      }

      expect(fn4).toThrowErrorMatchingSnapshot();
    });

    it('should throw if state IDs are not unique', () => {
      function fn() {
        const entity = new Entity({
          ...entityDefinition,
          states: {
            open: 100,
            closed: 100,
          },
        });

        entity.getStates();
      }

      expect(fn).toThrowErrorMatchingSnapshot();
    });
  });

  describe('preProcessor', () => {
    let graphqlSchema: GraphQLSchema;

    beforeAll(async () => {
      const preProcessor = (entity, source, args, context, info) => {
        ({ context, info }); // overcome linter warnings

        return args;
      };

      const postProcessor = (
        result,
        entity,
        id,
        source,
        input,
        typeName,
        mutation,
        context,
      ) => {
        ({ entity, id, source, input, typeName, mutation, context }); // overcome linter warnings

        result.something = 'someotherthing';
        return result;
      };

      const SomeEntityWithPreprocess = new Entity({
        name: 'SomeEntityName',
        description: 'Just some description',
        attributes: {
          id: {
            type: DataTypeID,
            description: 'just some id',
            primary: true,
          },
          something: {
            type: DataTypeString,
            description: 'Just some description',
          },
        },
        preProcessor,
      });

      const SomeEntityWithPostprocess = new Entity({
        name: 'SomeOtherEntityName',
        description: 'Just some other description',
        attributes: {
          id: {
            type: DataTypeID,
            description: 'just some id',
            primary: true,
          },
          something: {
            type: DataTypeString,
            description: 'Just some description',
          },
        },
        postProcessor,
      });

      // create mutations to test processors ?
      const setup = await generateTestSchema([
        SomeEntityWithPreprocess,
        SomeEntityWithPostprocess,
      ]);
      const configuration = setup.configuration;
      graphqlSchema = generateGraphQLSchema(configuration);
    });

    it('should have a valid preProcessor function', () => {
      function fn() {
        // eslint-disable-next-line no-new
        new Entity({
          name: 'SomeEntityName',
          description: 'Just some description',
          attributes: {
            something: {
              type: DataTypeString,
              description: 'Just some description',
            },
          },
          preProcessor: 'not-a-function',
        });
      }

      expect(fn).toThrowErrorMatchingSnapshot();
    });

    it('should have a valid postProcessor function', () => {
      function fn() {
        // eslint-disable-next-line no-new
        new Entity({
          name: 'SomeEntityName',
          description: 'Just some description',
          attributes: {
            something: {
              type: DataTypeString,
              description: 'Just some description',
            },
          },
          postProcessor: 'not-a-function',
        });
      }

      expect(fn).toThrowErrorMatchingSnapshot();
    });

    it('should pass through preProcessor if it is declared', async () => {
      const query = `
        query AllSomeEntityNames {
          allSomeEntityNames {
            edges {
              node {
                id
                something
              }
            }
          }
        }`;

      const result = await graphql(
        graphqlSchema,
        query,
        null,
        { userId: 10 },
        // { filter: {} },
      );

      expect(result).toMatchSnapshot();
    });

    it('should pass through postProcessor if it is declared', async () => {
      const query = `
        query AllSomeOtherEntityNames {
          allSomeOtherEntityNames {
            edges {
              node {
                id
                something
              }
            }
          }
        }`;

      const result = await graphql(
        graphqlSchema,
        query,
        null,
        {},
        // { filter: {} },
      );

      expect(result).toMatchSnapshot();
    });
  });
});
