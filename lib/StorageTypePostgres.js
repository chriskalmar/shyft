
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
  isDataTypeEnum,
  isDataTypeState,
  isObjectDataType,
  isListDataType,
  sortDataByKeys,
  processCursors,
  MUTATION_TYPE_CREATE,
  MUTATION_TYPE_UPDATE,
  MUTATION_TYPE_DELETE,
  CustomError,
  deleteUndefinedProps,
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
  StorageDataTypeDate,
  StorageDataTypeEnum,
} from './storageDataTypes';

import Dataloader from 'dataloader';

import {
  invertDirection,
  getLimit,
} from './util';

import {
  purifyFilter,
  processAndConvertFilter,
  buildWhereQuery,
} from './filter';

import {
  PERMISSION_TYPES,
  handlePermission,
  applyPermission,
} from './permission';



const createDataLoader = (context, entity, storageInstance, modelRegistry) => {

  const manager = storageInstance.manager;

  const loader = new Dataloader(ids => {

    const entityName = entity.name
    const { filterShaper } = modelRegistry[ entityName ]

    let permissionWhere = handlePermission(context, entity, PERMISSION_TYPES.read)
    if (permissionWhere) {
      permissionWhere = purifyFilter(
        filterShaper(permissionWhere)
      )
    }


    const baseWhere = {
      $and: []
    }

    if (ids.length === 1) {
      baseWhere.$and.push({
        id: ids[0]
      })
    }
    else {
      baseWhere.$and.push({
        id: {
          $in: ids,
        }
      })
    }

    const where = applyPermission(baseWhere, permissionWhere)

    const qBuilder = manager.createQueryBuilder(entityName, entityName)
    buildWhereQuery(qBuilder, where, entityName)

    return qBuilder.getMany()
      .then(data => {
        // reorder results to match requested IDs order
        // https://github.com/facebook/dataloader/issues/66
        return sortDataByKeys(ids, data)
      })
  })

  return loader
}


const processOrmError = (err) => {

  if (String(err.code) === '23505') {
    throw new CustomError('Uniqueness constraint violated', 'UniqueConstraintError')
  }
  else if (String(err.code) === '23503') {
    throw new CustomError('Foreign key not found', 'ForeignKeyConstraintError')
  }

  throw err
}


const buildInstanceNotFoundError = (id) => {
  return new CustomError(`Instance with ID '${id}' not found`, 'InstanceNotFound')
}


const buildInstanceNotFoundOrAccessDeniedError = (id) => {
  return new CustomError(`Instance with ID '${id}' not found or access denied`, 'InstanceNotFoundOrAccessDenied')
}


