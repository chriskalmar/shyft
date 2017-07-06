
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

  findOne (entity, id, source, args, context, info, relayTypePromoterField) {

    const entityName = entity.name
    const loaders = context.loaders
    let loader = loaders[ entityName ]

    if (!loader) {

      loader = loaders[ entityName ] = new Dataloader(ids => {
        const { modelRegistry } = this.getStorageInstanceFromContext(context)

        const { model } = modelRegistry[ entityName ]

        return model.findAll({
          raw: true,
          where: {
            id: {
              $in: ids,
            }
          }
        })
        .then(data => {

          if (relayTypePromoterField) {
            data.map((row) => {
              row[ relayTypePromoterField ] = entityName
            })
          }

          return data
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


  async find (entity, source, args, context) {

    const {
      modelRegistry,
      // sequelize,
    } = this.getStorageInstanceFromContext(context)

    const entityName = entity.name
    const { model } = modelRegistry[ entityName ]

    const reverseOrder = !!args.last

    const order = args.orderBy.map(({attribute, direction}) => [
      attribute,
      (reverseOrder ? invertDirection(direction) : direction),
    ])

    let limit = getLimit(args.first, args.last)

    if (limit === 0) {
      // no point in fetching data
      return []
    }

    limit += 1 // ask for 1 more to determine if there is a next page

    const pageInfo = {
      hasNextPage: false,
      hasPreviousPage: false,
    }

    let result = await model.findAll({
      raw: true,
      limit,
      order,
    })

    // remove the 1 extra row if it exists
    if (result.length >= limit) {
      result = result.slice(0, limit -1)

      if (reverseOrder) {
        pageInfo.hasPreviousPage = true
    }
      else {
        pageInfo.hasNextPage = true
      }
    }

    return {
      data: reverseOrder ? result.reverse() : result,
      pageInfo,
    }
  },


  count (entity, source, args, context) {

    const { modelRegistry } = this.getStorageInstanceFromContext(context)

    const entityName = entity.name
    const { model } = modelRegistry[ entityName ]

    return model.count({

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



function invertDirection(direction) {
  return direction === 'DESC' ? 'ASC' : 'DESC'
}


function getLimit(first, last) {
  if (first >= 0) {
    return first
  }
  else if (last >= 0) {
    return last
  }

    return 10
}
