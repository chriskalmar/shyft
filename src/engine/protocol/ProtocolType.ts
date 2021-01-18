/* eslint-disable @typescript-eslint/no-explicit-any */

import { passOrThrow, isFunction } from '../util';

import { DataType, DataTypeFunction, isDataType } from '../datatype/DataType';
import {
  ProtocolConfiguration,
  isProtocolConfiguration,
} from './ProtocolConfiguration';
import { ComplexDataType } from '../..';
import { isComplexDataType } from '../datatype/ComplexDataType';

export type ProtocolTypeSetup = {
  name?: string;
  description?: string;
  // isProtocolDataType?: Function;
  isProtocolDataType?: (protocolDataType: any) => boolean;
};

// export interface ProtocolDataTypeFunction {
//   schemaDataType: DataType;
//   attribute: string;
//   asInput?: boolean;
// }

// how to properly define this type ?
export type ProtocolDataType = {
  name: string | Function;
};

type DataTypeMap = {
  [name: string]: ProtocolDataType;
};

type DynamicDataTypeMap = {
  schemaDataTypeDetector: Function;
  protocolDataType: ProtocolDataType;
};

export class ProtocolType {
  name: string;
  description: string;
  isProtocolDataType: (protocolDataType: any) => boolean;
  protocolConfiguration: ProtocolConfiguration;

  private _dataTypeMap: DataTypeMap;
  private _dynamicDataTypeMap: DynamicDataTypeMap[];

  constructor(setup: ProtocolTypeSetup = {} as ProtocolTypeSetup) {
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

  addDataTypeMap(
    schemaDataType: DataType | DataTypeFunction,
    protocolDataType: ProtocolDataType,
  ): void {
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

  addDynamicDataTypeMap(
    schemaDataTypeDetector: Function,
    protocolDataType: any,
    // protocolDataType: ProtocolType,
  ): void {
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

  convertToProtocolDataType(
    schemaDataType: DataType | ComplexDataType | DataTypeFunction,
    sourceName?: string,
    asInput?: boolean,
  ): any {
    const foundDynamicDataType = this._dynamicDataTypeMap.find(
      ({ schemaDataTypeDetector }) => schemaDataTypeDetector(schemaDataType),
    );
    if (foundDynamicDataType) {
      const protocolDataType = foundDynamicDataType.protocolDataType;

      if (isFunction(protocolDataType)) {
        const attributeType = schemaDataType;
        const protocolDataTypeFn = protocolDataType as Function;
        return protocolDataTypeFn(attributeType, sourceName, asInput);
      }

      return protocolDataType;
    }

    if (isDataType(schemaDataType)) {
      passOrThrow(
        this._dataTypeMap[schemaDataType.name],
        () =>
          `No data type mapping found for '${schemaDataType.name}' in protocol type '${this.name}'`,
      );

      return this._dataTypeMap[schemaDataType.name];
    }

    throw new Error(
      `Provided schemaDataType is not a valid data type in protocol type '${this.name}'`,
    );
  }

  setProtocolConfiguration(protocolConfiguration): void {
    passOrThrow(
      isProtocolConfiguration(protocolConfiguration),
      () => 'ProtocolType expects a valid protocolConfiguration',
    );

    this.protocolConfiguration = protocolConfiguration;
  }

  getProtocolConfiguration(): ProtocolConfiguration {
    passOrThrow(
      this.protocolConfiguration,
      () => 'ProtocolType is missing a valid protocolConfiguration',
    );

    return this.protocolConfiguration;
  }

  toString(): string {
    return this.name;
  }
}

export const isProtocolType = (obj: unknown): obj is ProtocolType => {
  return obj instanceof ProtocolType;
};