export const StorageTypePostgres = new StorageType({
  name: 'StorageTypePostgres',
  description: 'Postgres database storage type',

  findOne (entity, id, args, context) {

    const entityName = entity.name
    const loaders = context.loaders
    let loader = loaders[ entityName ]

    if (!loader) {
      const storageInstance = this.getStorageInstance()
      const modelRegistry = this.getStorageModels()
      loader = loaders[entityName] = createDataLoader(context, entity, storageInstance, modelRegistry)
    }

    return loader.load(id)
  },


  async findOneByValues (entity, args, context) {

    const storageInstance = this.getStorageInstance()
    const manager = storageInstance.manager
    const modelRegistry = this.getStorageModels()

    const entityName = entity.name
    const loaders = context.loaders
    let loader = loaders[ entityName ]

    const { filterShaper } = modelRegistry[ entityName ]

    if (!loader) {
      loader = loaders[ entityName ] = createDataLoader(context, entity, storageInstance, modelRegistry)
    }

    let permissionWhere = handlePermission(context, entity, PERMISSION_TYPES.find)
    if (permissionWhere) {
      permissionWhere = purifyFilter(
        filterShaper(permissionWhere)
      )
    }


    const baseWhere = {
      $and: [
        args
      ]
    }

    const where = applyPermission(baseWhere, permissionWhere)

    const qBuilder = manager.createQueryBuilder(entityName, entityName)
    buildWhereQuery(qBuilder, where, entityName)

    const result = await qBuilder.getOne();

    if (result) {
      loader.prime(result.id, result)
    }

    return result
  },


  async find (entity, args, context, parentConnection) {

    const storageInstance = this.getStorageInstance()
    const manager = storageInstance.manager
    const modelRegistry = this.getStorageModels()

    const entityName = entity.name
    const { dataShaperMap, filterShaper } = modelRegistry[ entityName ]

    const loaders = context.loaders
    let loader = loaders[ entityName ]

    const reverseOrder = !!args.last

    let permissionWhere = handlePermission(context, entity, PERMISSION_TYPES.find)
    if (permissionWhere) {
      permissionWhere = purifyFilter(
        filterShaper(permissionWhere)
      )
    }


    const pageInfo = {
      hasNextPage: false,
      hasPreviousPage: false,
    }


    let limit = getLimit(args.first, args.last)

    if (limit === 0) {
      // no point in fetching data
      return {
        data: [],
        pageInfo
      }
    }

    limit += 1 // ask for 1 more to determine if there is a next page


    const offset = args.offset


    const baseWhere = {
      $and: [
        {
          ...processAndConvertFilter(entity, filterShaper, args, this),
        },
        {
          ...processCursors(entity, args),
        }
      ]
    }

    const where = applyPermission(baseWhere, permissionWhere)


    if (parentConnection) {
      where.$and.push({
        [ parentConnection.attribute ]: parentConnection.id
      })
    }


    const qBuilder = manager
      .createQueryBuilder(entityName, entityName)
      .limit(limit)
      .offset(offset)

    args.orderBy.map(({ attribute, direction }) => {
      qBuilder.addOrderBy(
        dataShaperMap[attribute],
        (reverseOrder ? invertDirection(direction) : direction)
      )
    })


    buildWhereQuery(qBuilder, where, entityName)
    let result = await qBuilder.getMany()

    if (!loader) {
      loader = loaders[ entityName ] = createDataLoader(context, entity, storageInstance, modelRegistry)
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


  async count (entity, args, context, parentConnection) {

    const storageInstance = this.getStorageInstance()
    const manager = storageInstance.manager
    const modelRegistry = this.getStorageModels()

    const entityName = entity.name
    const { filterShaper } = modelRegistry[ entityName ]

    let permissionWhere = handlePermission(context, entity, PERMISSION_TYPES.find)
    if (permissionWhere) {
      permissionWhere = purifyFilter(
        filterShaper(permissionWhere)
      )
    }

    const baseWhere = {
      $and: []
    }

    const where = applyPermission(baseWhere, permissionWhere)

    if (parentConnection) {
      where.$and.push({
        [ parentConnection.attribute ]: parentConnection.id
      })
    }


    const qBuilder = manager
      .createQueryBuilder(entityName, entityName)
      .select('COUNT(*)')

    buildWhereQuery(qBuilder, where, entityName)

    const result = await qBuilder.getRawOne()
    return parseInt(result.count, 10)
  },



  async mutate (entity, id, args, entityMutation, context) {
    const entityName = entity.name
    const data = {
      ...args
    }

    const modelRegistry = this.getStorageModels()
    const storageInstance = this.getStorageInstance()
    const { model, filterShaper } = modelRegistry[ entityName ]

    const manager = storageInstance.manager;

    deleteUndefinedProps(data)

    let permissionWhere = handlePermission(context, entity, PERMISSION_TYPES.mutation, entityMutation)
    if (permissionWhere) {
      permissionWhere = purifyFilter(
        filterShaper(permissionWhere)
      )
    }


    if (entityMutation.type === MUTATION_TYPE_CREATE) {
      let result

      try {
        result = await manager.save(entityName, data)
      }
      catch (err) {
        processOrmError(err)
      }

      return result
    }
    else if (entityMutation.type === MUTATION_TYPE_UPDATE) {

      let result
      const baseWhere = {
        $and: [{
          id
        }]
      }

      const where = applyPermission(baseWhere, permissionWhere)

      const qBuilder = manager
        .createQueryBuilder()
        .update(entityName)
        .set(data)
        .returning('*')

      buildWhereQuery(qBuilder, where, entityName)

      try {
        result = await qBuilder.execute()
      }
      catch (err) {
        processOrmError(err)
      }

      const rowCount = result.length

      if (rowCount < 1) {
        if (permissionWhere) {
          throw buildInstanceNotFoundOrAccessDeniedError(id)
        }

        throw buildInstanceNotFoundError(id)
      }

      return result[0]
    }
    else if (entityMutation.type === MUTATION_TYPE_DELETE) {

      let rowCount
      const baseWhere = {
        $and: [{
          id
        }]
      }

      const where = applyPermission(baseWhere, permissionWhere)

      try {
        rowCount = await model.destroy({
          raw: true,
          returning: true,
          where,
        })
      }
      catch (err) {
        processOrmError(err)
      }

      if (rowCount < 1) {
        if (permissionWhere) {
          throw buildInstanceNotFoundOrAccessDeniedError(id)
        }

        throw buildInstanceNotFoundError(id)
      }

      return {
        deleteRowCount: rowCount,
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
StorageTypePostgres.addDataTypeMap(DataTypeDate, StorageDataTypeDate);

StorageTypePostgres.addDynamicDataTypeMap(isDataTypeEnum, StorageDataTypeEnum);
StorageTypePostgres.addDynamicDataTypeMap(isDataTypeState, StorageDataTypeInteger);

StorageTypePostgres.addDynamicDataTypeMap(isObjectDataType, StorageDataTypeJSON);
StorageTypePostgres.addDynamicDataTypeMap(isListDataType, StorageDataTypeJSON);
