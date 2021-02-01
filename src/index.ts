import {
  ATTRIBUTE_NAME_PATTERN,
  attributeNameRegex,
  ENUM_VALUE_PATTERN,
  enumValueRegex,
  STATE_NAME_PATTERN,
  stateNameRegex,
  LANGUAGE_ISO_CODE_PATTERN,
  languageIsoCodeRegex,
  storageDataTypeCapabilityType,
  storageDataTypeCapabilities,
  entityPropertiesWhitelist,
  attributePropertiesWhitelist,
} from './engine/constants';
import { CustomError } from './engine/CustomError';
import { Entity, isEntity } from './engine/entity/Entity';
import { ViewEntity, isViewEntity } from './engine/entity/ViewEntity';
import { ShadowEntity, isShadowEntity } from './engine/entity/ShadowEntity';
import { Schema } from './engine/schema/Schema';
import { StorageType } from './engine/storage/StorageType';
import { StorageDataType } from './engine/storage/StorageDataType';
import { ProtocolType } from './engine/protocol/ProtocolType';
import {
  Configuration,
  isConfiguration,
} from './engine/configuration/Configuration';
import {
  ProtocolConfiguration,
  isProtocolConfiguration,
} from './engine/protocol/ProtocolConfiguration';
import {
  StorageConfiguration,
  isStorageConfiguration,
} from './engine/storage/StorageConfiguration';
import { Index, INDEX_UNIQUE, INDEX_GENERIC } from './engine/index/Index';
import {
  Action,
  isAction,
  ACTION_TYPE_MUTATION,
  ACTION_TYPE_QUERY,
} from './engine/action/Action';
import {
  Mutation,
  MUTATION_TYPE_CREATE,
  MUTATION_TYPE_UPDATE,
  MUTATION_TYPE_DELETE,
} from './engine/mutation/Mutation';
import {
  Subscription,
  SUBSCRIPTION_TYPE_CREATE,
  SUBSCRIPTION_TYPE_UPDATE,
  SUBSCRIPTION_TYPE_DELETE,
  pubsub,
} from './engine/subscription/Subscription';
import {
  Permission,
  checkPermissionSimple,
  buildPermissionFilter,
  buildActionPermissionFilter,
} from './engine/permission/Permission';

import {
  passOrThrow,
  resolveFunctionMap,
  isMap,
  isFunction,
  isArray,
  mergeMaps,
  mapOverProperties,
  sortDataByKeys,
  deleteUndefinedProps,
  isDefined,
  isString,
  convertEntityToViewAttribute,
  convertEntityToViewAttributesMap,
  combineMutationPreProcessors,
} from './engine/util';

import { processCursors } from './engine/cursor';

import { processFilter, convertFilterLevel } from './engine/filter';

import {
  fillSystemAttributesDefaultValues,
  fillDefaultValues,
  serializeValues,
} from './engine/helpers';

import {
  validateMutationPayload,
  validateActionPayload,
} from './engine/validation';

import { DataType, isDataType } from './engine/datatype/DataType';

import {
  DataTypeUserID,
  DataTypeID,
  DataTypeInteger,
  DataTypeBigInt,
  DataTypeFloat,
  DataTypeBoolean,
  DataTypeString,
  DataTypeJson,
  DataTypeTimestamp,
  DataTypeTimestampTz,
  DataTypeDate,
  DataTypeTime,
  DataTypeTimeTz,
  DataTypeUUID,
  DataTypeI18n,
} from './engine/datatype/dataTypes';

import { DataTypeEnum, isDataTypeEnum } from './engine/datatype/DataTypeEnum';
import {
  ComplexDataType,
  isComplexDataType,
} from './engine/datatype/ComplexDataType';
import {
  DataTypeState,
  isDataTypeState,
} from './engine/datatype/DataTypeState';

import {
  ObjectDataType,
  isObjectDataType,
  buildObjectDataType,
} from './engine/datatype/ObjectDataType';

import {
  ListDataType,
  isListDataType,
  buildListDataType,
} from './engine/datatype/ListDataType';

import { Language } from './engine/models/Language';
import { User } from './engine/models/User';

const coreModels = {
  Language,
  User,
};

