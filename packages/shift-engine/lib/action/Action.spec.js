
import { assert } from 'chai';
import Action, {
  isAction,
} from './Action';
import {
  DataTypeString,
} from '../datatype/dataTypes';
import {
  passOrThrow,
} from '../util';



describe.only('Action', () => {

  it('should have a name', () => {

    function fn() {
      new Action() // eslint-disable-line no-new
    }

    assert.throws(fn, /Missing action name/);

  })


  it('should have a description', () => {

    function fn() {
      new Action({ // eslint-disable-line no-new
        name: 'example',
      })
    }

    assert.throws(fn, /Missing description for action/);

  })


  it('should have an input definition', () => {

    function fn() {
      new Action({ // eslint-disable-line no-new
        name: 'example',
        description: 'do something',
      })
    }

    assert.throws(fn, /Missing input definition for action/);

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

    assert.throws(fn, /needs an input definition as a map or a function/);

  })


  it('should have an output definition', () => {

    function fn() {
      new Action({ // eslint-disable-line no-new
        name: 'example',
        description: 'do something',
        input() {},
      })
    }

    assert.throws(fn, /Missing output definition for action/);

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

    assert.throws(fn, /needs an output definition as a map or a function/);

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

    assert.throws(fn, /needs a resolve function/);

  })


  it('should return it\'s name', () => {

    const action = new Action({
      name: 'example',
      description: 'do something',
      input: {},
      output: {},
      resolve() {},
    })

    assert.strictEqual(action.name, 'example');
    assert.strictEqual(String(action), 'example');

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

    assert.deepEqual(input1, {});
    assert.deepEqual(output1, {});

    const hasInputParams1 = action1.hasInputParams()
    const hasOutputParams1 = action1.hasOutputParams()

    assert.isFalse(hasInputParams1);
    assert.isFalse(hasOutputParams1);


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

    assert.strictEqual(String(input2.firstName.type), 'DataTypeString');
    assert.strictEqual(String(input2.lastName.type), 'DataTypeString');
    assert.isFalse(input2.firstName.required);
    assert.isTrue(input2.lastName.required);
    assert.isFunction(input2.firstName.defaultValue);

    assert.strictEqual(String(output2.luckyNumber.type), 'DataTypeString');

    const hasInputParams2 = action2.hasInputParams()
    const hasOutputParams2 = action2.hasOutputParams()

    assert.isTrue(hasInputParams2);
    assert.isTrue(hasOutputParams2);

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

      assert.doesNotThrow(fn)

    })


    it('should recognize non-Action objects', () => {

      function fn() {
        passOrThrow(
          isAction({}) ||
          isAction(function test() {}) ||
          isAction(assert),
          () => 'Not a Action object'
        )
      }

      assert.throws(fn, /Not a Action object/);

    })

  })

})
