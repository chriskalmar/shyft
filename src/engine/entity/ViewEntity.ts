import { passOrThrow, isMap, isFunction } from '../util';

import {
  viewEntityPropertiesWhitelist,
  ATTRIBUTE_NAME_PATTERN,
  attributeNameRegex,
  viewAttributePropertiesWhitelist,
} from '../constants';


import {
  generatePermissionDescription,
  processViewEntityPermissions,
} from '../permission/Permission';

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
import { processPreFilters } from '../filter';
import { Entity } from './Entity';

type PreFilterType = {
  [key: string]: {
    resolve: Function;
    attributes: any;
  };
};

type PreFilterGeneratorType = () => PreFilterType;

export type ViewEntitySetup = {
  name: string;
  description: string;
  attributes?: AttributesSetupMap;
  attributesGenerator?: AttributesMapGenerator;
  storageType?: any;
  viewExpression?: any;
  permissions?: any;
  postProcessor?: Function;
  preFilters?: PreFilterType;
  preFiltersGenerator?: PreFilterGeneratorType;
  meta?: any;
};

export class ViewEntity {
  name: string;
  description: string;
  storageType?: any;
  viewExpression?: any;
  permissions?: any;
  postProcessor?: Function;
  preFilters?: PreFilterType;
  meta?: any;
  private _attributesMap: AttributesSetupMap;
  private _attributesGenerator: AttributesMapGenerator;
  private referencedByEntities: any;
  private _permissions: any;
  private _defaultPermissions: any;
  private _attributes: AttributesMap;
  private descriptionPermissionsFind: any;
  private descriptionPermissionsRead: any;
  private _preFilters: PreFilterType;
  private _preFiltersGenerator: () => PreFilterType;
  isFallbackStorageType: any;
  findOne: any;
  find: any;

  constructor(setup: ViewEntitySetup) {
    passOrThrow(isMap(setup), () => 'ViewEntity requires a setup object');

    const {
      name,
      description,
      attributes,
      attributesGenerator,
      storageType,
      viewExpression,
      permissions,
      postProcessor,
      preFilters,
      preFiltersGenerator,
      meta,
    } = setup;

    Object.keys(setup).map(prop => {
      passOrThrow(
        viewEntityPropertiesWhitelist.includes(prop),
        () => `Invalid setup property '${prop}' in entity '${name}'`,
      );
    });

    passOrThrow(name, () => 'Missing entity name');
    passOrThrow(description, () => `Missing description for entity '${name}'`);
    passOrThrow(
      (attributes && !attributesGenerator) ||
        (!attributes && attributesGenerator),
      () =>
        `ViewEntity '${name}' needs either attributes or attributesGenerator defined`,
    );

    if (attributes) {
      passOrThrow(
        isMap(attributes),
        () =>
          `'attributes' for entity '${name}' needs to be a map of attributes`,
      );
    }
    else if (attributesGenerator) {
      passOrThrow(
        isFunction(attributesGenerator),
        () =>
          `'attributesGenerator' for entity '${name}' needs to return a map of attributes`,
      );
    }

    this.name = name;
    this.description = description;
    this._attributesMap = attributes;
    this._attributesGenerator = attributesGenerator;
    this.referencedByEntities = [];
    this.viewExpression = viewExpression;
    this._permissions = permissions;
    this._preFilters = preFilters;
    this._preFiltersGenerator = preFiltersGenerator;
    this.meta = meta;

    if (postProcessor) {
      passOrThrow(
        isFunction(postProcessor),
        () => `postProcessor of entity '${name}' needs to be a valid function`,
      );

      this.postProcessor = postProcessor;
    }

    if (storageType) {
      passOrThrow(
        isStorageType(storageType),
        () =>
          `ViewEntity '${name}' needs a valid storage type (defaults to 'StorageTypeNull')`,
      );
    }
    else {
      this.storageType = StorageTypeNull;
      this.isFallbackStorageType = true;
      this._exposeStorageAccess();
    }
  }

  _injectStorageTypeBySchema(storageType) {
    passOrThrow(
      isStorageType(storageType),
      () => `Provided storage type to entity '${this.name}' is invalid`,
    );

    if (this.isFallbackStorageType) {
      this.storageType = storageType;
      this._exposeStorageAccess();
    }
  }

  _exposeStorageAccess() {
    this.findOne = this.storageType.findOne;
    this.find = this.storageType.find;
  }

  _injectDefaultPermissionsBySchema(defaultPermissions) {
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
        `Invalid attribute name '${attributeName}' in entity '${
          this.name
        }' (Regex: /${ATTRIBUTE_NAME_PATTERN}/)`,
    );

    Object.keys(rawAttribute).map(prop => {
      passOrThrow(
        viewAttributePropertiesWhitelist.includes(prop),
        () =>
          `Invalid attribute property '${prop}' in entity '${
            this.name
          }' (use 'meta' for custom data)`,
      );
    });

