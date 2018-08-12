import DataTypeState, { isDataTypeState } from './DataTypeState';

import { passOrThrow } from '../util';

describe('DataTypeState', () => {
  it('should have a set of states', () => {
    let fn;

    fn = () => {
      // eslint-disable-next-line no-new
      new DataTypeState({
        name: 'something',
      });
    };

    expect(fn).toThrowErrorMatchingSnapshot();

    fn = () => {
      // eslint-disable-next-line no-new
      new DataTypeState({
        name: 'something',
        states: {},
      });
    };

    expect(fn).toThrowErrorMatchingSnapshot();
  });

  it('should have a set of valid states', () => {
    let fn;

    fn = () => {
      // eslint-disable-next-line no-new
      new DataTypeState({
        name: 'progress',
        states: {
          '6': 1,
        },
      });
    };

    expect(fn).toThrowErrorMatchingSnapshot();

    fn = () => {
      // eslint-disable-next-line no-new
      new DataTypeState({
        states: {
          ' abc ': 123,
        },
        name: 'test',
      });
    };

    expect(fn).toThrowErrorMatchingSnapshot();

    fn = () => {
      // eslint-disable-next-line no-new
      new DataTypeState({
        name: 'another',
        states: {
          abc: 1,
          def: 2,
          'hello-there': 3,
        },
      });
    };

    expect(fn).toThrowErrorMatchingSnapshot();
  });

  it('should have a name', () => {
    function fn() {
      // eslint-disable-next-line no-new
      new DataTypeState({
        states: {
          item: 1,
        },
      });
    }

    expect(fn).toThrowErrorMatchingSnapshot();
  });

  it("should return it's name", () => {
    const dataType = new DataTypeState({
      name: 'someDataTypeName',
      description: 'Just some description',
      states: {
        item: 1,
      },
    });

    expect(dataType.name).toBe('someDataTypeName');
    expect(String(dataType)).toBe('someDataTypeName');
  });

  it('should have a fallback description', () => {
    const dataType = new DataTypeState({
      name: 'example',
      states: {
        OPEN: 1,
        CLOSED: 2,
        IN_PROGRESS: 3,
      },
    });

    expect(dataType.description).toBe('States: OPEN, CLOSED, IN_PROGRESS');
  });

  it('should have a generated mock function', () => {
    const states = {
      OPEN: 1,
      CLOSED: 2,
      IN_PROGRESS: 3,
    };

    const stateNames = Object.keys(states);
    const uniqueIds = [];

    stateNames.map(stateName => {
      const stateId = states[stateName];
      uniqueIds.push(stateId);
    });

    const dataType = new DataTypeState({
      name: 'example',
      states,
    });

    const randomState1 = dataType.mock();
    const randomState2 = dataType.mock();
    const randomState3 = dataType.mock();

    expect(uniqueIds.includes(randomState1)).toBe(true);
    expect(uniqueIds.includes(randomState2)).toBe(true);
    expect(uniqueIds.includes(randomState3)).toBe(true);
  });

  describe('isDataTypeState', () => {
    it('should recognize objects of type DataTypeState', () => {
      const stateType1 = new DataTypeState({
        name: 'stateType1',
        states: {
          OPEN: 1,
          CLOSED: 2,
          IN_PROGRESS: 3,
        },
      });

      const stateType2 = new DataTypeState({
        name: 'stateType2',
        states: {
          initialized: 100,
          gone: 2000,
        },
      });

      function fn() {
        passOrThrow(
          isDataTypeState(stateType1) && isDataTypeState(stateType2),
          () => 'This error will never happen',
        );
      }

      expect(fn).not.toThrow();
    });

    it('should recognize non-DataTypeState objects', () => {
      function fn() {
        passOrThrow(
          isDataTypeState({}) ||
            isDataTypeState(function test() {}) ||
            isDataTypeState(Error),
          () => 'Not a DataTypeState object',
        );
      }

      expect(fn).toThrowErrorMatchingSnapshot();
    });
  });
});
