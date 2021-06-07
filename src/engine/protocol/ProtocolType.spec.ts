/* eslint-disable @typescript-eslint/explicit-function-return-type */

import { ProtocolType, isProtocolType, ProtocolDataType } from './ProtocolType';
import {
  DataTypeID,
  DataTypeString,
  DataTypeInteger,
  DataTypeBoolean,
} from '../datatype/dataTypes';
import { DataType } from '../datatype/DataType';

describe('ProtocolType', () => {
  const ProtocolTypeREST = new ProtocolType({
    name: 'ProtocolTypeREST',
    description: 'REST API protocol',
    isProtocolDataType(protocolDataType) {
      return typeof protocolDataType === 'object' && protocolDataType.name;
    },
  });

  const ProtocolDataTypeID = {
    name: 'ProtocolDataTypeID',
  };

  const ProtocolDataTypeString = {
    name: 'ProtocolDataTypeString',
  };

  const ProtocolDataTypeInteger = {
    name: 'ProtocolDataTypeInteger',
  };

  it('should reject invalid protocol type definitions', () => {
    function fn1() {
      // eslint-disable-next-line no-new
      new ProtocolType({});
    }

    function fn2() {
      // eslint-disable-next-line no-new
      new ProtocolType({
        name: 'REST',
      });
    }

    expect(fn1).toThrowErrorMatchingSnapshot();
    expect(fn2).toThrowErrorMatchingSnapshot();
  });

  it('should implement isProtocolDataType', () => {
    function fn() {
      // eslint-disable-next-line no-new
      new ProtocolType({
        name: 'REST',
        description: 'REST protocol type',
      });
    }

    expect(fn).toThrowErrorMatchingSnapshot();
  });

  it('should recognize object of type ProtocolType', () => {
    const result = isProtocolType(ProtocolTypeREST);
    expect(result).toBe(true);
  });

  it('should recognize non-ProtocolType objects', () => {
    const result1 = isProtocolType({});
    const result2 = isProtocolType(123);
    const result3 = isProtocolType('test');

    expect(result1).toBe(false);
    expect(result2).toBe(false);
    expect(result3).toBe(false);
  });

  it('should map data types to protocol data types', () => {
    ProtocolTypeREST.addDataTypeMap(DataTypeID, ProtocolDataTypeID);
    ProtocolTypeREST.addDataTypeMap(DataTypeString, ProtocolDataTypeString);
  });

  it('should reject invalid data type mappings', () => {
    function fn1() {
      ProtocolTypeREST.addDataTypeMap(('something' as unknown) as DataType, undefined);
    }

    function fn2() {
      ProtocolTypeREST.addDataTypeMap(DataTypeID, undefined);
    }

    function fn3() {
      ProtocolTypeREST.addDataTypeMap(DataTypeString, ({} as unknown) as ProtocolDataType);
    }

    expect(fn1).toThrowErrorMatchingSnapshot();
    expect(fn2).toThrowErrorMatchingSnapshot();
    expect(fn3).toThrowErrorMatchingSnapshot();
  });

  it('should reject duplicate data type mappings', () => {
    ProtocolTypeREST.addDataTypeMap(DataTypeInteger, ProtocolDataTypeInteger);

    function fn() {
      ProtocolTypeREST.addDataTypeMap(DataTypeInteger, ProtocolDataTypeInteger);
    }

    expect(fn).toThrowErrorMatchingSnapshot();
  });

  it('should convert to protocol data types', () => {
    const result1 = ProtocolTypeREST.convertToProtocolDataType(DataTypeID);
    const result2 = ProtocolTypeREST.convertToProtocolDataType(DataTypeString);
    const result3 = ProtocolTypeREST.convertToProtocolDataType(DataTypeInteger);

    expect(result1).toEqual(ProtocolDataTypeID);
    expect(result2).toEqual(ProtocolDataTypeString);
    expect(result3).toEqual(ProtocolDataTypeInteger);
  });

  it('should throw if unknown data type mapping is requested', () => {
    function fn1() {
      ProtocolTypeREST.convertToProtocolDataType('DataTypeInteger');
    }

    function fn2() {
      ProtocolTypeREST.convertToProtocolDataType(DataTypeBoolean);
    }

    expect(fn1).toThrowErrorMatchingSnapshot();
    expect(fn2).toThrowErrorMatchingSnapshot();
  });
});
