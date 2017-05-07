
import {
  passOrThrow,
  isFunction,
} from '../util';

import { isDataType } from '../datatype/DataType';


class ProtocolType {

  constructor (setup = {}) {

    const {
      name,
      description,
      isProtocolDataType,
    } = setup

    passOrThrow(name, () => 'Missing protocol type name')
    passOrThrow(description, () => `Missing description for protocol type '${name}'`)

    passOrThrow(
      isFunction(isProtocolDataType),
      () => `Protocol type '${name}' needs to implement isProtocolDataType()`
    )

    this.name = name
    this.description = description
    this.isProtocolDataType = isProtocolDataType

    this._dataTypeMap = {}
  }


  addDataTypeMap(schemaDataType, protocolDataType) {

    passOrThrow(
      isDataType(schemaDataType),
      () => `Provided schemaDataType is not a valid data type in '${this.name}'`
    )

    passOrThrow(
      this.isProtocolDataType(protocolDataType),
      () => `Provided protocolDataType for '${schemaDataType}' is not a valid protocol data type in '${this.name}'`
    )

    passOrThrow(
      !this._dataTypeMap[ schemaDataType.name ],
      () => `Data type mapping for '${schemaDataType.name}' already registered with protocol type '${this.name}'`
    )

    this._dataTypeMap[ schemaDataType.name ] = protocolDataType
  }


  convertToProtocolDataType (schemaDataType) {

    passOrThrow(
      isDataType(schemaDataType),
      () => `Provided schemaDataType is not a valid data type in '${this.name}'`
    )

    passOrThrow(
      this._dataTypeMap[ schemaDataType.name ],
      () => `No data type mapping found for '${schemaDataType.name}' in protocol type '${this.name}'`
    )

    return this._dataTypeMap[ schemaDataType.name ]
  }


  toString() {
    return this.name
  }

}


export default ProtocolType


export const isProtocolType = (obj) => {
  return (obj instanceof ProtocolType)
}