    const attribute: Attribute = {
      ...rawAttribute,
      required: !!rawAttribute.required,
      hidden: !!rawAttribute.hidden,
      name: attributeName,
    };

    passOrThrow(
      attribute.description,
      () => `Missing description for '${this.name}.${attributeName}'`,
    );

    if (isFunction(attribute.type)) {
      const dataTypeBuilder: DataTypeFunction = (
        attribute.type
      ) as DataTypeFunction;
      attribute.type = dataTypeBuilder(attribute, this);
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
          `'${
            this.name
          }.${attributeName}' cannot have a targetAttributesMap as it is not a reference`,
      );

      passOrThrow(
        isMap(attribute.targetAttributesMap),
        () =>
          `targetAttributesMap for '${
            this.name
          }.${attributeName}' needs to be a map`,
      );

      const localAttributeNames = Object.keys(attribute.targetAttributesMap);
      localAttributeNames.map(localAttributeName => {
        const targetAttribute =
          attribute.targetAttributesMap[localAttributeName];

        passOrThrow(
          isMap(targetAttribute) &&
            targetAttribute.name &&
            targetAttribute.type,
          () =>
            `targetAttributesMap for '${
              this.name
            }.${attributeName}' needs to be a map between local and target attributes`,
        );

        // check if attribute is found in target entity
        (attribute.type as ViewEntity).referenceAttribute(targetAttribute.name);
      });
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
    const attributeMap = this._attributesMap
      ? { ...this._attributesMap }
      : this._attributesGenerator();

    passOrThrow(
      isMap(attributeMap),
      () =>
        `Attribute definition function for entity '${
          this.name
        }' does not return a map`,
    );

    const attributeNames = Object.keys(attributeMap);
    passOrThrow(
      attributeNames.length > 0,
      () => `ViewEntity '${this.name}' has no attributes defined`,
    );

    const resultAttributes = {};

    attributeNames.forEach(attributeName => {
      resultAttributes[attributeName] = this._processAttribute(
        attributeMap[attributeName],
        attributeName,
      );
    });

    attributeNames.forEach(attributeName => {
      const attribute = resultAttributes[attributeName];

      if (attribute.targetAttributesMap) {
        const localAttributeNames = Object.keys(attribute.targetAttributesMap);
        localAttributeNames.map(localAttributeName => {
          passOrThrow(
            resultAttributes[localAttributeName],
            () =>
              `Unknown local attribute '${localAttributeName}' used in targetAttributesMap ` +
              `for '${this.name}.${attributeName}'`,
          );
        });
      }
    });

    return resultAttributes;
  }

  referenceAttribute(attributeName) {
    const attributes = this.getAttributes();

    passOrThrow(
      attributes[attributeName],
      () =>
        `Cannot reference attribute '${
          this.name
        }.${attributeName}' as it does not exist`,
    );

    return attributes[attributeName];
  }

  _processPermissions() {
    if (this._permissions) {
      const permissions = isFunction(this._permissions)
        ? this._permissions()
        : this._permissions;

      return processViewEntityPermissions(
        this,
        permissions,
        this._defaultPermissions,
      );
    }
    else if (this._defaultPermissions) {
      return processViewEntityPermissions(this, this._defaultPermissions);
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

  _processPreFilters(): PreFilterType {
    return this._preFilters
      ? processPreFilters(this, this._preFilters)
      : null;
  }

  getPreFilters() {
    if (this.preFilters) {
      return this.preFilters;
    }

    if (this._preFiltersGenerator) {
      this._preFilters = this._preFiltersGenerator();
    }

    this.preFilters = this._processPreFilters();
    return this.preFilters;
  }

  getPermissions() {
    if (!this._permissions || this.permissions) {
      return this.permissions;
    }

    this.permissions = this._processPermissions();
    this._generatePermissionDescriptions();
    return this.permissions;
  }

  referencedBy(sourceViewEntityName, sourceAttributeName) {
    passOrThrow(
      sourceViewEntityName,
      () => `ViewEntity '${this.name}' expects an entity to be referenced by`,
    );

    passOrThrow(
      sourceAttributeName,
      () =>
        `ViewEntity '${this.name}' expects a source attribute to be referenced by`,
    );

    let found = false;

    this.referencedByEntities.map(entry => {
      if (
        entry.sourceViewEntityName === sourceViewEntityName &&
        entry.sourceAttributeName === sourceAttributeName
      ) {
        found = true;
      }
    });

    if (!found) {
      this.referencedByEntities.push({
        sourceViewEntityName,
        sourceAttributeName,
      });
    }
  }

  getStorageType() {
    return this.storageType;
  }

  toString() {
    return this.name;
  }
}

export const isViewEntity = obj => {
  return obj instanceof ViewEntity;
};
