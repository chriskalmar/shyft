import constants from './constants';
import CustomError from './CustomError';
import Entity, { isEntity } from './entity/Entity';
import Schema from './schema/Schema';
import StorageType from './storage/StorageType';
import StorageDataType from './storage/StorageDataType';
import ProtocolType from './protocol/ProtocolType';
import Configuration, { isConfiguration } from './configuration/Configuration';
import ProtocolConfiguration, {
  isProtocolConfiguration,
} from './protocol/ProtocolConfiguration';
import StorageConfiguration, {
  isStorageConfiguration,
} from './storage/StorageConfiguration';
import Index, { INDEX_UNIQUE, INDEX_GENERIC } from './index/Index';
import Action, {
  isAction,
  ACTION_TYPE_MUTATION,
  ACTION_TYPE_QUERY,
} from './action/Action';
import Mutation, {
  MUTATION_TYPE_CREATE,
  MUTATION_TYPE_UPDATE,
  MUTATION_TYPE_DELETE,
} from './mutation/Mutation';
import Permission, {
  checkPermissionSimple,
  buildPermissionFilter,
  buildActionPermissionFilter,
} from './permission/Permission';

import {
  passOrThrow,
  resolveFunctionMap,
  isMap,
  isFunction,
  isArray,
  mergeMaps,
  mapOverProperties,
  sortDataByKeys,
  processCursors,
  deleteUndefinedProps,
  isDefined,
} from './util';

import { processFilter, convertFilterLevel } from './filter';

import {
  fillSystemAttributesDefaultValues,
  fillDefaultValues,
  serializeValues,
} from './helpers';

import { validateMutationPayload, validateActionPayload } from './validation';

import DataType, { isDataType } from './datatype/DataType';

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
  DataTypeUUID,
  DataTypeI18n,
} from './datatype/dataTypes';

import DataTypeEnum, { isDataTypeEnum } from './datatype/DataTypeEnum';
import ComplexDataType, { isComplexDataType } from './datatype/ComplexDataType';
import DataTypeState, { isDataTypeState } from './datatype/DataTypeState';

import ObjectDataType, {
  isObjectDataType,
  buildObjectDataType,
} from './datatype/ObjectDataType';

import ListDataType, {
  isListDataType,
  buildListDataType,
} from './datatype/ListDataType';

import { Language } from './models/Language';
import { User } from './models/User';

const coreModels = {
  Language,
  User,
};

export {
  constants,
  CustomError,
  Entity,
  isEntity,
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
  processCursors,
  deleteUndefinedProps,
  isDefined,
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
};

export default {
  constants,
  CustomError,

  Entity,
  isEntity,

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
  processCursors,
  deleteUndefinedProps,
  isDefined,

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
};
