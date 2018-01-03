
import Action, {
  isAction,
} from './Action';

import { DataTypeString } from '../datatype/dataTypes';
import { buildObjectDataType } from '../datatype/ObjectDataType';

import {
  passOrThrow,
} from '../util';



describe('Action', () => {

  it('should have a name', () => {

    function fn() {
      new Action() // eslint-disable-line no-new
    }

    expect(fn).toThrowErrorMatchingSnapshot();

  })


  it('should have a description', () => {

    function fn() {
      new Action({ // eslint-disable-line no-new
        name: 'example',
      })
    }

    expect(fn).toThrowErrorMatchingSnapshot();

  })


  it('should have an input definition', () => {

    function fn() {
      new Action({ // eslint-disable-line no-new
        name: 'example',
        description: 'do something',
      })
    }

    expect(fn).toThrowErrorMatchingSnapshot();

  })


  it('should have a valid input definition', () => {

    function fn() {
      new Action({ // eslint-disable-line no-new
        name: 'example',
        description: 'do something',
        input: 123,
        output: 456
      })
    }

    expect(fn).toThrowErrorMatchingSnapshot();

  })


  it('should have an output definition', () => {

    function fn() {
      new Action({ // eslint-disable-line no-new
        name: 'example',
        description: 'do something',
        input() {},
      })
    }

    expect(fn).toThrowErrorMatchingSnapshot();

  })


  it('should have a valid output definition', () => {

    function fn() {
      new Action({ // eslint-disable-line no-new
        name: 'example',
        description: 'do something',
        input() {},
        output: 'wrong'
      })
    }

    expect(fn).toThrowErrorMatchingSnapshot();

  })


  it('should have valid input and output definitions when generated via a function', () => {

    const action = new Action({ // eslint-disable-line no-new
      name: 'example',
      description: 'do something',
      input() {
        return 123
      },
      output() {},
      resolve() {},
    })

    function fn1() {
      action.getInput()
    }

    function fn2() {
      action.getOutput()
    }

    expect(fn1).toThrowErrorMatchingSnapshot();
    expect(fn2).toThrowErrorMatchingSnapshot();

  })


  it('should have valid input data types', () => {

    const action = new Action({
      name: 'example',
      description: 'do something',
      input: {
        someAttr: {}
      },
      output: {},
      resolve() {},
    })

    function fn() {
      action.getInput()
    }

    expect(fn).toThrowErrorMatchingSnapshot();

  })


  it('should have valid output data types', () => {

    const action = new Action({
      name: 'example',
      description: 'do something',
      input: {},
      output: {
        someAttr: {}
      },
      resolve() {},
    })

    function fn() {
      action.getOutput()
    }

    expect(fn).toThrowErrorMatchingSnapshot();

  })


  it('should have valid input attributes if valid defaultValue functions', () => {

    const action = new Action({
      name: 'example',
      description: 'do something',
      input: {
        someAttr: {
          type: DataTypeString,
          defaultValue: 'not-a-function'
        }
      },
      output: {},
      resolve() {},
    })

    function fn() {
      action.getInput()
    }

    expect(fn).toThrowErrorMatchingSnapshot();

  })


  it('should have a valid resolve function', () => {

    function fn() {
      new Action({ // eslint-disable-line no-new
        name: 'example',
        description: 'do something',
        input: {},
        output: {},
      })
    }

    expect(fn).toThrowErrorMatchingSnapshot();

  })


  it('should return it\'s name', () => {

    const action = new Action({
      name: 'example',
      description: 'do something',
      input: {},
      output: {},
      resolve() {},
    })

    expect(action.name).toBe('example');
    expect(String(action)).toBe('example');

  })


  it('should return input and output params', () => {

    const action1 = new Action({
      name: 'example',
      description: 'do something',
      input: {},
      output: {},
      resolve() {},
    })

    const input1 = action1.getInput()
    const output1 = action1.getOutput()

    expect(input1).toEqual({});
    expect(output1).toEqual({});

    const hasInputParams1 = action1.hasInputParams()
    const hasOutputParams1 = action1.hasOutputParams()

    expect(hasInputParams1).toBe(false);
    expect(hasOutputParams1).toBe(false);


    const action2 = new Action({
      name: 'example',
      description: 'do something',
      input: {
        firstName: {
          type: DataTypeString,
          defaultValue() {
            return 'Waldo'
          }
        },
        lastName: {
          type: DataTypeString,
          required: true
        },
        about: {
          description: 'Just some description',
          type: buildObjectDataType({
            attributes: {
              favouriteActor: {
                type: DataTypeString,
                description: 'One more description'
              },
            }
          })
        },
      },
      output: {
        luckyNumber: {
          type: DataTypeString,
        },
      },
      resolve() {},
    })

    const input2 = action2.getInput()
    const output2 = action2.getOutput()

    expect(String(input2.firstName.type)).toBe('DataTypeString');
    expect(String(input2.lastName.type)).toBe('DataTypeString');
    expect(input2.firstName.required).toBe(false);
    expect(input2.lastName.required).toBe(true);
    expect(typeof input2.firstName.defaultValue).toBe('function');

    const nestedInput2 = input2.about.type.getAttributes()
    expect(String(nestedInput2.favouriteActor.type)).toBe('DataTypeString')

    expect(String(output2.luckyNumber.type)).toBe('DataTypeString');

    const hasInputParams2 = action2.hasInputParams()
    const hasOutputParams2 = action2.hasOutputParams()

    expect(hasInputParams2).toBe(true);
    expect(hasOutputParams2).toBe(true);

  })


  describe('isAction', () => {

    const action = new Action({
      name: 'example',
      description: 'do something',
      input: {},
      output: {},
      resolve() {},
    })

    it('should recognize objects of type Action', () => {

      function fn() {
        passOrThrow(
          isAction(action),
          () => 'This error will never happen'
        )
      }

      expect(fn).not.toThrow()

    })


    it('should recognize non-Action objects', () => {

      function fn() {
        passOrThrow(
          isAction({}) ||
          isAction(function test() {}) ||
          isAction(Error),
          () => 'Not a Action object'
        )
      }

      expect(fn).toThrowErrorMatchingSnapshot();

    })

  })

})
