import { passOrThrow, isMap } from '../util';
import { enumValueRegex, ENUM_VALUE_PATTERN } from '../constants';
import { DataType } from './DataType';
import * as _ from 'lodash';

export type ValueType = {
  [key: string]: number;
};

export type DataTypeEnumSetupType = {
  name: string;
  description?: string;
  values: ValueType;
};

export class DataTypeEnum extends DataType {
  values: ValueType;

  constructor(setup: DataTypeEnumSetupType = <DataTypeEnumSetupType>{}) {
    const { name, description, values } = setup;

    passOrThrow(
      isMap(values, true),
      () => `'Missing enum values for data type '${name}'`,
    );

    const valueNames = Object.keys(values);
    const uniqueIds = [];

    valueNames.map(valueName => {
      const valueId = values[valueName];
      uniqueIds.push(valueId);

      passOrThrow(
        enumValueRegex.test(valueName),
        () =>
          `Invalid value name '${valueName}' for data type '${name}' (Regex: /${ENUM_VALUE_PATTERN}/)`,
      );

      passOrThrow(
        valueId === Number(valueId) && valueId > 0,
        () =>
          `Value '${valueName}' for data type '${name}' has an invalid unique ID (needs to be a positive integer)`,
      );
    });

    passOrThrow(
      uniqueIds.length === _.uniq(uniqueIds).length,
      () =>
        `Each value defined for data type '${name}' needs to have a unique ID`,
    );

    super({
      name,
      description: description || `Enumeration set: ${valueNames.join(', ')}`,
      enforceIndex: true,
      mock() {
        const randomPos = Math.floor(Math.random() * uniqueIds.length);
        return uniqueIds[randomPos];
      },
    });

    this.values = values;
  }

  toString() {
    return this.name;
  }
}

export const isDataTypeEnum = obj => {
  return obj instanceof DataTypeEnum;
};
