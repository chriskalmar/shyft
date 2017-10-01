
import constants from './constants';
import CustomError from './CustomError';
import Entity, { isEntity } from './entity/Entity';
import Schema from './schema/Schema';
import StorageType from './storage/StorageType';
import StorageDataType from './storage/StorageDataType';
import ProtocolType from './protocol/ProtocolType';
import Index, { INDEX_UNIQUE } from './index/Index';
import Action, { isAction } from './action/Action';
import Mutation, {
  MUTATION_TYPE_CREATE,
  MUTATION_TYPE_UPDATE,
  MUTATION_TYPE_DELETE,
} from './mutation/Mutation';
import Permission, {
  checkPermissionSimple,
  buildPermissionFilter,
}
from './permission/Permission';


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
  processFilter,
  deleteUndefinedProps,
} from './util';

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
} from './datatype/dataTypes';

import ObjectDataType, { isObjectDataType } from './datatype/ObjectDataType';

import { Language } from './models/Language';
import { User } from './models/User';

const coreModels = {
  Language,
  User,
}


export {
  constants,
  CustomError,

  Entity,
  isEntity,

  Schema,

  StorageType,
  StorageDataType,

  ProtocolType,

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

  ObjectDataType,
  isObjectDataType,

  passOrThrow,
  resolveFunctionMap,
  isMap,
  isFunction,
  isArray,
  mergeMaps,
  mapOverProperties,
  sortDataByKeys,
  processCursors,
  processFilter,
  deleteUndefinedProps,

  coreModels,

  Index,
  INDEX_UNIQUE,

  Action,
  isAction,

  Mutation,
  MUTATION_TYPE_CREATE,
  MUTATION_TYPE_UPDATE,
  MUTATION_TYPE_DELETE,

  Permission,
  checkPermissionSimple,
  buildPermissionFilter,
}


export default {
  constants,
  CustomError,

  Entity,
  isEntity,

  Schema,

  StorageType,
  StorageDataType,

  ProtocolType,

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

  ObjectDataType,
  isObjectDataType,

  passOrThrow,
  resolveFunctionMap,
  isMap,
  isFunction,
  isArray,
  mergeMaps,
  mapOverProperties,
  sortDataByKeys,
  processCursors,
  processFilter,
  deleteUndefinedProps,

  coreModels,

  Index,
  INDEX_UNIQUE,

  Action,
  isAction,

  Mutation,
  MUTATION_TYPE_CREATE,
  MUTATION_TYPE_UPDATE,
  MUTATION_TYPE_DELETE,

  Permission,
  checkPermissionSimple,
  buildPermissionFilter,
}

