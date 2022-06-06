import { passOrThrow, isMap, isFunction, mapOverProperties } from '../util';

import {
  entityPropertiesWhitelist,
  ATTRIBUTE_NAME_PATTERN,
  attributeNameRegex,
  attributePropertiesWhitelist,
  STATE_NAME_PATTERN,
  stateNameRegex,
} from '../constants';

import { Index, processEntityIndexes } from '../index/Index';
import {
  Mutation,
  defaultEntityMutations,
  processEntityMutations,
  MutationGenerator,
  MutationMap,
} from '../mutation/Mutation';

import {
  generatePermissionDescription,
  PermissionMap,
  PermissionMapGenerator,
  processEntityPermissions,
} from '../permission/Permission';

import {
  Subscription,
  defaultEntitySubscription,
  processEntitySubscriptions,
} from '../subscription/Subscription';

import { DataType, isDataType, DataTypeFunction } from '../datatype/DataType';
import { isStorageType, StorageType } from '../storage/StorageType';
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
  PrimaryAttribute,
} from '../attribute/Attribute';
import { PreFilterMap, processPreFilters } from '../filter';
import { Context } from '../context/Context';
import { GraphQLResolveInfo, Source } from 'graphql';

export interface StateMap {
  [key: string]: number;
}

interface EntityPreProcessorResponse {
  args?: {
    [key: string]: unknown;
  };
  context?: Context;
}

export type EntityPreProcessor = (params: {
  entity?: Entity;
  source?: Source;
  args?: { [key: string]: unknown };
  context?: Context;
  info?: GraphQLResolveInfo;
}) => EntityPreProcessorResponse | Promise<EntityPreProcessorResponse>;

export type EntityPostProcessor = (params: {
  result?: { [key: string]: unknown };
  entity?: Entity;
  source?: Source;
  args?: { [key: string]: unknown };
  context?: Context;
  info?: GraphQLResolveInfo;
}) => { [key: string]: unknown };

export interface EntitySetup {
  name: string;
  description: string;
  attributes?: AttributesSetupMap | AttributesMapGenerator;
  storageType?: StorageType;
  isUserEntity?: boolean;
  includeTimeTracking?: boolean;
  includeUserTracking?: boolean;
  indexes?: Index[];
  mutations?: Mutation[] | MutationGenerator;
  permissions?: PermissionMap | PermissionMapGenerator;
  subscriptions?: any;
  states?: StateMap;
  preProcessor?: EntityPreProcessor;
  postProcessor?: EntityPostProcessor;
  preFilters?: PreFilterMap | (() => PreFilterMap);
  meta?: {
    [key: string]: unknown;
  };
}

export class Entity {
  name: string;
  storageTableName: string;
  description: string;
  storageType?: StorageType;
  isUserEntity?: boolean;
  includeTimeTracking?: boolean;
  includeUserTracking?: boolean;
  indexes?: Index[];
  mutations?: Mutation[];
  permissions?: PermissionMap;
  subscriptions?: any;
  states?: StateMap;
  preProcessor?: EntityPreProcessor;
  postProcessor?: EntityPostProcessor;
  preFilters?: PreFilterMap;
  meta?: {
    [key: string]: unknown;
  };
  private setup: EntitySetup;
  private _primaryAttribute: PrimaryAttribute;
  referencedByEntities: {
    sourceEntityName: string;
    sourceAttributeName: string;
  }[];
  private defaultPermissions: PermissionMap;
  private attributes: AttributesMap;
  descriptionPermissionsFind: string | boolean;
  descriptionPermissionsRead: string | boolean;
  isFallbackStorageType: boolean;
  findOne: () => unknown;
  find: () => unknown;

  constructor(setup: EntitySetup) {
    passOrThrow(isMap(setup), () => 'Entity requires a setup object');

    const {
      name,
      description,
      attributes,
      storageType,
      isUserEntity,
      includeTimeTracking,
      includeUserTracking,
      preProcessor,
      postProcessor,
      meta,
    } = setup;

    Object.keys(setup).map((prop) => {
      passOrThrow(
        entityPropertiesWhitelist.includes(prop),
        () => `Invalid setup property '${prop}' in entity '${name}'`,
      );
    });

    passOrThrow(name, () => 'Missing entity name');
    passOrThrow(description, () => `Missing description for entity '${name}'`);

    passOrThrow(
      isMap(attributes) || isFunction(attributes),
      () =>
        `'attributes' for entity '${name}' needs to be a map of attributes or a function returning a map of attributes`,
    );

    this.setup = setup;
    this.name = name;
    this.description = description;
    this.isUserEntity = !!isUserEntity;
    this.includeTimeTracking = !!includeTimeTracking;
    this.includeUserTracking = !!includeUserTracking;
    this._primaryAttribute = null;
    this.referencedByEntities = [];
    this.meta = meta;

    if (preProcessor) {
      passOrThrow(
        isFunction(preProcessor),
        () => `preProcessor of entity '${name}' needs to be a valid function`,
      );

      this.preProcessor = preProcessor;
    }

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
    } else {
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

    if (!this.permissions) {
      this.permissions = {};
    }

    this.defaultPermissions = defaultPermissions;
  }

