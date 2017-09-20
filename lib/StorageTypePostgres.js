
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
  sortDataByKeys,
  processCursors,
  processFilter,
  isMap,
  MUTATION_TYPE_CREATE,
  MUTATION_TYPE_UPDATE,
  MUTATION_TYPE_DELETE,
  CustomError,
  checkPermissionSimple,
  buildPermissionFilter,
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
} from './storageDataTypes';

import Dataloader from 'dataloader';

const PERMISSION_TYPES = {
  read: 10,
  find: 20,
  mutation: 30,
}


const createDataLoader = (context, entity, modelRegistry, relayTypePromoterField) => {

  const loader = new Dataloader(ids => {

    const entityName = entity.name
    const { model, filterShaper } = modelRegistry[ entityName ]

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


const processSequelizeError = (err, sequelize) => {

  if (err instanceof sequelize.UniqueConstraintError) {
    throw new CustomError('Uniqueness constraint violated', 'UniqueConstraintError')
  }
  else if (err instanceof sequelize.ForeignKeyConstraintError) {
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

  findOne (entity, id, source, args, context, info, relayTypePromoterField) {

    const entityName = entity.name
    const loaders = context.loaders
    let loader = loaders[ entityName ]

    if (!loader) {
      const { modelRegistry } = this.getStorageInstanceFromContext(context)
      loader = loaders[ entityName ] = createDataLoader(context, entity, modelRegistry, relayTypePromoterField)
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

    let permissionWhere = handlePermission(context, entity, PERMISSION_TYPES.find)
    if (permissionWhere) {
      permissionWhere = purifyFilter(
        filterShaper(permissionWhere)
      )
    }

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



    const baseWhere = {
      $and: [{
        ...processAndConvertFilter(entity, filterShaper, args, this),
        ...processCursors(entity, args)
      }]
    }

    const where = applyPermission(baseWhere, permissionWhere)


    if (parentConnection) {
      where.$and.push({
        [ parentConnection.attribute ]: parentConnection.id
      })
    }


    let result = await model.findAll({
      raw: true,
      limit,
      offset,
      order,
      where,
    })


    if (!loader) {
      loader = loaders[ entityName ] = createDataLoader(context, entity, modelRegistry, relayTypePromoterField)
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
    const { model, filterShaper } = modelRegistry[ entityName ]

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

    return model.count({
      where
    })

  },



  async mutate (entity, id, source, args, dataKey, entityMutation, context, info, relayTypePromoterField) {
    const entityName = entity.name
    const data = {
      ...args[ dataKey ]
    }
    const {
      modelRegistry,
      sequelize,
    } = this.getStorageInstanceFromContext(context)
    const { model, filterShaper } = modelRegistry[ entityName ]


    let permissionWhere = handlePermission(context, entity, PERMISSION_TYPES.mutation, entityMutation)
    if (permissionWhere) {
      permissionWhere = purifyFilter(
        filterShaper(permissionWhere)
      )
    }


    if (entityMutation.type === MUTATION_TYPE_CREATE) {
      let result

      try {
        result = await model.create(data)
      }
      catch (err) {
        processSequelizeError(err, sequelize)
      }

      result[ relayTypePromoterField ] = entityName

      return {
        [ dataKey ]: result,
      }
    }
    else if (entityMutation.type === MUTATION_TYPE_UPDATE) {

      let result
      const baseWhere = {
        $and: [{
          id
        }]
      }

      const where = applyPermission(baseWhere, permissionWhere)

      try {
        result = await model.update(data, {
          raw: true,
          returning: true,
          where
        })
      }
      catch (err) {
        processSequelizeError(err, sequelize)
      }

      const [ rowCount, returnedData ] = result

      if (rowCount < 1) {
        if (permissionWhere) {
          throw buildInstanceNotFoundOrAccessDeniedError(id)
        }

        throw buildInstanceNotFoundError(id)
      }

      returnedData[0][ relayTypePromoterField ] = entityName

      return {
        [ dataKey ]: returnedData[0],
      }
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
        processSequelizeError(err, sequelize)
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


function purifyFilter(filter) {
  const ret = {}

  Object.keys(filter).map(key => {
    if (typeof filter[ key ] !== 'undefined') {
      ret[ key ] = filter[ key ]
    }
  })

  return ret
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



function applyPermission(where, permissionWhere) {

  if (!permissionWhere) {
    return where
  }

  const newWhere = { ...where }
  newWhere.$and.push(permissionWhere)

  return newWhere
}


function loadPermission (entity, permissionType, entityMutation) {

  if (!entity.permissions) {
    return null
  }
  else if (permissionType === PERMISSION_TYPES.read) {
    return entity.permissions.read
  }
  else if (permissionType === PERMISSION_TYPES.find) {
    return entity.permissions.find
  }
  else if (permissionType === PERMISSION_TYPES.mutation) {
    const mutationName = entityMutation.name
    return entity.permissions.mutations[ mutationName ]
  }

  throw new CustomError(`Unknown permission type '${permissionType}'`, 'PermissionTypeError')
}


function handlePermission(context, entity, permissionType, entityMutation) {

  const permission = loadPermission(entity, permissionType, entityMutation)

  if (!permission) {
    return null
  }

  const {
    user: {
      id: userId,
      roles: userRoles,
    }
  } = context.req

  const permitted = checkPermissionSimple(permission, userId, userRoles)

  if (permitted) {
    return null
  }

  const permissionFilter = buildPermissionFilter(permission, userId)

  if (!permissionFilter) {
    throw new CustomError('Access denied', 'PermissionError')
  }

  return permissionFilter
}
