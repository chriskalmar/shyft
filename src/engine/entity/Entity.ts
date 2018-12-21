import { passOrThrow, isMap, isFunction, mapOverProperties } from '../util';

import {
  entityPropertiesWhitelist,
  ATTRIBUTE_NAME_PATTERN,
  attributeNameRegex,
  attributePropertiesWhitelist,
  STATE_NAME_PATTERN,
  stateNameRegex,
} from '../constants';

import { processEntityIndexes } from '../index/Index';
import {
  Mutation,
  defaultEntityMutations,
  processEntityMutations,
} from '../mutation/Mutation';

import {
  generatePermissionDescription,
  processEntityPermissions,
} from '../permission/Permission';

import { DataType, isDataType, DataTypeFunction } from '../datatype/DataType';
import { isStorageType } from '../storage/StorageType';
import { StorageTypeNull } from '../storage/StorageTypeNull';
import { isComplexDataType } from '../datatype/ComplexDataType';

import {
  systemAttributePrimary,
  systemAttributesTimeTracking,
  systemAttributesUserTracking,
  systemAttributeState,
  systemAttributeI18n,
} from './systemAttributes';

import * as _ from 'lodash';

import {
  Attribute,
  AttributesMap,
  AttributesSetupMap,
  AttributesMapGenerator,
} from '../attribute/Attribute';
import { processPreFilters } from '../filter';

type PreFilterType = {
  [key: string]: {
    resolve: Function;
    attributes: any;
  };
};

type PreFilterGeneratorType = () => PreFilterType

export type EntitySetup = {
  name: string;
  description: string;
  attributes?: AttributesSetupMap;
  attributesGenerator?: AttributesMapGenerator;
  storageType?: any;
  isUserEntity?: boolean;
  includeTimeTracking?: boolean;
  includeUserTracking?: boolean;
  indexes?: any;
  mutations?: any;
  permissions?: any;
  states?: any;
  postProcessor?: Function;
  preFilters?: PreFilterType;
  preFiltersGenerator?: PreFilterGeneratorType;
};

export class Entity {
  name: string;
  description: string;
  storageType?: any;
  isUserEntity?: boolean;
  includeTimeTracking?: boolean;
  includeUserTracking?: boolean;
  indexes?: any;
  mutations?: any;
  permissions?: any;
  states?: any;
  postProcessor?: Function;
  preFilters?: PreFilterType;
  private _attributesMap: AttributesSetupMap;
  private _attributesGenerator: AttributesMapGenerator;
  private _primaryAttribute: Attribute;
  private referencedByEntities: any;
  private _indexes: any;
  private _mutations: any;
  private _states: any;
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

