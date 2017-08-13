
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
  processCursors,
  processFilter,
  isMap,
  MUTATION_TYPE_CREATE,
  MUTATION_TYPE_UPDATE,
  MUTATION_TYPE_DELETE,
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


const createDataLoader = (entityName, modelRegistry, relayTypePromoterField) => {

  const loader = new Dataloader(ids => {

    const { model } = modelRegistry[ entityName ]

    const where = {}

    if (ids.length === 1) {
      where.id = ids[0]
    }
    else {
      where.id = {
        $in: ids,
      }
    }

    return model.findAll({
      raw: true,
      where,
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

  return loader
}


export const StorageTypePostgres = new StorageType({
  name: 'StorageTypePostgres',
  description: 'Postgres database storage type',

  findOne (entity, id, source, args, context, info, relayTypePromoterField) {

    const entityName = entity.name
    const loaders = context.loaders
    let loader = loaders[ entityName ]

    if (!loader) {
      const { modelRegistry } = this.getStorageInstanceFromContext(context)
      loader = loaders[ entityName ] = createDataLoader(entityName, modelRegistry, relayTypePromoterField)
    }

    return loader.load(id)
  },


  async find (entity, source, args, context, info, relayTypePromoterField, parentConnection) {

    const {
      modelRegistry,
      // sequelize,
    } = this.getStorageInstanceFromContext(context)

    const entityName = entity.name
    const { model, filterShaper } = modelRegistry[ entityName ]

    const loaders = context.loaders
    let loader = loaders[ entityName ]

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


    const offset = args.offset

    const pageInfo = {
      hasNextPage: false,
      hasPreviousPage: false,
    }



    const where = {
      $and: {
        ...processAndConvertFilter(entity, filterShaper, args, this),
        ...processCursors(entity, args)
      }
    }


    if (parentConnection) {
      where.$and[ parentConnection.attribute ] = parentConnection.id
    }


    let result = await model.findAll({
      raw: true,
      limit,
      offset,
      order,
      where,
    })


    if (!loader) {
      loader = loaders[ entityName ] = createDataLoader(entityName, modelRegistry, relayTypePromoterField)
    }

    result.map(row => {
      loader.prime(row.id, row)
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


  count (entity, source, args, context, info, parentConnection) {

    const { modelRegistry } = this.getStorageInstanceFromContext(context)

    const entityName = entity.name
    const { model } = modelRegistry[ entityName ]

    const where = {
      $and: {}
    }

    if (parentConnection) {
      where.$and[ parentConnection.attribute ] = parentConnection.id
    }

    return model.count({
      where
    })

  },



  async mutate (entity, id, source, args, dataKey, entityMutation, context, info, relayTypePromoterField) {
    const entityName = entity.name
    const data = args[ dataKey ]
    const { modelRegistry } = this.getStorageInstanceFromContext(context)
    const { model } = modelRegistry[ entityName ]

    if (entityMutation.type === MUTATION_TYPE_CREATE) {
      const result = await model.create(data)
      result[ relayTypePromoterField ] = entityName

      return {
        [ dataKey ]: result,
        clientMutationId: args.clientMutationId,
      }
    }
    else if (entityMutation.type === MUTATION_TYPE_UPDATE) {
      const result = await model.update(data, {
        raw: true,
        returning: true,
        where: {
          id
        }
      })

      result[ relayTypePromoterField ] = entityName

      return {
        [ dataKey ]: result[1][0],
        clientMutationId: args.clientMutationId,
      }
    }
    else if (entityMutation.type === MUTATION_TYPE_DELETE) {
      const rowCount = await model.destroy({
        raw: true,
        returning: true,
        where: {
          id
        },
      })

      return {
        deleteRowCount: rowCount,
        clientMutationId: args.clientMutationId,
      }
    }

    return null

  }
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


function convertFilterLevel(filterShaper, filterLevel) {

  const converted = filterShaper(filterLevel)
  const filterLevelKeys = Object.keys(converted)
  const ret = {}

  filterLevelKeys.map(key => {
    const filter = filterLevel[ key ]

    if (filter) {
      if (isMap(filter)) {
        ret[ key ] = convertFilterLevel(filterShaper, filter)
      }
      else if (key === '$and' || key === '$or') {
        ret[ key ] = filter.map(item => convertFilterLevel(filterShaper, item))
      }
      else {
        ret[ key ] = converted[ key ]
      }
    }
  })


  filterLevelKeys.map(key => {
    if (typeof converted[ key ] !== 'undefined'  &&  typeof ret[ key ] === 'undefined') {
      ret[ key ] = converted[ key ]
    }
  })

  return ret
}


function processAndConvertFilter(entity, filterShaper, args) {
  const where = processFilter(entity, args, StorageTypePostgres)
  const convertedWhere = convertFilterLevel(filterShaper, where)

  return convertedWhere
}
