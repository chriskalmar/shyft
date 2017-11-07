
import { assert } from 'chai';
import DataTypeState, { isDataTypeState } from './DataTypeState';

import {
  passOrThrow,
} from '../util';



describe('DataTypeState', () => {

  it('should have a set of states', () => {

    let fn

    fn = () => {
      new DataTypeState({ // eslint-disable-line no-new
        name: 'something',
      })
    }

    assert.throws(fn, /Missing states/);


    fn = () => {
      new DataTypeState({ // eslint-disable-line no-new
        name: 'something',
        states: {},
      })
    }

    assert.throws(fn, /Missing states/);

  })


  it('should have a set of valid states', () => {

    let fn

    fn = () => {
      new DataTypeState({ // eslint-disable-line no-new
        name: 'progress',
        states: {
          '6': 1,
        },
      })
    }

    assert.throws(fn, /Invalid state name \'6\' for data type \'progress\'/);

    fn = () => {
      new DataTypeState({ // eslint-disable-line no-new
        states: {
          ' abc ': 123,
        },
        name: 'test'
      })
    }

    assert.throws(fn, /Invalid state name \' abc \' for data type \'test\'/);

    fn = () => {
      new DataTypeState({ // eslint-disable-line no-new
        name: 'another',
        states: {
          'abc': 1,
          'def': 2,
          'hello-there': 3,
        },
      })
    }

    assert.throws(fn, /Invalid state name \'hello-there\' for data type \'another\'/);

  })


  it('should have a name', () => {

    function fn() {
      new DataTypeState({ // eslint-disable-line no-new
        states: {
          item: 1
        },
      })
    }

    assert.throws(fn, /Missing data type name/);

  })


  it('should return it\'s name', () => {

    const dataType = new DataTypeState({
      name: 'someDataTypeName',
      description: 'Just some description',
      states: {
        item: 1
      },
    })

    assert.strictEqual(dataType.name, 'someDataTypeName');
    assert.strictEqual(String(dataType), 'someDataTypeName');

  })


  it('should have a fallback description', () => {

    const dataType = new DataTypeState({
      name: 'example',
      states: {
        OPEN: 1,
        CLOSED: 2,
        IN_PROGRESS: 3,
      },
    })

    assert.strictEqual(dataType.description, 'States: OPEN, CLOSED, IN_PROGRESS');
  })


  it('should have a generated mock function', () => {

    const states = {
      OPEN: 1,
      CLOSED: 2,
      IN_PROGRESS: 3,
    }

    const stateNames = Object.keys(states)
    const uniqueIds = []

    stateNames.map(stateName => {
      const stateId = states[stateName]
      uniqueIds.push(stateId)
    })

    const dataType = new DataTypeState({
      name: 'example',
      states,
    })

    const randomState1 = dataType.mock()
    const randomState2 = dataType.mock()
    const randomState3 = dataType.mock()

    assert.isTrue( uniqueIds.includes(randomState1) );
    assert.isTrue( uniqueIds.includes(randomState2) );
    assert.isTrue( uniqueIds.includes(randomState3) );
  })


  describe('isDataTypeState', () => {


    it('should recognize objects of type DataTypeState', () => {

      const stateType1 = new DataTypeState({
        name: 'stateType1',
        states: {
          OPEN: 1,
          CLOSED: 2,
          IN_PROGRESS: 3,
        }
      })

      const stateType2 = new DataTypeState({
        name: 'stateType2',
        states: {
          initialized: 100,
          gone: 2000,
        }
      })

      function fn() {
        passOrThrow(
          isDataTypeState(stateType1) &&
          isDataTypeState(stateType2),
          () => 'This error will never happen'
        )
      }

      assert.doesNotThrow(fn)

    })


    it('should recognize non-DataTypeState objects', () => {

      function fn() {
        passOrThrow(
          isDataTypeState({}) ||
          isDataTypeState(function test() {}) ||
          isDataTypeState(assert),
          () => 'Not a DataTypeState object'
        )
      }


      assert.throws(fn, /Not a DataTypeState object/);

    })

  })


})