  getAttributes() {
    if (this.attributes) {
      return this.attributes;
    }

    const ret = (this.attributes = this.processAttributeMap());
    return ret;
  }

  private processIndexes() {
    return processEntityIndexes(this, this.setup.indexes || []);
  }

  getIndexes() {
    if (this.indexes) {
      return this.indexes;
    }

    this.getAttributes();
    this.indexes = this.processIndexes();
    return this.indexes;
  }

  _processMutations() {
    let mutations: Mutation[];

    if (!this.setup.mutations) {
      mutations = Object.values(this.getDefaultMutations());
    } else {
      mutations =
        typeof this.setup.mutations === 'function'
          ? this.setup.mutations(this.getDefaultMutations())
          : this.setup.mutations;
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

  getMutationByName(name: string) {
    const mutations = this.getMutations();

    return mutations
      ? mutations.find((mutation) => String(mutation) === name)
      : null;
  }

  private processStates() {
    if (this.setup.states) {
      const states = this.setup.states;

      passOrThrow(
        isMap(states),
        () =>
          `Entity '${this.name}' states definition needs to be a map of state names and their unique ID`,
      );

      const stateNames = Object.keys(states);
      const uniqueIds = [];

      stateNames.map((stateName) => {
        const stateId = states[stateName];
        uniqueIds.push(stateId);

        passOrThrow(
          stateNameRegex.test(stateName),
          () =>
            `Invalid state name '${stateName}' in entity '${this.name}' (Regex: /${STATE_NAME_PATTERN}/)`,
        );

        passOrThrow(
          stateId === parseInt(String(stateId), 10) && stateId > 0,
          () =>
            `State '${stateName}' in entity '${this.name}' has an invalid unique ID (needs to be a positive integer)`,
        );
      });

      passOrThrow(
        uniqueIds.length === _.uniq(uniqueIds).length,
        () =>
          `Each state defined in entity '${this.name}' needs to have a unique ID`,
      );

      return states;
    }

    return null;
  }

  _getDefaultSubscriptions() {
    const nonSystemAttributeNames = [];

    mapOverProperties(this.getAttributes(), (attribute, attributeName) => {
      if (!attribute.isSystemAttribute) {
        nonSystemAttributeNames.push(attributeName);
      }
    });

    const subscriptions = {};

    defaultEntitySubscription.map((defaultSubscription) => {
      const key = `${defaultSubscription.name}Subscription`;

      subscriptions[key] = new Subscription({
        name: defaultSubscription.name,
        type: defaultSubscription.type,
        description: defaultSubscription.description(this.name),
        attributes: nonSystemAttributeNames,
      });
    });

    return subscriptions;
  }

  _processSubscriptions() {
    let subscriptions;

    if (!this.setup.subscriptions) {
      subscriptions = Object.values(this._getDefaultSubscriptions());
    } else {
      subscriptions = isFunction(this.setup.subscriptions)
        ? this.setup.subscriptions(this._getDefaultSubscriptions())
        : this.setup.subscriptions;
    }

    return processEntitySubscriptions(this, subscriptions);
  }

  getSubscriptions() {
    if (this.subscriptions) {
      return this.subscriptions;
    }

    this.subscriptions = this._processSubscriptions();
    return this.subscriptions;
  }

  getSubscriptionByName(name: string) {
    const subscriptions = this.getSubscriptions();

    return subscriptions
      ? subscriptions.find((subscription) => String(subscription) === name)
      : null;
  }

  getStates(): StateMap {
    if (!this.setup.states || this.states) {
      return this.states;
    }

    this.states = this.processStates();
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
      systemAttributesTimeTracking.map((attribute) => {
        const { name } = attribute;
        this._checkSystemAttributeNameCollision(attributeMap, name);
        attributeMap[name] = attribute;
        list.push(name);
      });
    }

    if (this.includeUserTracking && !this.isUserEntity) {
      systemAttributesUserTracking.map((attribute) => {
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
      (attributeName) => attributeMap[attributeName].i18n,
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
        `Attribute name collision with system attribute '${attributeName}' in entity '${this.name}'`,
    );
  }

  private processAttribute(rawAttribute, attributeName): Attribute {
    passOrThrow(
      attributeNameRegex.test(attributeName),
      () =>
        `Invalid attribute name '${attributeName}' in entity '${this.name}' (Regex: /${ATTRIBUTE_NAME_PATTERN}/)`,
    );

    Object.keys(rawAttribute).map((prop) => {
      passOrThrow(
        attributePropertiesWhitelist.includes(prop),
        () =>
          `Invalid attribute property '${prop}' in entity '${this.name}' (use 'meta' for custom data)`,
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

    if (attribute.i18n) {
      passOrThrow(
        isDataType(attribute.type),
        () =>
          `'${this.name}.${attributeName}' cannot be translatable as it is not a simple data type`,
      );

      passOrThrow(
        !attribute.unique,
        () =>
          `'${this.name}.${attributeName}' cannot be translatable as it has a uniqueness constraint`,
      );
    }

    if (isDataType(attribute.type)) {
      const attributeType = attribute.type as DataType;

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
        (attribute.type as Entity).referenceAttribute(targetAttribute.name);
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
      this._primaryAttribute = attribute as PrimaryAttribute;
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

  private processAttributeMap() {
    // if it's a function, resolve it to get that map
    const attributeMap =
      typeof this.setup.attributes === 'object'
        ? { ...this.setup.attributes }
        : this.setup.attributes();

    passOrThrow(
      isMap(attributeMap),
      () =>
        `Attribute definition function for entity '${this.name}' does not return a map`,
    );

    const attributeNames = Object.keys(attributeMap);
    passOrThrow(
      attributeNames.length > 0,
      () => `Entity '${this.name}' has no attributes defined`,
    );

    const resultAttributes = {};

    attributeNames.forEach((attributeName) => {
      resultAttributes[attributeName] = this.processAttribute(
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
      resultAttributes[attributeName] = this.processAttribute(
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

  getPrimaryAttribute(): PrimaryAttribute {
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

  getI18nAttributeNames() {
    const attributes = this.getAttributes();
    const attributeNames = Object.keys(attributes);
    const i18nAttributeNames = attributeNames.filter(
      (attributeName) => attributes[attributeName].i18n,
    );

    return i18nAttributeNames.length ? i18nAttributeNames : null;
  }

  private getDefaultMutations(): MutationMap {
    const nonSystemAttributeNames = [];

    mapOverProperties(this.getAttributes(), (attribute, attributeName) => {
      if (!attribute.isSystemAttribute) {
        nonSystemAttributeNames.push(attributeName);
      }
    });

    const mutations = {};

    defaultEntityMutations.map((defaultMutation) => {
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

  private processPermissions(): PermissionMap {
    if (this.setup.permissions) {
      const permissions =
        typeof this.setup.permissions === 'function'
          ? this.setup.permissions()
          : this.setup.permissions;

      return processEntityPermissions(
        this,
        permissions,
        this.defaultPermissions,
      );
    } else if (this.defaultPermissions) {
      return processEntityPermissions(this, {}, this.defaultPermissions);
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
        this.mutations.map((mutation) => {
          const mutationName = mutation.name;
          const permission = this.permissions.mutations[mutationName];

          if (permission) {
            const descriptionPermissions =
              generatePermissionDescription(permission);
            if (descriptionPermissions) {
              mutation.description += descriptionPermissions;
            }
          }
        });
      }

      if (this.permissions.subscriptions && this.subscriptions) {
        this.subscriptions.map((subscription) => {
          const subscriptionName = subscription.name;
          const permission = this.permissions.subscriptions[subscriptionName];

          if (permission) {
            const descriptionPermissions =
              generatePermissionDescription(permission);
            if (descriptionPermissions) {
              subscription.description += descriptionPermissions;
            }
          }
        });
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

    if (typeof this.setup.preFilters === 'function') {
      this.setup.preFilters = this.setup.preFilters();
    }

    this.preFilters = this._processPreFilters(this.setup.preFilters);
    return this.preFilters;
  }

  getPermissions() {
    if (!this.setup.permissions && !this.defaultPermissions) {
      return this.permissions;
    }

    this.getMutations();
    this.getSubscriptions();
    this.permissions = this.processPermissions();
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

    this.referencedByEntities.map((entry) => {
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

export const isEntity = (obj: unknown): obj is Entity => {
  return obj instanceof Entity;
};
