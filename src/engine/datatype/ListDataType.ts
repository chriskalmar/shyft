import { passOrThrow, isFunction, isArray } from '../util';
import { Entity, isEntity } from '../entity/Entity';
import {
  DataType,
  isDataType,
  DataTypeFunction,
  DataTypeValidateType,
} from './DataType';
import { ComplexDataType, isComplexDataType } from './ComplexDataType';

export type ListDataTypeSetupType = {
  name: string;
  description: string;
  itemType: Entity | ComplexDataType | DataTypeFunction;
  minItems?: number;
  maxItems?: number;
};

export class ListDataType extends ComplexDataType {
  name: string;
  description: string;
  itemType: Entity | ComplexDataType | DataTypeFunction;
  _itemType: DataType | ComplexDataType;
  minItems?: number;
  maxItems?: number;

  constructor(setup: ListDataTypeSetupType = {} as ListDataTypeSetupType) {
    super();

    const { name, description, itemType, minItems, maxItems } = setup;

    passOrThrow(name, () => 'Missing list data type name');
    passOrThrow(
      description,
      () => `Missing description for list data type '${name}'`,
    );
    passOrThrow(
      itemType,
      () => `Missing item type for list data type '${name}'`,
    );

    passOrThrow(
      isDataType(itemType) ||
        isEntity(itemType) ||
        isComplexDataType(itemType) ||
        isFunction(itemType),
      () =>
        `List data type '${name}' has invalid item type '${String(itemType)}'`,
    );

    const _minItems = minItems || 0;
    const _maxItems = maxItems || 0;

    if (_minItems) {
      passOrThrow(
        Number.isInteger(_minItems) && _minItems >= 0,
        () =>
          `List data type '${name}' has invalid minItems setting '${_minItems}'`,
      );
    }

    if (_maxItems) {
      passOrThrow(
        Number.isInteger(_maxItems) && _maxItems >= 0,
        () =>
          `List data type '${name}' has invalid maxItems setting '${_maxItems}'`,
      );
    }

    passOrThrow(
      _minItems <= _maxItems || _maxItems === 0,
      () =>
        `List data type '${name}' has a bigger minItems than the maxItems setting`,
    );

    this.name = name;
    this.description = description;
    this.itemType = itemType;
    this.minItems = _minItems;
    this.maxItems = _maxItems;
  }

  _processItemType(): DataType | ComplexDataType {
    if (isFunction(this.itemType)) {
      const itemTypeBuilder: DataTypeFunction = this
        .itemType as DataTypeFunction;
      const itemType = itemTypeBuilder({
        setup: {
          name: this.name,
          description: this.description,
        },
      });

      passOrThrow(
        isDataType(itemType) ||
          isEntity(itemType) ||
          isComplexDataType(itemType),
        () =>
          `List data type '${
            this.name
          }' has invalid dynamic item type '${String(itemType)}'`,
      );

      return itemType;
    }

    return this.itemType;
  }

  getItemType(): DataType | ComplexDataType {
    if (this._itemType) {
      return this._itemType;
    }

    const ret = (this._itemType = this._processItemType());
    return ret;
  }

  validate: DataTypeValidateType = ({ value }) => {
    if (value) {
      if (!isArray(value)) {
        throw new Error(
          `List data type '${this.name}' expects an array of items`,
        );
      }

      if (value.length < this.minItems) {
        throw new Error(
          `List data type '${this.name}' requires a minimum of ${this.minItems} items`,
        );
      }

      if (this.maxItems !== 0 && value.length > this.maxItems) {
        throw new Error(
          `List data type '${this.name}' requires a maximum of ${this.maxItems} items`,
        );
      }
    }
  };

  toString(): string {
    return this.name;
  }
}

export const isListDataType = (obj: unknown): obj is ListDataType => {
  return obj instanceof ListDataType;
};

export const buildListDataType = (obj: {
  itemType: Entity | DataType | ComplexDataType | DataTypeFunction;
}): DataTypeFunction => {
  return ({ setup: { name, description } }): ListDataType =>
    new ListDataType({
      description,
      ...obj,
      name,
    });
};
