
import { passOrThrow } from '../util';
import { isDataType } from '../datatype/DataType';
import { isStorageDataType } from './StorageDataType';

class StorageType {

  constructor (setup = {}) {

    const {
      name,
      description,
    } = setup

    passOrThrow(name, () => 'Missing storage type name')
    passOrThrow(description, () => `Missing description for storage type '${name}'`)

    this.name = name
    this.description = description

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


  findOne() {
    throw new Error(`Storage type '${this.name}' needs to implement findOne()`)
  }


  find() {
    throw new Error(`Storage type '${this.name}' needs to implement find()`)
  }


  // filter capabilities
  // sort capabilities
  // ...


  toString() {
    return this.name
  }

}


export default StorageType


export const isStorageType = (obj) => {
  return (obj instanceof StorageType)
}
