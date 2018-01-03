
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
      findOneByValues,
      find,
      count,
      mutate,
    } = setup

    passOrThrow(name, () => 'Missing storage type name')
    passOrThrow(description, () => `Missing description for storage type '${name}'`)

    passOrThrow(
      isFunction(findOne),
      () => `Storage type '${name}' needs to implement findOne()`
    )

    passOrThrow(
      isFunction(findOneByValues),
      () => `Storage type '${name}' needs to implement findOneByValues()`
    )

    passOrThrow(
      isFunction(find),
      () => `Storage type '${name}' needs to implement find()`
    )

    passOrThrow(
      isFunction(count),
      () => `Storage type '${name}' needs to implement count()`
    )

    passOrThrow(
      isFunction(mutate),
      () => `Storage type '${name}' needs to implement mutate()`
    )


    this.name = name
    this.description = description
    this.findOne = findOne
    this.findOneByValues = findOneByValues
    this.find = find
    this.count = count
    this.mutate = mutate

    this._dataTypeMap = {}
    this._dynamicDataTypeMap = []
  }


  addDataTypeMap(schemaDataType, storageDataType) {

    passOrThrow(
      isDataType(schemaDataType),
      () => `Provided schemaDataType is not a valid data type in '${this.name}', ` +
        `got this instead: ${String(schemaDataType)}`
    )

    passOrThrow(
      isStorageDataType(storageDataType),
      () => `Provided storageDataType for '${String(schemaDataType)}' is not a valid storage data type in '${this.name}', ` +
        `got this instead: ${String(storageDataType)}`
    )

    passOrThrow(
      !this._dataTypeMap[ schemaDataType.name ],
      () => `Data type mapping for '${schemaDataType.name}' already registered with storage type '${this.name}'`
    )

    this._dataTypeMap[ schemaDataType.name ] = storageDataType
  }


  addDynamicDataTypeMap(schemaDataTypeDetector, storageDataType) {

    passOrThrow(
      isFunction(schemaDataTypeDetector),
      () => `Provided schemaDataTypeDetector is not a valid function in '${this.name}', ` +
        `got this instead: ${String(schemaDataTypeDetector)}`
    )

    passOrThrow(
      isStorageDataType(storageDataType) || isFunction(storageDataType),
      () => `Provided storageDataType for '${String(schemaDataTypeDetector)}' is not a valid storage data type or function in '${this.name}', ` +
        `got this instead: ${String(storageDataType)}`
    )

    this._dynamicDataTypeMap.push({
      schemaDataTypeDetector,
      storageDataType,
    })
  }



  convertToStorageDataType (schemaDataType) {

    const foundDynamicDataType = this._dynamicDataTypeMap.find(({schemaDataTypeDetector}) => schemaDataTypeDetector(schemaDataType))
    if (foundDynamicDataType) {
      const storageDataType = foundDynamicDataType.storageDataType

      if (isFunction(storageDataType)) {
        const attributeType = schemaDataType
        return storageDataType(attributeType)
      }

      return storageDataType
    }

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


  setStorageInstance (storageInstance) {
    this.storageInstance = storageInstance
  }


  getStorageInstance () {
    passOrThrow(
      this.storageInstance,
      () => `Storage instance not set for storage type '${this.name}'`
    )

    return this.storageInstance
  }


  setStorageModels (storageModels) {
    this.storageModels = storageModels
  }


  getStorageModels () {
    passOrThrow(
      this.storageModels,
      () => `Storage models not set for storage type '${this.name}'`
    )

    return this.storageModels
  }


  toString() {
    return this.name
  }

}


export default StorageType


export const isStorageType = (obj) => {
  return (obj instanceof StorageType)
}
