import { passOrThrow, isMap, isFunction } from '../util';

import {
  viewEntityPropertiesWhitelist,
  ATTRIBUTE_NAME_PATTERN,
  attributeNameRegex,
  viewAttributePropertiesWhitelist,
} from '../constants';

import {
  generatePermissionDescription,
  PermissionMap,
  processViewEntityPermissions,
} from '../permission/Permission';

import { DataType, isDataType, DataTypeFunction } from '../datatype/DataType';
import { isStorageType, StorageType } from '../storage/StorageType';
import { StorageTypeNull } from '../storage/StorageTypeNull';
import { isComplexDataType } from '../datatype/ComplexDataType';

import {
  Attribute,
  AttributesMap,
  AttributesSetupMap,
  AttributesMapGenerator,
} from '../attribute/Attribute';
import { PreFilterMap, processPreFilters } from '../filter';
import { Context } from '../context/Context';
import { GraphQLResolveInfo } from 'graphql';
import { Entity } from './Entity';

interface ViewEntityPreProcessorResponse {
  args?: {
    [key: string]: unknown;
  };
  context?: Context;
}

export type ViewEntityPreProcessor = (params: {
  entity?: ViewEntity;
  source?: any;
  args?: { [key: string]: unknown };
  context?: Context;
  info?: GraphQLResolveInfo;
}) => ViewEntityPreProcessorResponse | Promise<ViewEntityPreProcessorResponse>;

export type ViewEntityPostProcessor = (params: {
  result?: { [key: string]: unknown };
  entity?: ViewEntity;
  source?: any;
  args?: { [key: string]: unknown };
  context?: Context;
  info?: GraphQLResolveInfo;
}) => { [key: string]: unknown };

export interface ViewEntitySetup {
  name: string;
  description: string;
  attributes?: AttributesSetupMap | AttributesMapGenerator;
  storageType?: StorageType;
  viewExpression: any;
  permissions?: PermissionMap;
  preProcessor?: ViewEntityPreProcessor;
  postProcessor?: ViewEntityPostProcessor;
  preFilters?: PreFilterMap | (() => PreFilterMap);
  meta?: any;
}

export class ViewEntity {
  name: string;
  storageTableName: string;
  description: string;
  storageType?: StorageType;
  viewExpression: any;
  permissions?: PermissionMap;
  preProcessor?: ViewEntityPreProcessor;
  postProcessor?: ViewEntityPostProcessor;
  preFilters?: PreFilterMap;
  meta?: any;
  private readonly _attributesMap: AttributesSetupMap | AttributesMapGenerator;
  private _primaryAttribute: Attribute;
  private _permissions: PermissionMap | ((...args) => any);
  private _defaultPermissions: PermissionMap;
  private _attributes: AttributesMap;
  descriptionPermissionsFind: string | boolean;
  descriptionPermissionsRead: string | boolean;
  private _preFilters: PreFilterMap | (() => PreFilterMap);
  isFallbackStorageType: any;
  findOne: (...arg) => any;
  find: (...args) => any;

  constructor(setup: ViewEntitySetup) {
    passOrThrow(isMap(setup), () => 'ViewEntity requires a setup object');

    const {
      name,
      description,
      attributes,
      storageType,
      viewExpression,
      permissions,
      preProcessor,
      postProcessor,
      preFilters,
      meta,
    } = setup;

    Object.keys(setup).map((prop) => {
      passOrThrow(
        viewEntityPropertiesWhitelist.includes(prop),
        () => `Invalid setup property '${prop}' in view entity '${name}'`,
      );
    });

    passOrThrow(name, () => 'Missing view entity name');
    passOrThrow(
      description,
      () => `Missing description for view entity '${name}'`,
    );

    passOrThrow(
      isMap(attributes) || isFunction(attributes),
      () =>
        `'attributes' for view entity '${name}' needs to be a map of attributes or a function returning a map of attributes`,
    );

    passOrThrow(
      viewExpression,
      () => `Missing viewExpression for view entity '${name}'`,
    );

    this.name = name;
    this.description = description;
    this._attributesMap = attributes;
    this._primaryAttribute = null;
    this.viewExpression = viewExpression;
    this._permissions = permissions;
    this._preFilters = preFilters;
    this.meta = meta;

    if (preProcessor) {
      passOrThrow(
        isFunction(preProcessor),
        () =>
          `preProcessor of view entity '${name}' needs to be a valid function`,
      );

      this.preProcessor = preProcessor;
    }

    if (postProcessor) {
      passOrThrow(
        isFunction(postProcessor),
        () =>
          `postProcessor of view entity '${name}' needs to be a valid function`,
      );

      this.postProcessor = postProcessor;
    }

    if (storageType) {
      passOrThrow(
        isStorageType(storageType),
        () =>
          `ViewEntity '${name}' needs a valid storage type (defaults to 'StorageTypeNull')`,
      );
    } else {
      this.storageType = StorageTypeNull;
      this.isFallbackStorageType = true;
      this._exposeStorageAccess();
    }
  }