  constructor(setup: EntitySetup) {
    passOrThrow(isMap(setup), () => 'Entity requires a setup object');

    const {
      name,
      description,
      attributes,
      attributesGenerator,
      storageType,
      isUserEntity,
      includeTimeTracking,
      includeUserTracking,
      indexes,
      mutations,
      permissions,
      states,
      postProcessor,
      preFilters,
      preFiltersGenerator,
    } = setup;

    Object.keys(setup).map(prop => {
      passOrThrow(
        entityPropertiesWhitelist.includes(prop),
        () => `Invalid setup property '${prop}' in entity '${name}'`,
      );
    });

    passOrThrow(name, () => 'Missing entity name');
    passOrThrow(description, () => `Missing description for entity '${name}'`);
    passOrThrow(
      (attributes && !attributesGenerator) ||
        (!attributes && attributesGenerator),
      () =>
        `Entity '${name}' needs either attributes or attributesGenerator defined`,
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
    this.isUserEntity = !!isUserEntity;
    this.includeTimeTracking = !!includeTimeTracking;
    this.includeUserTracking = !!includeUserTracking;
    this._attributesMap = attributes;
    this._attributesGenerator = attributesGenerator;
    this._primaryAttribute = null;
    this.referencedByEntities = [];
    this._indexes = indexes;
    this._mutations = mutations;
    this._states = states;
    this._permissions = permissions;
    this._preFilters = preFilters;
    this._preFiltersGenerator = preFiltersGenerator;

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
          `Entity '${name}' needs a valid storage type (defaults to 'StorageTypeNull')`,
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

  _processIndexes() {
    return processEntityIndexes(this, this._indexes || []);
  }

  getIndexes() {
    if (this.indexes) {
      return this.indexes;
    }

    this.getAttributes();
    this.indexes = this._processIndexes();
    return this.indexes;
  }

  _processMutations() {
    let mutations;

    if (!this._mutations) {
      mutations = Object.values(this._getDefaultMutations());
    }
    else {
      mutations = isFunction(this._mutations)
        ? this._mutations(this._getDefaultMutations())
        : this._mutations;
    }

    return processEntityMutations(this, mutations);
  }

  getMutations() {
    if (this.mutations) {
      return this.mutations;
    }

    this.getStates();
    this.mutations = this._processMutations();
    return this.mutations;
  }

  getMutationByName(name) {
    const mutations = this.getMutations();

    return mutations
      ? mutations.find(mutation => String(mutation) === name)
      : null;
  }

  _processStates() {
    if (this._states) {
      const states = this._states;

      passOrThrow(
        isMap(states),
        () =>
          `Entity '${
            this.name
          }' states definition needs to be a map of state names and their unique ID`,
      );

      const stateNames = Object.keys(states);
      const uniqueIds = [];

      stateNames.map(stateName => {
        const stateId = states[stateName];
        uniqueIds.push(stateId);

        passOrThrow(
          stateNameRegex.test(stateName),
          () =>
            `Invalid state name '${stateName}' in entity '${
              this.name
            }' (Regex: /${STATE_NAME_PATTERN}/)`,
        );

        passOrThrow(
          stateId === parseInt(stateId, 10) && stateId > 0,
          () =>
            `State '${stateName}' in entity '${
              this.name
            }' has an invalid unique ID (needs to be a positive integer)`,
        );
      });

      passOrThrow(
        uniqueIds.length === _.uniq(uniqueIds).length,
        () =>
          `Each state defined in entity '${
            this.name
          }' needs to have a unique ID`,
      );

      return states;
    }

    return null;
  }

  getStates() {
    if (!this._states || this.states) {
      return this.states;
    }

    this.states = this._processStates();
    return this.states;
  }

  hasStates() {
    return !!this.getStates();
  }

  _collectSystemAttributes(attributeMap) {
    const list = [];

    if (!this.getPrimaryAttribute()) {
      const { name } = systemAttributePrimary;
      this._checkSystemAttributeNameCollision(attributeMap, name);
      attributeMap[name] = systemAttributePrimary;
      list.push(name);
    }

    if (this.includeTimeTracking) {
      systemAttributesTimeTracking.map(attribute => {
        const { name } = attribute;
        this._checkSystemAttributeNameCollision(attributeMap, name);
        attributeMap[name] = attribute;
        list.push(name);
      });
    }

    if (this.includeUserTracking && !this.isUserEntity) {
      systemAttributesUserTracking.map(attribute => {
        const { name } = attribute;
        this._checkSystemAttributeNameCollision(attributeMap, name);
        attributeMap[name] = attribute;
        list.push(name);
      });
    }

    if (this.hasStates()) {
      const { name } = systemAttributeState;
      this._checkSystemAttributeNameCollision(attributeMap, name);
      attributeMap[name] = systemAttributeState;
      list.push(name);
    }

    const attributeNames = Object.keys(attributeMap);
    const i18nAttributeNames = attributeNames.filter(
      attributeName => attributeMap[attributeName].i18n,
    );

    if (i18nAttributeNames.length) {
      const { name } = systemAttributeI18n;
      this._checkSystemAttributeNameCollision(attributeMap, name);
      attributeMap[name] = systemAttributeI18n;
      list.push(name);
    }

    return list;
  }

  _checkSystemAttributeNameCollision(attributeMap, attributeName) {
    passOrThrow(
      !attributeMap[attributeName],
      () =>
        `Attribute name collision with system attribute '${attributeName}' in entity '${
          this.name
        }'`,
    );
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
        attributePropertiesWhitelist.includes(prop),
        () =>
          `Invalid attribute property '${prop}' in entity '${
            this.name
          }' (use 'meta' for custom data)`,
      );
    });

    const attribute: Attribute = {
      ...rawAttribute,
      primary: !!rawAttribute.primary,
      unique: !!rawAttribute.primary,
      required: !!rawAttribute.required || !!rawAttribute.primary,
      hidden: !!rawAttribute.hidden,
      index: !!rawAttribute.index,
      i18n: !!rawAttribute.i18n,
      mutationInput: !!rawAttribute.mutationInput,
      name: attributeName,
    };

    passOrThrow(
      attribute.description,
      () => `Missing description for '${this.name}.${attributeName}'`,
    );

