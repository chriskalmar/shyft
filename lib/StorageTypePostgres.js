
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
} from 'shift-engine';

import {
  StorageDataTypeInteger,
  StorageDataTypeBigInt,
  StorageDataTypeNumeric,
  StorageDataTypeBoolean,
  StorageDataTypeText,
  StorageDataTypeJSON,
  StorageDataTypeTimestamp,
  StorageDataTypeTimestampTz,
} from './storageDataTypes';


export const StorageTypePostgres = new StorageType({
  name: 'StorageTypePostgres',
  description: 'Postgres database storage type',

  findOne (entity, id, source, args, context) {

    const modelRegistry = this.getStorageInstanceFromContext(context)

    const entityName = entity.name
    const { model } = modelRegistry[ entityName ]

    return model.findById(id)
  },

  find (entity, source, args, context) {

    const modelRegistry = this.getStorageInstanceFromContext(context)

    const entityName = entity.name
    const { model } = modelRegistry[ entityName ]

    return model.findAll({
      limit: args.first,
    })

  },

})

export default StorageTypePostgres


StorageTypePostgres.addDataTypeMap(DataTypeID, StorageDataTypeBigInt);
StorageTypePostgres.addDataTypeMap(DataTypeInteger, StorageDataTypeInteger);
StorageTypePostgres.addDataTypeMap(DataTypeBigInt, StorageDataTypeBigInt);
StorageTypePostgres.addDataTypeMap(DataTypeFloat, StorageDataTypeNumeric);
StorageTypePostgres.addDataTypeMap(DataTypeBoolean, StorageDataTypeBoolean);
StorageTypePostgres.addDataTypeMap(DataTypeString, StorageDataTypeText);
StorageTypePostgres.addDataTypeMap(DataTypeJson, StorageDataTypeJSON);
StorageTypePostgres.addDataTypeMap(DataTypeTimestamp, StorageDataTypeTimestamp);
StorageTypePostgres.addDataTypeMap(DataTypeTimestampTz, StorageDataTypeTimestampTz);
