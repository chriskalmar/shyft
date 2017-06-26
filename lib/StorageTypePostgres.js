
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
  sortDataByKeys,
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

import Dataloader from 'dataloader';


export const StorageTypePostgres = new StorageType({
  name: 'StorageTypePostgres',
  description: 'Postgres database storage type',

  findOne (entity, id, source, args, context) {

    const entityName = entity.name
    const loaders = context.loaders
    let loader = loaders[ entityName ]

    if (!loader) {

      loader = loaders[ entityName ] = new Dataloader(ids => {
        const modelRegistry = this.getStorageInstanceFromContext(context)

        const { model } = modelRegistry[ entityName ]

        return model.findAll({
          where: {
            id: {
              $in: ids,
            }
          }
        })
        .then(data => {
          // reorder results to match requested IDs order
          // https://github.com/facebook/dataloader/issues/66
          return sortDataByKeys(ids, data)
        })
      })
    }

    return loader.load(id)
  },

  find (entity, source, args, context) {

    const modelRegistry = this.getStorageInstanceFromContext(context)

    const entityName = entity.name
    const { model } = modelRegistry[ entityName ]

    const order = args.orderBy.map(({attribute, direction}) => [
      attribute,
      direction,
    ])

    return model.findAll({
      limit: args.first,
      order,
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
