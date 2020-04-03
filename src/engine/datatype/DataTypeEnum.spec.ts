/* eslint-disable @typescript-eslint/no-empty-function */

import {
  DataTypeEnum,
  DataTypeEnumSetupType,
  isDataTypeEnum,
} from './DataTypeEnum';

import { passOrThrow } from '../util';

describe('DataTypeEnum', () => {
  it('should have a set of values', () => {
    let fn;

    fn = () => {
      // eslint-disable-next-line no-new
      new DataTypeEnum({
        name: 'something',
      } as DataTypeEnumSetupType);
    };

    expect(fn).toThrowErrorMatchingSnapshot();

    fn = () => {
      // eslint-disable-next-line no-new
      new DataTypeEnum({
        name: 'something',
        values: {},
      } as DataTypeEnumSetupType);
    };

    expect(fn).toThrowErrorMatchingSnapshot();
  });

  it('should have a set of valid values', () => {
    let fn;

    fn = () => {
      // eslint-disable-next-line no-new
      new DataTypeEnum({
        name: 'lorem',
        values: {
          '7': 8,
        },
      } as DataTypeEnumSetupType);
    };

    expect(fn).toThrowErrorMatchingSnapshot();

    fn = () => {
      // eslint-disable-next-line no-new
      new DataTypeEnum({
        values: {
          ' abc ': 123,
        },
        name: 'test',
      } as DataTypeEnumSetupType);
    };

    expect(fn).toThrowErrorMatchingSnapshot();

    fn = () => {
      // eslint-disable-next-line no-new
      new DataTypeEnum({
        name: 'another',
        values: {
          abc: 1,
          def: 2,
          'hello-there': 3,
        },
      } as DataTypeEnumSetupType);
    };

    expect(fn).toThrowErrorMatchingSnapshot();
  });

  it('should have a name', () => {
    function fn() {
      // eslint-disable-next-line no-new
      new DataTypeEnum({
        values: {
          item: 1,
        },
      } as any);
    }

    expect(fn).toThrowErrorMatchingSnapshot();
  });

  it("should return it's name", () => {
    const dataType = new DataTypeEnum({
      name: 'someDataTypeName',
      description: 'Just some description',
      values: {
        item: 1,
      },
    });

    expect(dataType.name).toBe('someDataTypeName');
    expect(String(dataType)).toBe('someDataTypeName');
  });

  it('should have a fallback description', () => {
    const dataType = new DataTypeEnum({
      name: 'example',
      values: {
        ACTION: 1,
        COMEDY: 2,
        DRAMA: 3,
      },
    } as DataTypeEnumSetupType);

    expect(dataType.description).toBe('Enumeration set: ACTION, COMEDY, DRAMA');
  });

  it('should have a generated mock function', () => {
    const values = {
      ACTION: 1,
      COMEDY: 2,
      DRAMA: 3,
    };

    const valueNames = Object.keys(values);
    const uniqueIds = [];

    valueNames.map(valueName => {
      const valueId = values[valueName];
      uniqueIds.push(valueId);
    });

    const dataType = new DataTypeEnum({
      name: 'example',
      values,
    } as DataTypeEnumSetupType);

    const randomValue1 = dataType.mock();
    const randomValue2 = dataType.mock();
    const randomValue3 = dataType.mock();

    expect(uniqueIds.includes(randomValue1)).toBe(true);
    expect(uniqueIds.includes(randomValue2)).toBe(true);
    expect(uniqueIds.includes(randomValue3)).toBe(true);
  });

  describe('isDataTypeEnum', () => {
    it('should recognize objects of type DataTypeEnum', () => {
      const enum1 = new DataTypeEnum({
        name: 'enum1',
        values: {
          ACTION: 1,
          COMEDY: 2,
          DRAMA: 3,
        },
      } as DataTypeEnumSetupType);

      const enum2 = new DataTypeEnum({
        name: 'enum2',
        values: {
          APPLE: 10,
          PEAR: 20,
          CHERRY: 30,
        },
      } as DataTypeEnumSetupType);

      function fn() {
        passOrThrow(
          isDataTypeEnum(enum1) && isDataTypeEnum(enum2),
          () => 'This error will never happen',
        );
      }

      expect(fn).not.toThrow();
    });

    it('should recognize non-DataTypeEnum objects', () => {
      function fn() {
        passOrThrow(
          isDataTypeEnum({}) ||
            isDataTypeEnum(function test() {}) ||
            isDataTypeEnum(Error),
          () => 'Not a DataTypeEnum object',
        );
      }

      expect(fn).toThrowErrorMatchingSnapshot();
    });
  });
});
