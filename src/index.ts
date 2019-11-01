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
};
