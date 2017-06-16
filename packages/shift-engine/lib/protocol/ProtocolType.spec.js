
import { assert } from 'chai';
import ProtocolType, { isProtocolType } from './ProtocolType';
import {
  DataTypeID,
  DataTypeString,
  DataTypeInteger,
  DataTypeBoolean,
} from '../datatype/dataTypes';


describe.only('ProtocolType', () => {

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

    assert.throws(fn1, /Missing protocol type name/);
    assert.throws(fn2, /Missing description/);

  })


  it('should implement isProtocolDataType', () => {

    function fn() {
      new ProtocolType({ // eslint-disable-line no-new
        name: 'REST',
        description: 'REST protocol type'
      })
    }

    assert.throws(fn, /needs to implement isProtocolDataType/);

  })


  it('should recognize object of type ProtocolType', () => {

    const result = isProtocolType(ProtocolTypeREST)
    assert.isTrue(result)
  })


  it('should recognize non-ProtocolType objects', () => {

    const result1 = isProtocolType({})
    const result2 = isProtocolType(123)
    const result3 = isProtocolType('test')

    assert.isFalse(result1)
    assert.isFalse(result2)
    assert.isFalse(result3)
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

    assert.throws(fn1, /not a valid data type/);
    assert.throws(fn2, /not a valid protocol data type/);
    assert.throws(fn3, /not a valid protocol data type/);

  })


  it('should reject duplicate data type mappings', () => {

    ProtocolTypeREST.addDataTypeMap(DataTypeInteger, ProtocolDataTypeInteger)

    function fn() {
      ProtocolTypeREST.addDataTypeMap(DataTypeInteger, ProtocolDataTypeInteger)
    }

    assert.throws(fn, /already registered with protocol type/);
  })



  it('should convert to protocol data types', () => {

    const result1 = ProtocolTypeREST.convertToProtocolDataType(DataTypeID)
    const result2 = ProtocolTypeREST.convertToProtocolDataType(DataTypeString)
    const result3 = ProtocolTypeREST.convertToProtocolDataType(DataTypeInteger)

    assert.deepEqual(result1, ProtocolDataTypeID)
    assert.deepEqual(result2, ProtocolDataTypeString)
    assert.deepEqual(result3, ProtocolDataTypeInteger)

  })


  it('should throw if unknown data type mapping is requested', () => {

    function fn1() {
      ProtocolTypeREST.convertToProtocolDataType('DataTypeInteger')
    }

    function fn2() {
      ProtocolTypeREST.convertToProtocolDataType(DataTypeBoolean)
    }

    assert.throws(fn1, /not a valid data type/);
    assert.throws(fn2, /No data type mapping found/);

  })


})
