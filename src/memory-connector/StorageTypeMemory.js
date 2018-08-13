
import {
  StorageType,
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
} from 'shift-engine';

import {
  StorageDataTypeBoolean,
  StorageDataTypeNumber,
  StorageDataTypeString,
  StorageDataTypeObject,
  StorageDataTypeTimestamp,
  StorageDataTypeDate,
} from './storageDataTypes';


export const StorageTypeMemory = new StorageType({
  name: 'StorageTypeMemory',
  description: 'Simple in-memory database',


})


export default StorageTypeMemory


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


