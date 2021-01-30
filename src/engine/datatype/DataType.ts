import { Source } from 'graphql';
import { Entity, ShadowEntity, ViewEntity } from '../..';
import { Context } from '../context/Context';
import { passOrThrow, isFunction } from '../util';
import { ComplexDataType } from './ComplexDataType';

export type DataTypeValidateType = (params: {
  value?: unknown;
  source?: Source;
  context?: Context;
}) => void | Promise<void>;

export type DataTypeSetup = {
  name?: string;
  description?: string;
  mock?: () => any;
  validate?: DataTypeValidateType;
  enforceRequired?: boolean;
  defaultValue?: () => any;
  enforceIndex?: boolean;
};

export type DataTypeFunction = (params: {
  setup: DataTypeSetup;
  entity?: Entity | ShadowEntity | ViewEntity;
}) => DataType | ComplexDataType;

export class DataType {
  name: string;
  description: string;
  mock?: () => any;
  validate?: DataTypeValidateType;
  enforceRequired?: boolean;
  defaultValue?: () => any;
  enforceIndex?: boolean;

  constructor(setup: DataTypeSetup = {} as DataTypeSetup) {
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

      this.validate = validate;
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

  toString(): string {
    return this.name;
  }
}

export const isDataType = (obj: unknown): obj is DataType => {
  return obj instanceof DataType;
};