    if (isFunction(attribute.type)) {
      const dataTypeBuilder: DataTypeFunction = <DataTypeFunction>(
        attribute.type
      );
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

    if (attribute.i18n) {
      passOrThrow(
        isDataType(attribute.type),
        () =>
          `'${
            this.name
          }.${attributeName}' cannot be translatable as it is not a simple data type`,
      );

      passOrThrow(
        !attribute.unique,
        () =>
          `'${
            this.name
          }.${attributeName}' cannot be translatable as it has a uniqueness constraint`,
      );
    }

    if (isDataType(attribute.type)) {
      const attributeType = <DataType>attribute.type;

      if (attributeType.enforceRequired) {
        attribute.required = true;
      }

      if (attributeType.defaultValue) {
        attribute.defaultValue = attributeType.defaultValue;
      }

      if (attributeType.enforceIndex) {
        attribute.index = true;
      }
    }

    if (attribute.targetAttributesMap) {
      passOrThrow(
        attribute.type instanceof Entity,
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
        (<Entity>attribute.type).referenceAttribute(targetAttribute.name);
      });
    }

    if (attribute.primary) {
      passOrThrow(
        !this._primaryAttribute,
        () =>
          `'${
            this.name
          }.${attributeName}' cannot be set as primary attribute,` +
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
      !attribute.defaultValue || isFunction(attribute.defaultValue),
      () =>
        `'${this.name}.${attributeName}' has an invalid defaultValue function'`,
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
      () => `Entity '${this.name}' has no attributes defined`,
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

    const systemAttributeNames = this._collectSystemAttributes(attributeMap);

    systemAttributeNames.forEach(attributeName => {
      resultAttributes[attributeName] = this._processAttribute(
        attributeMap[attributeName],
        attributeName,
      );
      resultAttributes[attributeName].isSystemAttribute = true;
    });

    const rankedResultAttributes = {};

    Object.keys(resultAttributes).map(attributeName => {
      const attribute = resultAttributes[attributeName];
      if (attribute.primary) {
        rankedResultAttributes[attributeName] = attribute;
      }
    });
    Object.keys(resultAttributes).map(attributeName => {
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
        `Cannot reference attribute '${
          this.name
        }.${attributeName}' as it does not exist`,
    );

    return attributes[attributeName];
  }

  getI18nAttributeNames() {
    const attributes = this.getAttributes();
    const attributeNames = Object.keys(attributes);
    const i18nAttributeNames = attributeNames.filter(
      attributeName => attributes[attributeName].i18n,
    );

    return i18nAttributeNames.length ? i18nAttributeNames : null;
  }

  _getDefaultMutations() {
    const nonSystemAttributeNames = [];

    mapOverProperties(this.getAttributes(), (attribute, attributeName) => {
      if (!attribute.isSystemAttribute) {
        nonSystemAttributeNames.push(attributeName);
      }
    });

    const mutations = {};

    defaultEntityMutations.map(defaultMutation => {
      const key = `${defaultMutation.name}Mutation`;

      mutations[key] = new Mutation({
        name: defaultMutation.name,
        type: defaultMutation.type,
        description: defaultMutation.description(this.name),
        attributes: nonSystemAttributeNames,
      });
    });

    return mutations;
  }

  _processPermissions() {
    if (this._permissions) {
      const permissions = isFunction(this._permissions)
        ? this._permissions()
        : this._permissions;

      return processEntityPermissions(
        this,
        permissions,
        this._defaultPermissions,
      );
    }
    else if (this._defaultPermissions) {
      return processEntityPermissions(this, this._defaultPermissions);
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

      if (this.permissions.mutations && this.mutations) {
        this.mutations.map(mutation => {
          const mutationName = mutation.name;
          const permission = this.permissions.mutations[mutationName];

          if (permission) {
            const descriptionPermissions = generatePermissionDescription(
              permission,
            );
            if (descriptionPermissions) {
              mutation.description += descriptionPermissions;
            }
          }
        });
      }
    }
  }

  _processPreFilters(): PreFilterType {
    return this._preFilters
      ? <any>processPreFilters(this, this._preFilters)
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

    this.getMutations();
    this.permissions = this._processPermissions();
    this._generatePermissionDescriptions();
    return this.permissions;
  }

  referencedBy(sourceEntityName, sourceAttributeName) {
    passOrThrow(
      sourceEntityName,
      () => `Entity '${this.name}' expects an entity to be referenced by`,
    );

    passOrThrow(
      sourceAttributeName,
      () =>
        `Entity '${this.name}' expects a source attribute to be referenced by`,
    );

    let found = false;

    this.referencedByEntities.map(entry => {
      if (
        entry.sourceEntityName === sourceEntityName &&
        entry.sourceAttributeName === sourceAttributeName
      ) {
        found = true;
      }
    });

    if (!found) {
      this.referencedByEntities.push({
        sourceEntityName,
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

export const isEntity = obj => {
  return obj instanceof Entity;
};
