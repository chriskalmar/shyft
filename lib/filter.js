
import {
  processFilter,
  isMap,
} from 'shift-engine';



export const purifyFilter = (filter) => {
  const ret = {}

  Object.keys(filter).map(key => {
    if (typeof filter[key] !== 'undefined') {
      ret[key] = filter[key]
    }
  })

  return ret
}


export const convertFilterLevel = (filterShaper, filterLevel) => {

  const converted = filterShaper(filterLevel)
  const filterLevelKeys = Object.keys(converted)
  const ret = {}

  filterLevelKeys.map(key => {
    const filter = filterLevel[key]

    if (filter) {
      if (isMap(filter)) {
        ret[key] = convertFilterLevel(filterShaper, filter)
      }
      else if (key === '$and' || key === '$or') {
        ret[key] = filter.map(item => convertFilterLevel(filterShaper, item))
      }
      else {
        ret[key] = converted[key]
      }
    }
  })


  filterLevelKeys.map(key => {
    if (typeof converted[key] !== 'undefined' && typeof ret[key] === 'undefined') {
      ret[key] = converted[key]
    }
  })

  return ret
}


export const processAndConvertFilter = (entity, filterShaper, args, StorageTypePostgres) => {
  const where = processFilter(entity, args, StorageTypePostgres)
  const convertedWhere = convertFilterLevel(filterShaper, where)

  return convertedWhere
}


const buildWhereAttributeOperatorConditionQuery = (qBuilder, attributeName, operator, value, entityName) => {

  const fullAttributeName = attributeName.indexOf('.') >= 0
    ? attributeName
    : `${entityName}.${attributeName}`

  const placeholderName = `${fullAttributeName}`.replace('.', '__')
  const data = { [placeholderName]: value }


  switch (operator) {

    case '$eq':
      qBuilder.andWhere(`${fullAttributeName} = :${placeholderName}`, data)
      break;
    case '$ne':
      qBuilder.andWhere(`${fullAttributeName} <> :${placeholderName}`, data)
      break;
  }
}


