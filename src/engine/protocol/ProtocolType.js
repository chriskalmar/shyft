import { passOrThrow, isFunction } from '../util';

import { isDataType } from '../datatype/DataType';
import { isProtocolConfiguration } from './ProtocolConfiguration';

export class ProtocolType {
  constructor(setup = {}) {
    const { name, description, isProtocolDataType } = setup;

    passOrThrow(name, () => 'Missing protocol type name');
    passOrThrow(
      description,
      () => `Missing description for protocol type '${name}'`,
    );

    passOrThrow(
      isFunction(isProtocolDataType),
      () => `Protocol type '${name}' needs to implement isProtocolDataType()`,
    );

    this.name = name;
    this.description = description;
    this.isProtocolDataType = isProtocolDataType;

    this._dataTypeMap = {};
    this._dynamicDataTypeMap = [];
  }

  addDataTypeMap(schemaDataType, protocolDataType) {
    passOrThrow(
      isDataType(schemaDataType),
      () =>
        `Provided schemaDataType is not a valid data type in '${this.name}'`,
    );

    passOrThrow(
      this.isProtocolDataType(protocolDataType),
      () =>
        `Provided protocolDataType for '${String(
          schemaDataType,
        )}' is not a valid protocol data type in '${this.name}'`,
    );

    passOrThrow(
      !this._dataTypeMap[schemaDataType.name],
      () =>
        `Data type mapping for '${schemaDataType.name}' already registered with protocol type '${this.name}'`,
    );

    this._dataTypeMap[schemaDataType.name] = protocolDataType;
  }

  addDynamicDataTypeMap(schemaDataTypeDetector, protocolDataType) {
    passOrThrow(
      isFunction(schemaDataTypeDetector),
      () =>
        `Provided schemaDataTypeDetector is not a valid function in '${this.name}', ` +
        `got this instead: ${String(schemaDataTypeDetector)}`,
    );

    passOrThrow(
      this.isProtocolDataType(protocolDataType) || isFunction(protocolDataType),
      () =>
        `Provided protocolDataType for '${String(
          schemaDataTypeDetector,
        )}' is not a valid protocol data type or function in '${this.name}', ` +
        `got this instead: ${String(protocolDataType)}`,
    );

    this._dynamicDataTypeMap.push({
      schemaDataTypeDetector,
      protocolDataType,
    });
  }

  convertToProtocolDataType(schemaDataType, sourceName, asInput) {
    const foundDynamicDataType = this._dynamicDataTypeMap.find(
      ({ schemaDataTypeDetector }) => schemaDataTypeDetector(schemaDataType),
    );
    if (foundDynamicDataType) {
      const protocolDataType = foundDynamicDataType.protocolDataType;

      if (isFunction(protocolDataType)) {
        const attributeType = schemaDataType;
        return protocolDataType(attributeType, sourceName, asInput);
      }

      return protocolDataType;
    }

    passOrThrow(
      isDataType(schemaDataType),
      () =>
        `Provided schemaDataType is not a valid data type in protocol type '${this.name}'`,
    );

    passOrThrow(
      this._dataTypeMap[schemaDataType.name],
      () =>
        `No data type mapping found for '${schemaDataType.name}' in protocol type '${this.name}'`,
    );

    return this._dataTypeMap[schemaDataType.name];
  }

  setProtocolConfiguration(protocolConfiguration) {
    passOrThrow(
      isProtocolConfiguration(protocolConfiguration),
      () => 'ProtocolType expects a valid protocolConfiguration',
    );

    this.protocolConfiguration = protocolConfiguration;
  }

  getProtocolConfiguration() {
    passOrThrow(
      this.protocolConfiguration,
      () => 'ProtocolType is missing a valid protocolConfiguration',
    );

    return this.protocolConfiguration;
  }

  toString() {
    return this.name;
  }
}

export const isProtocolType = obj => {
  return obj instanceof ProtocolType;
};
