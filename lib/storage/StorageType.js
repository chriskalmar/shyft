
import {
  passOrThrow,
  isFunction,
} from '../util';

import { isDataType } from '../datatype/DataType';
import { isStorageDataType } from './StorageDataType';

class StorageType {

  constructor (setup = {}) {

    const {
      name,
      description,
      findOne,
      find,
    } = setup

    passOrThrow(name, () => 'Missing storage type name')
    passOrThrow(description, () => `Missing description for storage type '${name}'`)

    passOrThrow(
      isFunction(findOne),
      () => `Storage type '${name}' needs to implement findOne()`
    )

    passOrThrow(
      isFunction(find),
      () => `Storage type '${name}' needs to implement find()`
    )

    this.name = name
    this.description = description
    this.findOne = findOne
    this.find = find

    this._dataTypeMap = {}
  }


  addDataTypeMap(schemaDataType, storageDataType) {

    passOrThrow(
      isDataType(schemaDataType),
      () => `Provided schemaDataType is not a valid data type in '${this.name}'`
    )

    passOrThrow(
      isStorageDataType(storageDataType),
      () => `Provided storageDataType for '${schemaDataType}' is not a valid storage data type in '${this.name}'`
    )

    passOrThrow(
      !this._dataTypeMap[ schemaDataType.name ],
      () => `Data type mapping for '${schemaDataType.name}' already registered with storage type '${this.name}'`
    )

    this._dataTypeMap[ schemaDataType.name ] = storageDataType
  }


  convertToStorageDataType (schemaDataType) {

    passOrThrow(
      isDataType(schemaDataType),
      () => `Provided schemaDataType is not a valid data type in storage type '${this.name}'`
    )

    passOrThrow(
      this._dataTypeMap[ schemaDataType.name ],
      () => `No data type mapping found for '${schemaDataType.name}' in storage type '${this.name}'`
    )

    return this._dataTypeMap[ schemaDataType.name ]
  }


  toString() {
    return this.name
  }

}


export default StorageType


export const isStorageType = (obj) => {
  return (obj instanceof StorageType)
}
