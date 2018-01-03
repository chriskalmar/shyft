
import ProtocolType, { isProtocolType } from './ProtocolType';
import {
  DataTypeID,
  DataTypeString,
  DataTypeInteger,
  DataTypeBoolean,
} from '../datatype/dataTypes';


describe('ProtocolType', () => {

  const ProtocolTypeREST = new ProtocolType({
    name: 'ProtocolTypeREST',
    description: 'REST API protocol',
    isProtocolDataType(protocolDataType) {
      return (typeof protocolDataType  === 'object' && protocolDataType.name)
    }
  })

  const ProtocolDataTypeID = {
    name: 'ProtocolDataTypeID'
  }

  const ProtocolDataTypeString = {
    name: 'ProtocolDataTypeString'
  }

  const ProtocolDataTypeInteger = {
    name: 'ProtocolDataTypeInteger'
  }


  it('should reject invalid protocol type definitions', () => {

    function fn1() {
      new ProtocolType({}) // eslint-disable-line no-new
    }

    function fn2() {
      new ProtocolType({ // eslint-disable-line no-new
        name: 'REST',
      })
    }

    expect(fn1).toThrow();
    expect(fn2).toThrow();

  })


  it('should implement isProtocolDataType', () => {

    function fn() {
      new ProtocolType({ // eslint-disable-line no-new
        name: 'REST',
        description: 'REST protocol type'
      })
    }

    expect(fn).toThrow();

  })


  it('should recognize object of type ProtocolType', () => {

    const result = isProtocolType(ProtocolTypeREST)
    expect(result).toBe(true)
  })


  it('should recognize non-ProtocolType objects', () => {

    const result1 = isProtocolType({})
    const result2 = isProtocolType(123)
    const result3 = isProtocolType('test')

    expect(result1).toBe(false)
    expect(result2).toBe(false)
    expect(result3).toBe(false)
  })



  it('should map data types to protocol data types', () => {

    ProtocolTypeREST.addDataTypeMap(DataTypeID, ProtocolDataTypeID)
    ProtocolTypeREST.addDataTypeMap(DataTypeString, ProtocolDataTypeString)

  })


  it('should reject invalid data type mappings', () => {

    function fn1() {
      ProtocolTypeREST.addDataTypeMap('something')
    }

    function fn2() {
      ProtocolTypeREST.addDataTypeMap(DataTypeID)
    }

    function fn3() {
      ProtocolTypeREST.addDataTypeMap(DataTypeString, {})
    }

    expect(fn1).toThrow();
    expect(fn2).toThrow();
    expect(fn3).toThrow();

  })


  it('should reject duplicate data type mappings', () => {

    ProtocolTypeREST.addDataTypeMap(DataTypeInteger, ProtocolDataTypeInteger)

    function fn() {
      ProtocolTypeREST.addDataTypeMap(DataTypeInteger, ProtocolDataTypeInteger)
    }

    expect(fn).toThrow();
  })



  it('should convert to protocol data types', () => {

    const result1 = ProtocolTypeREST.convertToProtocolDataType(DataTypeID)
    const result2 = ProtocolTypeREST.convertToProtocolDataType(DataTypeString)
    const result3 = ProtocolTypeREST.convertToProtocolDataType(DataTypeInteger)

    expect(result1).toEqual(ProtocolDataTypeID)
    expect(result2).toEqual(ProtocolDataTypeString)
    expect(result3).toEqual(ProtocolDataTypeInteger)

  })


  it('should throw if unknown data type mapping is requested', () => {

    function fn1() {
      ProtocolTypeREST.convertToProtocolDataType('DataTypeInteger')
    }

    function fn2() {
      ProtocolTypeREST.convertToProtocolDataType(DataTypeBoolean)
    }

    expect(fn1).toThrow();
    expect(fn2).toThrow();

  })


})
