import { passOrThrow, resolveFunctionMap, isMap, isFunction } from '../util';
import { isEntity } from '../entity/Entity';
import { isDataType } from './DataType';
import { ComplexDataType, isComplexDataType } from './ComplexDataType';
import {
  AttributesMap,
  AttributesMapGenerator,
  AttributeBase,
} from '../attribute/Attribute';

export type ObjectDataTypeSetupType = {
  name: string;
  description: string;
  attributes: AttributesMap | AttributesMapGenerator;
};

export class ObjectDataType extends ComplexDataType {
  name: string;
  description: string;
  attributes: AttributesMap;
  _attributesMap: AttributesMap | AttributesMapGenerator;
  _attributes: AttributesMap;

  constructor(setup: ObjectDataTypeSetupType = {} as ObjectDataTypeSetupType) {
    // constructor(setup: ObjectDataTypeSetupType = <ObjectDataTypeSetupType>{}) {
    super();

    const { name, description, attributes } = setup;

    passOrThrow(name, () => 'Missing object data type name');
    passOrThrow(
      description,
      () => `Missing description for object data type '${name}'`,
    );
    passOrThrow(
      attributes,
      () => `Missing attributes for object data type '${name}'`,
    );

    passOrThrow(
      isMap(attributes) || isFunction(attributes),
      () =>
        `Object data type '${name}' needs an attribute definition as a map or a function returning such a map`,
    );

    this.name = name;
    this.description = description;
    this._attributesMap = attributes;
  }

  getAttributes(): AttributesMap {
    if (this._attributes) {
      return this._attributes;
    }

    const ret = (this._attributes = this._processAttributeMap());
    return ret;
  }

  _processAttribute(
    rawAttribute: AttributeBase,
    attributeName: string,
  ): AttributeBase {
    if (isFunction(rawAttribute.type)) {
      const rawAttributeTypeFn = rawAttribute.type as Function;
      rawAttribute.type = rawAttributeTypeFn({
        name: attributeName,
        description: rawAttribute.description,
      });
    }

    const attribute = {
      ...rawAttribute,
      required: !!rawAttribute.required,
      name: attributeName,
    };

    passOrThrow(
      attribute.description,
      () => `Missing description for '${this.name}.${attributeName}'`,
    );

    passOrThrow(
      isDataType(attribute.type) ||
        isComplexDataType(attribute.type) ||
        isEntity(attribute.type),
      () =>
        `'${this.name}.${attributeName}' has invalid data type '${String(
          attribute.type,
        )}'`,
    );

    passOrThrow(
      !attribute.resolve || isFunction(attribute.resolve),
      () => `'${this.name}.${attributeName}' has an invalid resolve function'`,
    );

    if (attribute.defaultValue) {
      // enforce mandatory param if defaultValue provided
      attribute.required = true;

      passOrThrow(
        isFunction(attribute.defaultValue),
        () =>
          `'${this.name}.${attributeName}' has an invalid defaultValue function'`,
      );

      passOrThrow(
        !isComplexDataType(attribute.type),
        () =>
          `Complex data type '${this.name}.${attributeName}' cannot have a defaultValue function'`,
      );
    }

    passOrThrow(
      !attribute.validate || isFunction(attribute.validate),
      () => `'${this.name}.${attributeName}' has an invalid validate function'`,
    );

    return attribute;
  }

  _processAttributeMap(): AttributesMap {
    // if it's a function, resolve it to get that map
    const attributeMap = resolveFunctionMap(this._attributesMap);

    passOrThrow(
      isMap(attributeMap),
      () =>
        `Attribute definition function for object data type '${this.name}' does not return a map`,
    );

    const attributeNames = Object.keys(attributeMap);
    passOrThrow(
      attributeNames.length > 0,
      () => `Object data type '${this.name}' has no attributes defined`,
    );

    const resultAttributes = {};

    attributeNames.forEach((attributeName) => {
      resultAttributes[attributeName] = this._processAttribute(
        attributeMap[attributeName],
        attributeName,
      );
    });

    return resultAttributes;
  }

  validate = (value: any): void => {
    if (value) {
      passOrThrow(
        isMap(value),
        () => `Object data type '${this.name}' expects an object`,
      );
    }
  };

  toString(): string {
    return this.name;
  }
}

export const isObjectDataType = (obj: any): boolean => {
  return obj instanceof ObjectDataType;
};

export const buildObjectDataType = (obj: {
  // attributes: AttributesMap | AttributesMapGenerator | AttributeBase;
  attributes: any;
}): Function => {
  return ({ name, description }): ObjectDataType =>
    new ObjectDataType({
      description,
      ...obj,
      name,
    });
};
