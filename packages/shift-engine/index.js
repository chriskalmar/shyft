
import constants from './lib/constants';
import Entity, { isEntity } from './lib/entity/Entity';
import Schema from './lib/schema/Schema';
import StorageType from './lib/storage/StorageType';
import StorageDataType from './lib/storage/StorageDataType';
import ProtocolType from './lib/protocol/ProtocolType';
import Index, { INDEX_UNIQUE } from './lib/index/Index';
import Mutation, {
  MUTATION_TYPE_CREATE,
  MUTATION_TYPE_UPDATE,
  MUTATION_TYPE_DELETE,
} from './lib/mutation/Mutation';


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
} from './lib/util';

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
} from './lib/datatype/dataTypes';

import { Language } from './lib/models/Language';
import { User } from './lib/models/User';

const coreModels = {
  Language,
  User,
}


export {
  constants,

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

  coreModels,

  Index,
  INDEX_UNIQUE,

  Mutation,
  MUTATION_TYPE_CREATE,
  MUTATION_TYPE_UPDATE,
  MUTATION_TYPE_DELETE,

}


export default {
  constants,

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

  coreModels,

  Index,
  INDEX_UNIQUE,

  Mutation,
  MUTATION_TYPE_CREATE,
  MUTATION_TYPE_UPDATE,
  MUTATION_TYPE_DELETE,

}

