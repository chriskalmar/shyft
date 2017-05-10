
import {
  passOrThrow,
  isFunction,
  isMap,
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
      systemAttributes,
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

    if (systemAttributes) {
      passOrThrow(
        isMap(systemAttributes),
        () => `System attributes for storage type '${name}' need to be a map`
      )

      this.systemAttributes = systemAttributes
    }

    this.name = name
    this.description = description
    this.findOne = findOne
    this.find = find

    this._dataTypeMap = {}
  }


  addDataTypeMap(schemaDataType, storageDataType) {

    passOrThrow(
      isDataType(schemaDataType),
      () => `Provided schemaDataType is not a valid data type in '${this.name}', ` +
        `got this instead: ${String(schemaDataType)}`
    )

    passOrThrow(
      isStorageDataType(storageDataType),
      () => `Provided storageDataType for '${schemaDataType}' is not a valid storage data type in '${this.name}', ` +
        `got this instead: ${String(storageDataType)}`
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
      () => `Provided schemaDataType is not a valid data type in storage type '${this.name}', ` +
        `got this instead: ${String(schemaDataType)}`
    )

    passOrThrow(
      this._dataTypeMap[ schemaDataType.name ],
      () => `No data type mapping found for '${schemaDataType.name}' in storage type '${this.name}'`
    )

    return this._dataTypeMap[ schemaDataType.name ]
  }


  setStorageInstanceContextKey (storageInstanceContextKey) {
    this.storageInstanceContextKey = storageInstanceContextKey
  }


  getStorageInstanceFromContext (context) {
    passOrThrow(
      this.storageInstanceContextKey,
      () => `Storage instance context key not set for storage type '${this.name}'`
    )

    passOrThrow(
      context[ this.storageInstanceContextKey ],
      () => `Storage instance not found at context key for storage type '${this.name}'`
    )

    return context[ this.storageInstanceContextKey ]
  }


  toString() {
    return this.name
  }

}


export default StorageType


export const isStorageType = (obj) => {
  return (obj instanceof StorageType)
}
