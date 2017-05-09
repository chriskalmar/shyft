
import {
  StorageType,
  dataTypes,
} from 'shift-engine';

import {
  StorageDataTypeBoolean,
  StorageDataTypeNumber,
  StorageDataTypeString,
  StorageDataTypeObject,
} from './storageDataTypes';

const {
  DataTypeID,
  DataTypeInteger,
  DataTypeBigInt,
  DataTypeFloat,
  DataTypeBoolean,
  DataTypeString,
  DataTypeJson,
} = dataTypes;


export const StorageTypeMemory = new StorageType({
  name: 'StorageTypeMemory',
  description: 'Simple in-memory database',

  systemAttributes: {
    id: {
      description: 'Unique row identifier',
      type: DataTypeBigInt,
      required: true,
      isPrimary: true,
    },
    createdAt: {
      description: 'Record was created at this time',
      type: DataTypeInteger,
      required: true,
      defaultValue: () => new Date().getTime(),
    },
    updatedAt: {
      description: 'Record was updated at this time',
      type: DataTypeInteger,
      required: true,
      defaultValue: () => new Date().getTime(),
    },
  },

  findOne() {},
  find() {},
})


export default StorageTypeMemory


StorageTypeMemory.addDataTypeMap(DataTypeID, StorageDataTypeString);
StorageTypeMemory.addDataTypeMap(DataTypeInteger, StorageDataTypeNumber);
StorageTypeMemory.addDataTypeMap(DataTypeBigInt, StorageDataTypeString);
StorageTypeMemory.addDataTypeMap(DataTypeFloat, StorageDataTypeNumber);
StorageTypeMemory.addDataTypeMap(DataTypeBoolean, StorageDataTypeBoolean);
StorageTypeMemory.addDataTypeMap(DataTypeString, StorageDataTypeString);
StorageTypeMemory.addDataTypeMap(DataTypeJson, StorageDataTypeObject);