  _injectStorageTypeBySchema(storageType: StorageType): void {
    passOrThrow(
      isStorageType(storageType),
      () => `Provided storage type to view entity '${this.name}' is invalid`,
    );

    if (this.isFallbackStorageType) {
      this.storageType = storageType;
      this._exposeStorageAccess();
    }
  }

  _exposeStorageAccess(): void {
    this.findOne = this.storageType.findOne;
    this.find = this.storageType.find;
  }

  _injectDefaultPermissionsBySchema(defaultPermissions): void {
    passOrThrow(
      isMap(defaultPermissions),
      () => 'Provided defaultPermissions is invalid',
    );

    if (!this._permissions) {
      this._permissions = {};
    }

    this._defaultPermissions = defaultPermissions;
  }

  getAttributes() {
    if (this._attributes) {
      return this._attributes;
    }

    const ret = (this._attributes = this._processAttributeMap());
    return ret;
  }

  _processAttribute(rawAttribute, attributeName) {
    passOrThrow(
      attributeNameRegex.test(attributeName),
      () =>
        `Invalid attribute name '${attributeName}' in view entity '${this.name}' (Regex: /${ATTRIBUTE_NAME_PATTERN}/)`,
    );

    Object.keys(rawAttribute).map((prop) => {
      passOrThrow(
        viewAttributePropertiesWhitelist.includes(prop),
        () =>
          `Invalid attribute property '${prop}' in view entity '${this.name}' (use 'meta' for custom data)`,
      );
    });

    const attribute: Attribute = {
      ...rawAttribute,
      primary: !!rawAttribute.primary,
      required: !!rawAttribute.required || !!rawAttribute.primary,
      hidden: !!rawAttribute.hidden,
      name: attributeName,
    };

    passOrThrow(
      attribute.description,
      () => `Missing description for '${this.name}.${attributeName}'`,
    );

    if (isFunction(attribute.type)) {
      const dataTypeBuilder: DataTypeFunction =
        attribute.type as DataTypeFunction;
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
        attribute.type instanceof ViewEntity,
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
        (attribute.type as ViewEntity).referenceAttribute(targetAttribute.name);
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

  _processAttributeMap() {
    // if it's a function, resolve it to get that map
    const attributeMap =
      typeof this._attributesMap === 'object'
        ? { ...this._attributesMap }
        : this._attributesMap();

    passOrThrow(
      isMap(attributeMap),
      () =>
        `Attribute definition function for view entity '${this.name}' does not return a map`,
    );

    const attributeNames = Object.keys(attributeMap);
    passOrThrow(
      attributeNames.length > 0,
      () => `ViewEntity '${this.name}' has no attributes defined`,
    );

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

  _processPermissions(): PermissionMap | null {
    if (this._permissions) {
      let permissions: PermissionMap;

      if (typeof this._permissions === 'function') {
        permissions = this._permissions();
      } else {
        permissions = this._permissions;
      }

      return processViewEntityPermissions(
        this,
        permissions,
        this._defaultPermissions,
      );
    } else if (this._defaultPermissions) {
      return processViewEntityPermissions(this, {}, this._defaultPermissions);
    }

    return null;
  }

  _generatePermissionDescriptions() {
    if (this.permissions) {
      if (this.permissions.find) {
        this.descriptionPermissionsFind = generatePermissionDescription(
          this.permissions.find,
        );
      }

      if (this.permissions.read) {
        this.descriptionPermissionsRead = generatePermissionDescription(
          this.permissions.read,
        );
      }
    }
  }

  _processPreFilters(preFilters?: PreFilterMap): PreFilterMap {
    return preFilters ? processPreFilters(this, preFilters) : null;
  }

  getPreFilters() {
    if (this.preFilters) {
      return this.preFilters;
    }

    if (typeof this._preFilters === 'function') {
      this._preFilters = this._preFilters();
    }

    this.preFilters = this._processPreFilters(this._preFilters);
    return this.preFilters;
  }

  getPermissions() {
    if (!this._permissions && this._defaultPermissions) {
      return this.permissions;
    }

    this.permissions = this._processPermissions();
    this._generatePermissionDescriptions();
    return this.permissions;
  }

  getStorageType() {
    return this.storageType;
  }

  toString() {
    return this.name;
  }
}

export const isViewEntity = (obj: unknown): obj is ViewEntity => {
  return obj instanceof ViewEntity;
};
