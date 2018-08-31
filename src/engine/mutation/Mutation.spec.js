import {
  Mutation,
  isMutation,
  MUTATION_TYPE_CREATE,
  MUTATION_TYPE_UPDATE,
  MUTATION_TYPE_DELETE,
  processEntityMutations,
} from './Mutation';
import { Entity } from '../entity/Entity';
import { DataTypeString } from '../datatype/dataTypes';
import { passOrThrow } from '../util';

describe('Mutation', () => {
  const entity = new Entity({
    name: 'SomeEntityName',
    description: 'Just some description',
    attributes: {
      someAttribute: {
        type: DataTypeString,
        description: 'Just some description',
      },
      anotherAttribute: {
        type: DataTypeString,
        description: 'Just some description',
      },
    },
  });

  it('should have a name', () => {
    function fn() {
      // eslint-disable-next-line no-new
      new Mutation();
    }

    expect(fn).toThrowErrorMatchingSnapshot();
  });

  it('should have a type', () => {
    function fn() {
      // eslint-disable-next-line no-new
      new Mutation({
        name: 'example',
      });
    }

    expect(fn).toThrowErrorMatchingSnapshot();
  });

  it('should have a valid type', () => {
    function fn() {
      // eslint-disable-next-line no-new
      new Mutation({
        name: 'example',
        type: 12346,
      });
    }

    expect(fn).toThrowErrorMatchingSnapshot();
  });

  it('should have a description', () => {
    function fn() {
      // eslint-disable-next-line no-new
      new Mutation({
        name: 'example',
        type: MUTATION_TYPE_CREATE,
      });
    }

    expect(fn).toThrowErrorMatchingSnapshot();
  });

  it('should have a list of default attributes', () => {
    const mutation = new Mutation({
      name: 'example',
      type: MUTATION_TYPE_CREATE,
      description: 'mutate the world',
    });

    processEntityMutations(entity, [ mutation ]);
    const defaultAttributes = mutation.attributes;

    const expectedAttributes = [ 'someAttribute', 'anotherAttribute' ];

    expect(defaultAttributes).toEqual(expectedAttributes);
  });

  it('should have a list of valid attribute names', () => {
    const mutation = new Mutation({
      name: 'example',
      type: MUTATION_TYPE_CREATE,
      description: 'mutate the world',
      attributes: [ 'anything', { foo: 'bar' } ],
    });

    function fn() {
      processEntityMutations(entity, [ mutation ]);
    }

    expect(fn).toThrowErrorMatchingSnapshot();
  });

  it('should allow an empty attributes list for DELETE type mutations', () => {
    const mutation = new Mutation({
      name: 'example',
      type: MUTATION_TYPE_DELETE,
      description: 'mutate the world',
    });

    processEntityMutations(entity, [ mutation ]);
  });

  it('should have a list of unique attribute names', () => {
    const mutation = new Mutation({
      name: 'example',
      type: MUTATION_TYPE_CREATE,
      description: 'mutate the world',
      attributes: [ 'anything', 'anything' ],
    });

    function fn() {
      processEntityMutations(entity, [ mutation ]);
    }

    expect(fn).toThrowErrorMatchingSnapshot();
  });

  it("should return it's name", () => {
    const mutation = new Mutation({
      name: 'example',
      type: MUTATION_TYPE_UPDATE,
      description: 'mutate the world',
      attributes: [ 'anything' ],
    });

    expect(mutation.name).toBe('example');
    expect(String(mutation)).toBe('example');
  });

  it('should have a valid preProcessor function', () => {
    function fn() {
      // eslint-disable-next-line no-new
      new Mutation({
        name: 'example',
        type: MUTATION_TYPE_CREATE,
        description: 'mutate the world',
        attributes: [ 'anything' ],
        preProcessor: 'not-a-function',
      });
    }

    expect(fn).toThrowErrorMatchingSnapshot();
  });

  it('should have a valid postProcessor function', () => {
    function fn() {
      // eslint-disable-next-line no-new
      new Mutation({
        name: 'example',
        type: MUTATION_TYPE_CREATE,
        description: 'mutate the world',
        attributes: [ 'anything' ],
        postProcessor: 'not-a-function',
      });
    }

    expect(fn).toThrowErrorMatchingSnapshot();
  });

  it('should reject invalid fromState settings', () => {
    function fn() {
      // eslint-disable-next-line no-new
      new Mutation({
        name: 'example',
        type: MUTATION_TYPE_UPDATE,
        description: 'mutate the world',
        attributes: [ 'anything' ],
        fromState: { foo: 'bar' },
      });
    }

    expect(fn).toThrowErrorMatchingSnapshot();
  });

  it('should reject invalid toState settings', () => {
    function fn() {
      // eslint-disable-next-line no-new
      new Mutation({
        name: 'example',
        type: MUTATION_TYPE_UPDATE,
        description: 'mutate the world',
        attributes: [ 'anything' ],
        toState: 123,
      });
    }

    expect(fn).toThrowErrorMatchingSnapshot();
  });

  it('should prevent fromState settings for create type mutations', () => {
    function fn() {
      // eslint-disable-next-line no-new
      new Mutation({
        name: 'example',
        type: MUTATION_TYPE_CREATE,
        description: 'mutate the world',
        attributes: [ 'anything' ],
        fromState: 'open',
      });
    }

    expect(fn).toThrowErrorMatchingSnapshot();
  });

  it('should prevent toState settings for delete type mutations', () => {
    function fn() {
      // eslint-disable-next-line no-new
      new Mutation({
        name: 'example',
        type: MUTATION_TYPE_DELETE,
        description: 'mutate the world',
        attributes: [ 'anything' ],
        toState: 'closed',
      });
    }

    expect(fn).toThrowErrorMatchingSnapshot();
  });

  it('should reject fromState without toState on update type mutations', () => {
    function fn() {
      // eslint-disable-next-line no-new
      new Mutation({
        name: 'example',
        type: MUTATION_TYPE_UPDATE,
        description: 'mutate the world',
        attributes: [ 'anything' ],
        fromState: 'open',
      });
    }

    expect(fn).toThrowErrorMatchingSnapshot();
  });

  it('should reject toState without fromState on update type mutations', () => {
    function fn() {
      // eslint-disable-next-line no-new
      new Mutation({
        name: 'example',
        type: MUTATION_TYPE_UPDATE,
        description: 'mutate the world',
        attributes: [ 'anything' ],
        toState: 'close',
      });
    }

    expect(fn).toThrowErrorMatchingSnapshot();
  });

  describe('isMutation', () => {
    const mutation = new Mutation({
      name: 'example',
      type: MUTATION_TYPE_UPDATE,
      description: 'mutate the world',
      attributes: [ 'anything' ],
      preProcessor() {},
      postProcessor() {},
    });

    it('should recognize objects of type Mutation', () => {
      function fn() {
        passOrThrow(isMutation(mutation), () => 'This error will never happen');
      }

      expect(fn).not.toThrow();
    });

    it('should recognize non-Mutation objects', () => {
      function fn() {
        passOrThrow(
          isMutation({}) || isMutation(function test() {}) || isMutation(Error),
          () => 'Not a Mutation object',
        );
      }

      expect(fn).toThrowErrorMatchingSnapshot();
    });
  });

  describe('processEntityMutations', () => {
    const mutationTypeCreateDefinition = {
      type: MUTATION_TYPE_CREATE,
      name: 'build',
      description: 'build item',
      attributes: [ 'someAttribute' ],
    };

    const mutationTypeUpdateDefinition = {
      type: MUTATION_TYPE_UPDATE,
      name: 'change',
      description: 'change item',
      attributes: [ 'id', 'someAttribute' ],
    };

    const mutationTypeDeleteDefinition = {
      type: MUTATION_TYPE_DELETE,
      name: 'drop',
      description: 'drop item',
      attributes: [ 'id' ],
    };

    it('should throw if provided with an invalid list of mutations', () => {
      const mutations = {
        foo: [ {} ],
      };

      function fn() {
        processEntityMutations(entity, mutations);
      }

      expect(fn).toThrowErrorMatchingSnapshot();
    });

    it('should throw if provided with an invalid mutation', () => {
      const mutations = [ { foo: 'bar' } ];

      function fn() {
        processEntityMutations(entity, mutations);
      }

      expect(fn).toThrowErrorMatchingSnapshot();
    });

    it('should throw if required attribute (without defaultValue) is missing in CREATE type mutations', () => {
      function fn() {
        const otherEntity = new Entity({
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
            },
          },
          mutations: [
            new Mutation({
              type: MUTATION_TYPE_CREATE,
              name: 'build',
              description: 'build item',
              attributes: [ 'someAttribute' ],
            }),
          ],
        });

        otherEntity.getMutationByName('build');
      }

      expect(fn).toThrowErrorMatchingSnapshot();
    });

    it('should throw on duplicate mutation names', () => {
      const mutations = [
        new Mutation({
          type: MUTATION_TYPE_CREATE,
          name: 'build',
          description: 'build item',
          attributes: [ 'someAttribute' ],
        }),
        new Mutation({
          type: MUTATION_TYPE_CREATE,
          name: 'build',
          description: 'build item',
          attributes: [ 'someAttribute' ],
        }),
      ];

      function fn() {
        processEntityMutations(entity, mutations);
      }

      expect(fn).toThrowErrorMatchingSnapshot();
    });

    it('should throw if unknown attributes are used', () => {
      const mutations = [
        new Mutation({
          type: MUTATION_TYPE_CREATE,
          name: 'build',
          description: 'build item',
          attributes: [ 'doesNotExist' ],
        }),
      ];

      function fn() {
        processEntityMutations(entity, mutations);
      }

      expect(fn).toThrowErrorMatchingSnapshot();
    });

    it('should allow for empty attribute lists on DELETE type mutations', () => {
      const mutations = [
        new Mutation({
          type: MUTATION_TYPE_DELETE,
          name: 'drop',
          description: 'drop item',
          attributes: [],
        }),
      ];

      processEntityMutations(entity, mutations);
    });

    it('should throw if using state in a stateless entity', () => {
      const mutations1 = [
        new Mutation({
          ...mutationTypeUpdateDefinition,
          fromState: 'open',
          toState: 'close',
        }),
      ];

      function fn1() {
        processEntityMutations(entity, mutations1);
      }

      expect(fn1).toThrowErrorMatchingSnapshot();

      const mutations2 = [
        new Mutation({
          ...mutationTypeCreateDefinition,
          toState: 'close',
        }),
      ];

      function fn2() {
        processEntityMutations(entity, mutations2);
      }

      expect(fn2).toThrowErrorMatchingSnapshot();
    });

    it('should throw if unknown state name is used', () => {
      const someEntity = new Entity({
        name: 'SomeEntityName',
        description: 'Just some description',
        attributes: {
          someAttribute: {
            type: DataTypeString,
            description: 'Just some description',
          },
        },
        states: {
          open: 10,
          closed: 20,
          inTransfer: 40,
          onHold: 50,
        },
      });

      const mutations1 = [
        new Mutation({
          ...mutationTypeUpdateDefinition,
          fromState: 'fakeState',
          toState: 'close',
        }),
      ];

      function fn1() {
        processEntityMutations(someEntity, mutations1);
      }

      expect(fn1).toThrowErrorMatchingSnapshot();

      const mutations2 = [
        new Mutation({
          ...mutationTypeUpdateDefinition,
          fromState: [ 'open', 'whatever', 'close' ],
          toState: 'close',
        }),
      ];

      function fn2() {
        processEntityMutations(someEntity, mutations2);
      }

      expect(fn2).toThrowErrorMatchingSnapshot();

      function fn3() {
        const anotherEntity = new Entity({
          name: 'SomeEntityName',
          description: 'Just some description',
          attributes: {
            someAttribute: {
              type: DataTypeString,
              description: 'Just some description',
            },
          },
          states: {
            open: 10,
            closed: 20,
            inTransfer: 40,
            onHold: 50,
          },
        });

        const mutations3 = [
          new Mutation({
            ...mutationTypeUpdateDefinition,
            fromState: 'open',
            toState: [ 'closed', 'randomState', 'open' ],
          }),
        ];

        processEntityMutations(anotherEntity, mutations3);
      }

      expect(fn3).toThrowErrorMatchingSnapshot();

      const mutations4 = [
        new Mutation({
          ...mutationTypeDeleteDefinition,
          fromState: [ 'open', 'notHere', 'open' ],
        }),
      ];

      function fn4() {
        processEntityMutations(someEntity, mutations4);
      }

      expect(fn4).toThrowErrorMatchingSnapshot();
    });
  });
});
