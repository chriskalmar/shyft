import { passOrThrow, isFunction } from '../util';

export type DataTypeSetupType = {
  name: string;
  description: string;
  mock?: () => any;
  validate?: () => any;
  enforceRequired?: boolean;
  defaultValue?: () => any;
  enforceIndex?: boolean;
};

export class DataType {
  name: string;
  description: string;
  mock?: () => any;
  validator?: (value: any, context: any) => any;
  enforceRequired?: boolean;
  defaultValue?: () => any;
  enforceIndex?: boolean;

  constructor(setup: DataTypeSetupType = <DataTypeSetupType>{}) {
    const {
      name,
      description,
      mock,
      validate,
      enforceRequired,
      defaultValue,
      enforceIndex,
    } = setup;

    passOrThrow(name, () => 'Missing data type name');
    passOrThrow(
      description,
      () => `Missing description for data type '${name}'`,
    );

    passOrThrow(
      isFunction(mock),
      () => `'Missing mock function for data type '${name}'`,
    );

    if (validate) {
      passOrThrow(
        isFunction(validate),
        () => `'Invalid validate function for data type '${name}'`,
      );

      this.validator = validate;
    }

    if (defaultValue) {
      passOrThrow(
        isFunction(defaultValue),
        () => `'Invalid defaultValue function for data type '${name}'`,
      );

      this.defaultValue = defaultValue;
    }

    this.name = name;
    this.description = description;
    this.mock = mock;

    if (enforceRequired) {
      this.enforceRequired = enforceRequired;
    }

    if (enforceIndex) {
      this.enforceIndex = enforceIndex;
    }
  }

  validate = (value, context) => {
    if (value && this.validator) {
      this.validator(value, context);
    }
  };

  toString() {
    return this.name;
  }
}

export const isDataType = obj => {
  return obj instanceof DataType;
};
