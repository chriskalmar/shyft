
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
  DataTypeUUID,
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
  StorageDataTypeUUID,
} from './storageDataTypes';

import Dataloader from 'dataloader';

import {
  invertDirection,
  getLimit,
} from './util';

import {
  processAndConvertFilter,
  buildWhereQuery,
} from './filter';

import {
  PERMISSION_TYPES,
  handlePermission,
  applyPermission,
} from './permission';

import {
  i18nDataShaper,
  i18nDataMapShaper,
} from './i18n';



const processOrmError = (err) => {

  if (String(err.code) === '23505') {
    throw new CustomError('Uniqueness constraint violated', 'UniqueConstraintError')
  }
  else if (String(err.code) === '23503') {
    throw new CustomError('Foreign key not found', 'ForeignKeyConstraintError')
  }
  else if (String(err.code) === '22P02') {
    throw new CustomError(err.message, 'InvalidInputSyntaxError')
  }

  throw new CustomError('Undefined server error', 'UndefinedServerError', 500)
}



const createDataLoader = (context, entity, StorageTypePostgres) => {

  const storageInstance = StorageTypePostgres.getStorageInstance()
  const modelRegistry = StorageTypePostgres.getStorageModels()
  const manager = storageInstance.manager;

  const loader = new Dataloader(async (ids) => {

    const entityName = entity.name
    const { filterShaper, storageTableName } = modelRegistry[ entityName ]
    const { name: primaryAttributeName } = entity.getPrimaryAttribute()

    let permissionWhere = handlePermission(context, entity, PERMISSION_TYPES.read)
    if (permissionWhere) {
      permissionWhere = filterShaper(permissionWhere)
    }


    const baseWhere = {
      $and: []
    }

    if (ids.length === 1) {
      baseWhere.$and.push({
        [primaryAttributeName]: ids[0]
      })
    }
    else {
      baseWhere.$and.push({
        [primaryAttributeName]: {
          $in: ids,
        }
      })
    }

    const where = applyPermission(baseWhere, permissionWhere)

    const qBuilder = manager.createQueryBuilder(storageTableName, storageTableName)
    buildWhereQuery(qBuilder, where, entityName, modelRegistry, true)

    try {
      const rows = await qBuilder.getMany()
      const data = i18nDataMapShaper(entity, rows)

      // reorder results to match requested IDs order
      // https://github.com/facebook/dataloader/issues/66
      return sortDataByKeys(ids, data, primaryAttributeName)
    }
    catch (err) {
      processOrmError(err)
    }

    return null
  })

  return loader
}



const buildInstanceNotFoundError = (id) => {
  return new CustomError(`Instance with ID '${id}' not found`, 'InstanceNotFound')
}


const buildInstanceNotFoundOrAccessDeniedError = (id) => {
  return new CustomError(`Instance with ID '${id}' not found or access denied`, 'InstanceNotFoundOrAccessDenied')
}


const buildMutationDeniedError = (mutationName) => {
  return new CustomError(`Mutation '${mutationName}' denied`, 'PermissionError', 403)
}


export const preMutationPermissionCheckQueryGenerator = (StorageTypePostgres, permissionWhere, entityName, modelRegistry) => {
  const storageInstance = StorageTypePostgres.getStorageInstance()
  const manager = storageInstance.manager;

  const qBuilder = manager
    .createQueryBuilder()
    .select()
    .from('')

  buildWhereQuery(qBuilder, permissionWhere, entityName, modelRegistry)

  const [query, queryParams] = qBuilder.getQueryAndParameters();

  return [
    query.replace(/ \* FROM  WHERE /, ' '),
    queryParams
  ]
}