export {
  ATTRIBUTE_NAME_PATTERN,
  attributeNameRegex,
  ENUM_VALUE_PATTERN,
  enumValueRegex,
  STATE_NAME_PATTERN,
  stateNameRegex,
  LANGUAGE_ISO_CODE_PATTERN,
  languageIsoCodeRegex,
  storageDataTypeCapabilityType,
  storageDataTypeCapabilities,
  entityPropertiesWhitelist,
  attributePropertiesWhitelist,
  CustomError,
  Entity,
  isEntity,
  ViewEntity,
  isViewEntity,
  ShadowEntity,
  isShadowEntity,
  Schema,
  StorageType,
  StorageDataType,
  ProtocolType,
  DataType,
  isDataType,
  DataTypeUserID,
  DataTypeID,
  DataTypeInteger,
  DataTypeBigInt,
  DataTypeFloat,
  DataTypeBoolean,
  DataTypeString,
  DataTypeJson,
  DataTypeTimestamp,
  DataTypeTimestampTz,
  DataTypeDate,
  DataTypeTime,
  DataTypeTimeTz,
  DataTypeUUID,
  DataTypeI18n,
  DataTypeState,
  isDataTypeState,
  DataTypeEnum,
  isDataTypeEnum,
  ObjectDataType,
  isObjectDataType,
  buildObjectDataType,
  ComplexDataType,
  isComplexDataType,
  ListDataType,
  isListDataType,
  buildListDataType,
  passOrThrow,
  resolveFunctionMap,
  isMap,
  isFunction,
  isArray,
  mergeMaps,
  mapOverProperties,
  sortDataByKeys,
  deleteUndefinedProps,
  isDefined,
  isString,
  processCursors,
  processFilter,
  convertFilterLevel,
  fillSystemAttributesDefaultValues,
  fillDefaultValues,
  serializeValues,
  validateMutationPayload,
  validateActionPayload,
  coreModels,
  Index,
  INDEX_UNIQUE,
  INDEX_GENERIC,
  Action,
  isAction,
  ACTION_TYPE_MUTATION,
  ACTION_TYPE_QUERY,
  Mutation,
  MUTATION_TYPE_CREATE,
  MUTATION_TYPE_UPDATE,
  MUTATION_TYPE_DELETE,
  Subscription,
  SUBSCRIPTION_TYPE_CREATE,
  SUBSCRIPTION_TYPE_UPDATE,
  SUBSCRIPTION_TYPE_DELETE,
  pubsub,
  Permission,
  checkPermissionSimple,
  buildPermissionFilter,
  buildActionPermissionFilter,
  Configuration,
  isConfiguration,
  ProtocolConfiguration,
  isProtocolConfiguration,
  StorageConfiguration,
  isStorageConfiguration,
  convertEntityToViewAttribute,
  convertEntityToViewAttributesMap,
  combineMutationPreProcessors,
};

import StorageTypePostgres from './storage-connector/StorageTypePostgres';
import StoragePostgresConfiguration, {
  isStoragePostgresConfiguration,
} from './storage-connector/StoragePostgresConfiguration';

import {
  loadModels,
  generateMockData,
  connectStorage,
  disconnectStorage,
} from './storage-connector/generator';

import {
  generateMigration,
  runMigration,
  revertMigration,
  fillMigrationsTable,
  migrateI18nIndices,
} from './storage-connector/migration';

import { runTestPlaceholderQuery } from './storage-connector/helpers';

export {
  StorageTypePostgres,
  loadModels,
  generateMockData,
  connectStorage,
  disconnectStorage,
  StoragePostgresConfiguration,
  isStoragePostgresConfiguration,
  generateMigration,
  runMigration,
  revertMigration,
  fillMigrationsTable,
  migrateI18nIndices,
  runTestPlaceholderQuery,
};

export default {
  StorageTypePostgres,
  loadModels,
  generateMockData,
  connectStorage,
  disconnectStorage,
  StoragePostgresConfiguration,
  isStoragePostgresConfiguration,
  generateMigration,
  runMigration,
  revertMigration,
  fillMigrationsTable,
  migrateI18nIndices,
  runTestPlaceholderQuery,
};
