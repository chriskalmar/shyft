import { passOrThrow, isFunction } from '../util';

import { isDataType } from '../datatype/DataType';
import { isStorageDataType } from './StorageDataType';
import { isStorageConfiguration } from './StorageConfiguration';

export class StorageType {
  constructor(setup = {}) {
    const {
      name,
      description,
      findOne,
      findOneByValues,
      find,
      count,
      mutate,
      checkLookupPermission,
    } = setup;

    passOrThrow(name, () => 'Missing storage type name');
    passOrThrow(
      description,
      () => `Missing description for storage type '${name}'`,
    );

    passOrThrow(
      isFunction(findOne),
      () => `Storage type '${name}' needs to implement findOne()`,
    );

    passOrThrow(
      isFunction(findOneByValues),
      () => `Storage type '${name}' needs to implement findOneByValues()`,
    );

    passOrThrow(
      isFunction(find),
      () => `Storage type '${name}' needs to implement find()`,
    );

    passOrThrow(
      isFunction(count),
      () => `Storage type '${name}' needs to implement count()`,
    );

    passOrThrow(
      isFunction(mutate),
      () => `Storage type '${name}' needs to implement mutate()`,
    );

    passOrThrow(
      isFunction(checkLookupPermission),
      () => `Storage type '${name}' needs to implement checkLookupPermission()`,
    );

    this.name = name;
    this.description = description;
    this.findOne = findOne;
    this.findOneByValues = findOneByValues;
    this.find = find;
    this.count = count;
    this.mutate = mutate;
    this.checkLookupPermission = checkLookupPermission;

    this._dataTypeMap = {};
    this._dynamicDataTypeMap = [];
  }

  addDataTypeMap(schemaDataType, storageDataType) {
    passOrThrow(
      isDataType(schemaDataType),
      () =>
        `Provided schemaDataType is not a valid data type in '${this.name}', ` +
        `got this instead: ${String(schemaDataType)}`,
    );

    passOrThrow(
      isStorageDataType(storageDataType),
      () =>
        `Provided storageDataType for '${String(
          schemaDataType,
        )}' is not a valid storage data type in '${this.name}', ` +
        `got this instead: ${String(storageDataType)}`,
    );

    passOrThrow(
      !this._dataTypeMap[schemaDataType.name],
      () =>
        `Data type mapping for '${
          schemaDataType.name
        }' already registered with storage type '${this.name}'`,
    );

    this._dataTypeMap[schemaDataType.name] = storageDataType;
  }

  addDynamicDataTypeMap(schemaDataTypeDetector, storageDataType) {
    passOrThrow(
      isFunction(schemaDataTypeDetector),
      () =>
        `Provided schemaDataTypeDetector is not a valid function in '${
          this.name
        }', ` + `got this instead: ${String(schemaDataTypeDetector)}`,
    );

    passOrThrow(
      isStorageDataType(storageDataType) || isFunction(storageDataType),
      () =>
        `Provided storageDataType for '${String(
          schemaDataTypeDetector,
        )}' is not a valid storage data type or function in '${this.name}', ` +
        `got this instead: ${String(storageDataType)}`,
    );

    this._dynamicDataTypeMap.push({
      schemaDataTypeDetector,
      storageDataType,
    });
  }

  convertToStorageDataType(schemaDataType) {
    const foundDynamicDataType = this._dynamicDataTypeMap.find(
      ({ schemaDataTypeDetector }) => schemaDataTypeDetector(schemaDataType),
    );
    if (foundDynamicDataType) {
      const storageDataType = foundDynamicDataType.storageDataType;

      if (isFunction(storageDataType)) {
        const attributeType = schemaDataType;
        return storageDataType(attributeType);
      }

      return storageDataType;
    }

    passOrThrow(
      isDataType(schemaDataType),
      () =>
        `Provided schemaDataType is not a valid data type in storage type '${
          this.name
        }', ` + `got this instead: ${String(schemaDataType)}`,
    );

    passOrThrow(
      this._dataTypeMap[schemaDataType.name],
      () =>
        `No data type mapping found for '${
          schemaDataType.name
        }' in storage type '${this.name}'`,
    );

    return this._dataTypeMap[schemaDataType.name];
  }

  setStorageConfiguration(storageConfiguration) {
    passOrThrow(
      isStorageConfiguration(storageConfiguration),
      () => 'StorageType expects a valid storageConfiguration',
    );

    this.storageConfiguration = storageConfiguration;
  }

  getStorageConfiguration() {
    passOrThrow(
      this.storageConfiguration,
      () => 'StorageType is missing a valid storageConfiguration',
    );

    return this.storageConfiguration;
  }

  getStorageInstance() {
    return this.getStorageConfiguration().getStorageInstance();
  }

  getStorageModels() {
    return this.getStorageConfiguration().getStorageModels();
  }

  toString() {
    return this.name;
  }
}

export const isStorageType = obj => {
  return obj instanceof StorageType;
};
