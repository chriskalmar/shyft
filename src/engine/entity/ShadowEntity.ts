import { passOrThrow, isMap, isFunction } from '../util';

import {
  shadowEntityPropertiesWhitelist,
  ATTRIBUTE_NAME_PATTERN,
  attributeNameRegex,
  shadowEntityAttributePropertiesWhitelist,
} from '../constants';

import { DataType, isDataType, DataTypeFunction } from '../datatype/DataType';
import { isStorageType } from '../storage/StorageType';
import { StorageTypeNull } from '../storage/StorageTypeNull';
import { isComplexDataType } from '../datatype/ComplexDataType';

import {
  Attribute,
  AttributesMap,
  AttributesSetupMap,
  AttributesMapGenerator,
} from '../attribute/Attribute';
import { Entity } from './Entity';

import { systemAttributePrimary } from './systemAttributes';

export type ShadowEntitySetup = {
  name: string;
  isUserEntity?: boolean;
  attributes?: AttributesSetupMap | AttributesMapGenerator;
  storageType?: any;
  meta?: any;
};

export class ShadowEntity {
  name: string;
  storageType?: any;
  isUserEntity?: boolean;
  meta?: any;
  private _attributesMap: AttributesSetupMap | AttributesMapGenerator;
  private _primaryAttribute: Attribute;
  private referencedByEntities: any;
  private _attributes: AttributesMap;
  isFallbackStorageType: any;

  constructor(setup: ShadowEntitySetup) {
    passOrThrow(isMap(setup), () => 'ShadowEntity requires a setup object');

    const { name, attributes, storageType, isUserEntity, meta } = setup;

    Object.keys(setup).map((prop) => {
      passOrThrow(
        shadowEntityPropertiesWhitelist.includes(prop),
        () => `Invalid setup property '${prop}' in shadow entity '${name}'`,
      );
    });

    passOrThrow(name, () => 'Missing shadow entity name');

    if (attributes) {
      passOrThrow(
        isMap(attributes) || isFunction(attributes),
        () =>
          `'attributes' for shadow entity '${name}' needs to be a map of attributes or a function returning a map of attributes`,
      );
    }

    this.name = name;
    this.isUserEntity = !!isUserEntity;
    this._attributesMap = attributes || (() => ({}));

    this._primaryAttribute = null;
    this.referencedByEntities = [];
    this.meta = meta;

    if (storageType) {
      passOrThrow(
        isStorageType(storageType),
        () =>
          `ShadowEntity '${name}' needs a valid storage type (defaults to 'StorageTypeNull')`,
      );
    } else {
      this.storageType = StorageTypeNull;
      this.isFallbackStorageType = true;
    }
  }

  _injectStorageTypeBySchema(storageType) {
    passOrThrow(
      isStorageType(storageType),
      () => `Provided storage type to shadow entity '${this.name}' is invalid`,
    );

    if (this.isFallbackStorageType) {
      this.storageType = storageType;
    }
  }

  getAttributes() {
    if (this._attributes) {
      return this._attributes;
    }

    const ret = (this._attributes = this._processAttributeMap());
    return ret;
  }

  _checkSystemAttributeNameCollision(attributeMap, attributeName) {
    passOrThrow(
      !attributeMap[attributeName],
      () =>
        `Attribute name collision with system attribute '${attributeName}' in entity '${this.name}'`,
    );
  }

