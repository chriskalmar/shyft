import { passOrThrow, isArray } from '../util';

import { enumValueRegex, ENUM_VALUE_PATTERN } from '../constants';

import DataType from './DataType';

export class DataTypeEnum extends DataType {
  constructor(setup = {}) {
    const { name, description, values } = setup;

    passOrThrow(
      isArray(values, true),
      () => `'Missing enum values for data type '${name}'`,
    );

    values.map(value => {
      passOrThrow(
        enumValueRegex.test(value),
        () =>
          `Invalid enum value '${value}' for data type '${name}' (Regex: /${ENUM_VALUE_PATTERN}/)`,
      );
    });

    super({
      ...setup,
      description: description || `Enumeration set: ${values.join(', ')}`,
      mock() {
        const randomPos = Math.floor(Math.random() * values.length);
        return values[randomPos];
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
