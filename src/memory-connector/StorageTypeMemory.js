import {
  StorageDataTypeBoolean,
  StorageDataTypeNumber,
  StorageDataTypeString,
  StorageDataTypeObject,
  StorageDataTypeTimestamp,
  StorageDataTypeDate,
} from './storageDataTypes';
import StorageType from '../engine/storage/StorageType';
import {
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
} from '../engine/datatype/dataTypes';

export const StorageTypeMemory = new StorageType({
  name: 'StorageTypeMemory',
  description: 'Simple in-memory database',
});

StorageTypeMemory.addDataTypeMap(DataTypeID, StorageDataTypeString);
StorageTypeMemory.addDataTypeMap(DataTypeInteger, StorageDataTypeNumber);
StorageTypeMemory.addDataTypeMap(DataTypeBigInt, StorageDataTypeString);
StorageTypeMemory.addDataTypeMap(DataTypeFloat, StorageDataTypeNumber);
StorageTypeMemory.addDataTypeMap(DataTypeBoolean, StorageDataTypeBoolean);
StorageTypeMemory.addDataTypeMap(DataTypeString, StorageDataTypeString);
StorageTypeMemory.addDataTypeMap(DataTypeJson, StorageDataTypeObject);
StorageTypeMemory.addDataTypeMap(DataTypeTimestamp, StorageDataTypeTimestamp);
StorageTypeMemory.addDataTypeMap(DataTypeTimestampTz, StorageDataTypeTimestamp);
StorageTypeMemory.addDataTypeMap(DataTypeDate, StorageDataTypeDate);
