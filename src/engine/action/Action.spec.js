/* eslint-disable @typescript-eslint/no-empty-function */

import { Action, isAction, ACTION_TYPE_QUERY } from './Action';
import { Permission, isPermission } from '../permission/Permission';

import { DataTypeString, DataTypeInteger } from '../datatype/dataTypes';
import { buildObjectDataType } from '../datatype/ObjectDataType';

import { passOrThrow } from '../util';
import { generateTestSchema } from '../../graphqlProtocol/test-helper';
import { generateGraphQLSchema } from '../../graphqlProtocol/generator';
import { graphql } from 'graphql';

describe('Action', () => {
  it('should have a name', () => {
    function fn() {
      // eslint-disable-next-line no-new
      new Action();
    }

    expect(fn).toThrowErrorMatchingSnapshot();
  });

  it('should have a description', () => {
    function fn() {
      // eslint-disable-next-line no-new
      new Action({
        name: 'example',
      });
    }

    expect(fn).toThrowErrorMatchingSnapshot();
  });

  it('should allow definitions without input', () => {
    function fn() {
      // eslint-disable-next-line no-new
      new Action({
        name: 'example',
        description: 'do something',
        resolve() {},
      });
    }

    expect(fn).not.toThrow();
  });

  it('should have a valid input definition', () => {
    function fn() {
      // eslint-disable-next-line no-new
      new Action({
        name: 'example',
        description: 'do something',
        input: 123,
        output: 456,
      });
    }

    expect(fn).toThrowErrorMatchingSnapshot();
  });

  it('should allow definitions without output', () => {
    function fn() {
      // eslint-disable-next-line no-new
      new Action({
        name: 'example',
        description: 'do something',
        input() {},
        resolve() {},
      });
    }

    expect(fn).not.toThrow();
  });

  it('should have a valid output definition', () => {
    function fn() {
      // eslint-disable-next-line no-new
      new Action({
        name: 'example',
        description: 'do something',
        input() {},
        output: 'wrong',
      });
    }

    expect(fn).toThrowErrorMatchingSnapshot();
  });

  it('should have valid input and output definitions when generated via a function', () => {
    // eslint-disable-next-line no-new
    const action = new Action({
      name: 'example',
      description: 'do something',
      input() {
        return 123;
      },
      output() {},
      resolve() {},
    });

    function fn1() {
      action.getInput();
    }

    function fn2() {
      action.getOutput();
    }

    expect(fn1).toThrowErrorMatchingSnapshot();
    expect(fn2).toThrowErrorMatchingSnapshot();
  });

  it('should have valid input data types', () => {
    const action = new Action({
      name: 'example',
      description: 'do something',
      input: {
        someAttr: {},
      },
      output: {},
      resolve() {},
    });

    function fn() {
      action.getInput();
    }

    expect(fn).toThrowErrorMatchingSnapshot();
  });

  it('should have valid output data types', () => {
    const action = new Action({
      name: 'example',
      description: 'do something',
      input: {},
      output: {
        someAttr: {},
      },
      resolve() {},
    });

    function fn() {
      action.getOutput();
    }

    expect(fn).toThrowErrorMatchingSnapshot();
  });

  // it('should have valid input attributes if valid defaultValue functions', () => {

  //   const action = new Action({
  //     name: 'example',
  //     description: 'do something',
  //     input: {
  //       type: DataTypeString,
  //       defaultValue: 'not-a-function'
  //     },
  //     output: {},
  //     resolve() {},
  //   })

  //   function fn() {
  //     action.getInput()
  //   }

  //   expect(fn).toThrowErrorMatchingSnapshot();

  // })

  it('should have a valid resolve function', () => {
    function fn() {
      // eslint-disable-next-line no-new
      new Action({
        name: 'example',
        description: 'do something',
      });
    }

    expect(fn).toThrowErrorMatchingSnapshot();
  });

  it("should return it's name", () => {
    const action = new Action({
      name: 'example',
      description: 'do something',
      input: {},
      output: {},
      resolve() {},
    });

    expect(action.name).toBe('example');
    expect(String(action)).toBe('example');
  });

  it('should return input and output params', () => {
    const action1 = new Action({
      name: 'example',
      description: 'do something',
      resolve() {},
    });

    const input1 = action1.getInput();
    const output1 = action1.getOutput();

    expect(input1).toEqual(null);
    expect(output1).toEqual(null);

    const hasInput1 = action1.hasInput();
    const hasOutput1 = action1.hasOutput();

    expect(hasInput1).toBe(false);
    expect(hasOutput1).toBe(false);

    const action2 = new Action({
      name: 'example',
      description: 'do something',
      input: {
        type: buildObjectDataType({
          attributes: {
            firstName: {
              description: 'First name',
              type: DataTypeString,
              defaultValue() {
                return 'Waldo';
              },
            },
            lastName: {
              description: 'Last name',
              type: DataTypeString,
              required: true,
            },
            about: {
              description: 'Just some description',
              type: buildObjectDataType({
                attributes: {
                  favouriteActor: {
                    type: DataTypeString,
                    description: 'One more description',
                  },
                },
              }),
            },
          },
        }),
      },
      output: {
        type: buildObjectDataType({
          attributes: {
            luckyNumber: {
              description: 'Lucky number',
              type: DataTypeString,
            },
          },
        }),
      },
      resolve() {},
    });

    const input2 = action2.getInput();
    const output2 = action2.getOutput();

    expect(input2).toMatchSnapshot();
    expect(output2).toMatchSnapshot();

    const attributes2 = input2.type.getAttributes();
    expect(attributes2).toMatchSnapshot();

    expect(typeof attributes2.firstName.defaultValue).toBe('function');

    const nestedAttributes2 = attributes2.about.type.getAttributes();
    expect(nestedAttributes2).toMatchSnapshot();

    const hasInput2 = action2.hasInput();
    const hasOutput2 = action2.hasOutput();

    expect(hasInput2).toBe(true);
    expect(hasOutput2).toBe(true);
  });

  describe('isAction', () => {
    const action = new Action({
      name: 'example',
      description: 'do something',
      input: {},
      output: {},
      resolve() {},
    });

    it('should recognize objects of type Action', () => {
      function fn() {
        passOrThrow(isAction(action), () => 'This error will never happen');
      }

      expect(fn).not.toThrow();
    });

    it('should recognize non-Action objects', () => {
      function fn() {
        passOrThrow(
          isAction({}) || isAction(function test() {}) || isAction(Error),
          () => 'Not a Action object',
        );
      }

      expect(fn).toThrowErrorMatchingSnapshot();
    });
  });

  describe('permissions', () => {
    it('should return permissions', () => {
      const action = new Action({
        name: 'example',
        description: 'do something',
        input: {},
        output: {},
        resolve() {},
        permissions: new Permission().authenticated(),
      });

      const permissions = action.getPermissions();

      expect(isPermission(permissions)).toBe(true);
    });

    it('should throw if empty permissions are provided', () => {
      const action = new Action({
        name: 'example',
        description: 'do something',
        input: {},
        output: {},
        resolve() {},
        permissions: [new Permission().authenticated(), new Permission()],
      });

      function fn() {
        action.getPermissions();
      }

      expect(fn).toThrowErrorMatchingSnapshot();
    });
  });

  describe('preProcessor', () => {
    it('should have a valid preProcessor function if defined', () => {
      function fn() {
        // eslint-disable-next-line no-new
        new Action({
          name: 'example',
          description: 'do something',
          resolve() {},
          preProcessor: 'not-a-func',
        });
      }

      expect(fn).toThrowErrorMatchingSnapshot();
    });

    it('should pass through preProcessor if it is declared', async () => {
      const setup = await generateTestSchema({
        actions: [
          new Action({
            name: 'SomeActionWithPreProcessor',
            type: ACTION_TYPE_QUERY,
            description: 'do something',
            input: {
              type: DataTypeInteger,
            },
            output: {
              type: buildObjectDataType({
                attributes: {
                  value: {
                    type: DataTypeInteger,
                    description: 'result value',
                  },
                },
              }),
            },
            resolve(source, args) {
              return {
                value: args,
              };
            },
            preProcessor: (action, source, payload) => {
              if (payload === 13) {
                throw new Error('13 brings bad luck');
              }
            },
          }),
        ],
      });

      const graphqlSchema = generateGraphQLSchema(setup.configuration);

      const query = `
        query SomeActionWithPreProcessor($number: Int!) {
          someActionWithPreProcessor (input: {
            data: $number
          }) {
            result {
              value
            }
          }
        }


        `;

      const result1 = await graphql(graphqlSchema, query, null, null, {
        number: 123,
      });
      expect(result1).toMatchSnapshot();

      const result2 = await graphql(graphqlSchema, query, null, null, {
        number: 13,
      });
      expect(result2).toMatchSnapshot();
    });
  });

  describe('postProcessor', () => {
    it('should have a valid postProcessor function if defined', () => {
      function fn() {
        // eslint-disable-next-line no-new
        new Action({
          name: 'example',
          description: 'do something',
          resolve() {},
          postProcessor: 'not-a-func',
        });
      }

      expect(fn).toThrowErrorMatchingSnapshot();
    });

    it('should pass through postProcessor if it is declared', async () => {
      const setup = await generateTestSchema({
        actions: [
          new Action({
            name: 'SomeActionWithPostProcessor',
            type: ACTION_TYPE_QUERY,
            description: 'do something',
            input: {
              type: DataTypeInteger,
            },
            output: {
              type: buildObjectDataType({
                attributes: {
                  value: {
                    type: DataTypeInteger,
                    description: 'result value',
                  },
                },
              }),
            },
            resolve(source, args) {
              return {
                value: args,
              };
            },
            postProcessor: (error, result, action, source, payload) => {
              if (payload > 1000) {
                result.value *= 2;
              }
            },
          }),
        ],
      });

      const graphqlSchema = generateGraphQLSchema(setup.configuration);

      const query = `
        query SomeActionWithPostProcessor($number: Int!) {
          someActionWithPostProcessor (input: {
            data: $number
          }) {
            result {
              value
            }
          }
        }


        `;

      const result1 = await graphql(graphqlSchema, query, null, null, {
        number: 123,
      });
      expect(result1).toMatchSnapshot();

      const result2 = await graphql(graphqlSchema, query, null, null, {
        number: 1234,
      });
      expect(result2).toMatchSnapshot();
    });
  });

  describe('defaultValue', () => {
    it('should fill in provided default value', async () => {
      const setup = await generateTestSchema({
        actions: [
          new Action({
            name: 'SomeAction',
            type: ACTION_TYPE_QUERY,
            description: 'do something',
            input: {
              type: DataTypeInteger,
              description: 'just a number',
              defaultValue: () => {
                return 2000;
              },
            },
            output: {
              type: buildObjectDataType({
                attributes: {
                  value: {
                    type: DataTypeInteger,
                    description: 'result value',
                  },
                },
              }),
            },
            resolve(source, args) {
              return {
                value: args,
              };
            },
          }),
        ],
      });

      const graphqlSchema = generateGraphQLSchema(setup.configuration);

      const query = `
        query SomeAction($number: Int) {
          someAction (input: {
            data: $number
          }) {
            result {
              value
            }
          }
        }


        `;

      const result = await graphql(graphqlSchema, query, null, null, {});
      expect(result).toMatchSnapshot();
    });

    it('should fill in provided default values in nested input objects', async () => {
      const setup = await generateTestSchema({
        actions: [
          new Action({
            name: 'SomeAction',
            type: ACTION_TYPE_QUERY,
            description: 'do something',
            input: {
              type: buildObjectDataType({
                attributes: {
                  number: {
                    type: DataTypeInteger,
                    description: 'just a number',
                    defaultValue: () => {
                      return 2000;
                    },
                  },
                },
              }),
            },
            output: {
              type: buildObjectDataType({
                attributes: {
                  value: {
                    type: DataTypeInteger,
                    description: 'result value',
                  },
                },
              }),
            },
            resolve(source, args) {
              return {
                value: args.number,
              };
            },
          }),
        ],
      });

      const graphqlSchema = generateGraphQLSchema(setup.configuration);

      const query = `
        query SomeAction($number: Int) {
          someAction (input: {
            data: {
              number: $number
            }
          }) {
            result {
              value
            }
          }
        }


        `;

      const result = await graphql(graphqlSchema, query, null, null, {});
      expect(result).toMatchSnapshot();
    });
  });
});