  _processAttribute(rawAttribute, attributeName) {
    passOrThrow(
      attributeNameRegex.test(attributeName),
      () =>
        `Invalid attribute name '${attributeName}' in shadow entity '${this.name}' (Regex: /${ATTRIBUTE_NAME_PATTERN}/)`,
    );

    Object.keys(rawAttribute).map((prop) => {
      passOrThrow(
        shadowEntityAttributePropertiesWhitelist.includes(prop),
        () =>
          `Invalid attribute property '${prop}' in shadow entity '${this.name}' (use 'meta' for custom data)`,
      );
    });

    const attribute: Attribute = {
      ...rawAttribute,
      primary: !!rawAttribute.primary,
      required: !!rawAttribute.required || !!rawAttribute.primary,
      hidden: !!rawAttribute.hidden,
      name: attributeName,
    };

    if (isFunction(attribute.type)) {
      const dataTypeBuilder: DataTypeFunction = attribute.type as DataTypeFunction;
      attribute.type = dataTypeBuilder({
        setup: attribute as unknown,
        entity: this,
      });
    }

    passOrThrow(
      isDataType(attribute.type) ||
        attribute.type instanceof Entity ||
        isComplexDataType(attribute.type),
      () =>
        `'${this.name}.${attributeName}' has invalid data type '${String(
          attribute.type,
        )}'`,
    );

    if (isDataType(attribute.type)) {
      const attributeType = attribute.type as DataType;

      if (attributeType.enforceRequired) {
        attribute.required = true;
      }
    }

    if (attribute.targetAttributesMap) {
      passOrThrow(
        attribute.type instanceof ShadowEntity,
        () =>
          `'${this.name}.${attributeName}' cannot have a targetAttributesMap as it is not a reference`,
      );

      passOrThrow(
        isMap(attribute.targetAttributesMap),
        () =>
          `targetAttributesMap for '${this.name}.${attributeName}' needs to be a map`,
      );

      const localAttributeNames = Object.keys(attribute.targetAttributesMap);
      localAttributeNames.map((localAttributeName) => {
        const targetAttribute =
          attribute.targetAttributesMap[localAttributeName];

        passOrThrow(
          isMap(targetAttribute) &&
            targetAttribute.name &&
            targetAttribute.type,
          () =>
            `targetAttributesMap for '${this.name}.${attributeName}' needs to be a map between local and target attributes`,
        );

        // check if attribute is found in target entity
        (attribute.type as ShadowEntity).referenceAttribute(
          targetAttribute.name,
        );
      });
    }

    if (attribute.primary) {
      passOrThrow(
        !this._primaryAttribute,
        () =>
          `'${this.name}.${attributeName}' cannot be set as primary attribute,` +
          `'${this._primaryAttribute.name}' is already the primary attribute`,
      );

      passOrThrow(
        isDataType(attribute.type),
        () =>
          `Primary attribute '${
            this.name
          }.${attributeName}' has invalid data type '${String(
            attribute.type,
          )}'`,
      );

      attribute.isSystemAttribute = true;
      this._primaryAttribute = attribute;
    }

    passOrThrow(
      !attribute.resolve || isFunction(attribute.resolve),
      () => `'${this.name}.${attributeName}' has an invalid resolve function'`,
    );

    passOrThrow(
      !attribute.validate || isFunction(attribute.validate),
      () => `'${this.name}.${attributeName}' has an invalid validate function'`,
    );

    passOrThrow(
      !attribute.serialize || isFunction(attribute.serialize),
      () =>
        `'${this.name}.${attributeName}' has an invalid serialize function'`,
    );

    return attribute;
  }

  _collectSystemAttributes(attributeMap) {
    const list = [];

    if (!this.getPrimaryAttribute()) {
      const { name } = systemAttributePrimary;
      this._checkSystemAttributeNameCollision(attributeMap, name);
      attributeMap[name] = systemAttributePrimary;
      list.push(name);
    }

    return list;
  }

  _processAttributeMap() {
    // if it's a function, resolve it to get that map
    const attributeMap =
      typeof this._attributesMap === 'object'
        ? { ...this._attributesMap }
        : this._attributesMap();

    passOrThrow(
      isMap(attributeMap),
      () =>
        `Attribute definition function for shadow entity '${this.name}' does not return a map`,
    );

    const attributeNames = Object.keys(attributeMap);

    const resultAttributes = {};

    attributeNames.forEach((attributeName) => {
      resultAttributes[attributeName] = this._processAttribute(
        attributeMap[attributeName],
        attributeName,
      );
    });

    attributeNames.forEach((attributeName) => {
      const attribute = resultAttributes[attributeName];

      if (attribute.targetAttributesMap) {
        const localAttributeNames = Object.keys(attribute.targetAttributesMap);
        localAttributeNames.map((localAttributeName) => {
          passOrThrow(
            resultAttributes[localAttributeName],
            () =>
              `Unknown local attribute '${localAttributeName}' used in targetAttributesMap ` +
              `for '${this.name}.${attributeName}'`,
          );
        });
      }
    });

    const systemAttributeNames = this._collectSystemAttributes(attributeMap);

    systemAttributeNames.forEach((attributeName) => {
      resultAttributes[attributeName] = this._processAttribute(
        attributeMap[attributeName],
        attributeName,
      );
      resultAttributes[attributeName].isSystemAttribute = true;
    });

    const rankedResultAttributes = {};

    Object.keys(resultAttributes).map((attributeName) => {
      const attribute = resultAttributes[attributeName];
      if (attribute.primary) {
        rankedResultAttributes[attributeName] = attribute;
      }
    });
    Object.keys(resultAttributes).map((attributeName) => {
      const attribute = resultAttributes[attributeName];
      if (!attribute.primary) {
        rankedResultAttributes[attributeName] = attribute;
      }
    });

    return rankedResultAttributes;
  }

  getPrimaryAttribute() {
    return this._primaryAttribute;
  }

  referenceAttribute(attributeName) {
    const attributes = this.getAttributes();

    passOrThrow(
      attributes[attributeName],
      () =>
        `Cannot reference attribute '${this.name}.${attributeName}' as it does not exist`,
    );

    return attributes[attributeName];
  }

  getStorageType() {
    return this.storageType;
  }

  toString() {
    return this.name;
  }
}

export const isShadowEntity = (obj: unknown): obj is ShadowEntity => {
  return obj instanceof ShadowEntity;
};