export const StorageTypePostgres = new StorageType({
  name: 'StorageTypePostgres',
  description: 'Postgres database storage type',

  findOne (entity, id, args, context) {

    const entityName = entity.name
    const loaders = context.loaders
    let loader = loaders[ entityName ]

    if (!loader) {
      loader = loaders[entityName] = createDataLoader(context, entity, this)
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

    const { filterShaper, storageTableName } = modelRegistry[ entityName ]
    const { name: primaryAttributeName } = entity.getPrimaryAttribute()

    if (!loader) {
      loader = loaders[ entityName ] = createDataLoader(context, entity, this)
    }

    let permissionWhere = handlePermission(context, entity, PERMISSION_TYPES.find)
    if (permissionWhere) {
      permissionWhere = filterShaper(permissionWhere)
    }


    const baseWhere = {
      $and: [
        args
      ]
    }

    const where = applyPermission(baseWhere, permissionWhere)

    const qBuilder = manager.createQueryBuilder(storageTableName, storageTableName)
    buildWhereQuery(qBuilder, where, entityName, modelRegistry)

    let result

    try {
      result = await qBuilder.getOne();
    }
    catch (err) {
      processOrmError(err)
    }

    if (result) {
      loader.prime(result[primaryAttributeName], result)
    }

    return i18nDataShaper(entity, result)
  },


  async find (entity, args, context, parentConnection) {

    const storageInstance = this.getStorageInstance()
    const manager = storageInstance.manager
    const modelRegistry = this.getStorageModels()

    const entityName = entity.name
    const { dataShaperMap, filterShaper, storageTableName } = modelRegistry[ entityName ]
    const { name: primaryAttributeName } = entity.getPrimaryAttribute()

    const loaders = context.loaders
    let loader = loaders[ entityName ]

    const reverseOrder = !!args.last

    let permissionWhere = handlePermission(context, entity, PERMISSION_TYPES.find)
    if (permissionWhere) {
      permissionWhere = filterShaper(permissionWhere)
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
      .createQueryBuilder(storageTableName, storageTableName)
      .limit(limit)
      .offset(offset)

    if (args.orderBy) {
      args.orderBy.map(({ attribute, direction }) => {
        qBuilder.addOrderBy(
          dataShaperMap[attribute],
          (reverseOrder ? invertDirection(direction) : direction)
        )
      })
    }


    buildWhereQuery(qBuilder, where, entityName, modelRegistry, true)

    let result

    try {
      result = await qBuilder.getMany()
    }
    catch (err) {
      processOrmError(err)
    }

    if (!loader) {
      loader = loaders[ entityName ] = createDataLoader(context, entity, this)
    }

    result.map(row => {
      loader.prime(row[primaryAttributeName], row)
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


    const orderedResults = reverseOrder
      ? result.reverse()
      : result

    const data = i18nDataMapShaper(entity, orderedResults)

    return {
      data,
      pageInfo,
    }
  },


  async count (entity, args, context, parentConnection) {

    const storageInstance = this.getStorageInstance()
    const manager = storageInstance.manager
    const modelRegistry = this.getStorageModels()

    const entityName = entity.name
    const { filterShaper, storageTableName } = modelRegistry[ entityName ]

    let permissionWhere = handlePermission(context, entity, PERMISSION_TYPES.find)
    if (permissionWhere) {
      permissionWhere = filterShaper(permissionWhere)
    }

    const baseWhere = {
      $and: [
        {
          ...processAndConvertFilter(entity, filterShaper, args, this),
        },
      ]
    }

    const where = applyPermission(baseWhere, permissionWhere)

    if (parentConnection) {
      where.$and.push({
        [ parentConnection.attribute ]: parentConnection.id
      })
    }


    const qBuilder = manager
      .createQueryBuilder(storageTableName, storageTableName)
      .select('COUNT(*)')

    buildWhereQuery(qBuilder, where, entityName, modelRegistry, true)

    let result

    try {
      result = await qBuilder.getRawOne()
    }
    catch (err) {
      processOrmError(err)
    }

    return parseInt(result.count, 10)
  },



  async mutate (entity, id, args, entityMutation, context) {

    if (!entityMutation) {
      throw new CustomError('Invalid mutation', 'InvalidMutationError')
    }

    const entityName = entity.name
    const data = {
      ...args
    }

    const modelRegistry = this.getStorageModels()
    const storageInstance = this.getStorageInstance()
    const { dataShaper, filterShaper, storageTableName } = modelRegistry[ entityName ]
    const { name: primaryAttributeName } = entity.getPrimaryAttribute()

    const manager = storageInstance.manager;

    deleteUndefinedProps(data)

    let permissionWhere = handlePermission(context, entity, PERMISSION_TYPES.mutation, entityMutation, data)
    if (permissionWhere) {
      permissionWhere = filterShaper(permissionWhere)
    }


    if (entityMutation.type === MUTATION_TYPE_CREATE) {
      let result

      if (permissionWhere && permissionWhere.$or) {
        const [query, queryParams] = preMutationPermissionCheckQueryGenerator(this, permissionWhere, entityName, modelRegistry)
        const preMutationPermissionCheck = await manager.query(query, queryParams)

        if (!preMutationPermissionCheck[0].found) {
          throw buildMutationDeniedError(entityMutation.name)
        }
      }


      const qBuilder = manager
        .createQueryBuilder()
        .insert()
        .into(storageTableName)
        .values(data)
        .returning('*')

      try {
        result = await qBuilder.execute()
      }
      catch (err) {
        processOrmError(err)
      }

      return dataShaper(result[0])
    }
    else if (entityMutation.type === MUTATION_TYPE_UPDATE) {

      let result
      const baseWhere = {
        $and: [{
          [primaryAttributeName]: id
        }]
      }

      const where = applyPermission(baseWhere, permissionWhere)

      const qBuilder = manager
        .createQueryBuilder()
        .update(storageTableName)
        .set(data)
        .returning('*')

      buildWhereQuery(qBuilder, where, entityName, modelRegistry)

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

      return dataShaper(result[0])
    }
    else if (entityMutation.type === MUTATION_TYPE_DELETE) {

      let result
      const baseWhere = {
        $and: [{
          [primaryAttributeName]: id
        }]
      }

      const where = applyPermission(baseWhere, permissionWhere)

      const qBuilder = manager
        .createQueryBuilder()
        .delete()
        .from(storageTableName)
        .returning('*')

      buildWhereQuery(qBuilder, where, entityName, modelRegistry)

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
StorageTypePostgres.addDataTypeMap(DataTypeUUID, StorageDataTypeUUID);

StorageTypePostgres.addDynamicDataTypeMap(isDataTypeEnum, StorageDataTypeEnum);
StorageTypePostgres.addDynamicDataTypeMap(isDataTypeState, StorageDataTypeInteger);

StorageTypePostgres.addDynamicDataTypeMap(isObjectDataType, StorageDataTypeJSON);
StorageTypePostgres.addDynamicDataTypeMap(isListDataType, StorageDataTypeJSON);
