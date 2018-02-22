
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


const escapeILikePattern = (pattern) => {
  return pattern.replace(/%/g, '\\%').replace(/_/g, '\\_')
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

    case '$in':
      qBuilder.andWhere(`${fullAttributeName} IN (:${placeholderName})`, data)
      break;
    case '$notIn':
      qBuilder.andWhere(`${fullAttributeName} NOT IN (:${placeholderName})`, data)
      break;

    case '$lt':
      qBuilder.andWhere(`${fullAttributeName} < :${placeholderName}`, data)
      break;
    case '$lte':
      qBuilder.andWhere(`${fullAttributeName} <= :${placeholderName}`, data)
      break;

    case '$gt':
      qBuilder.andWhere(`${fullAttributeName} > :${placeholderName}`, data)
      break;
    case '$gte':
      qBuilder.andWhere(`${fullAttributeName} >= :${placeholderName}`, data)
      break;

    case '$contains':
      qBuilder.andWhere(`${fullAttributeName} ILIKE :${placeholderName}`, { [placeholderName]: `%${escapeILikePattern(value)}%` })
      break;
    case '$startsWith':
      qBuilder.andWhere(`${fullAttributeName} ILIKE :${placeholderName}`, { [placeholderName]: `${escapeILikePattern(value)}%` })
      break;
    case '$endsWith':
      qBuilder.andWhere(`${fullAttributeName} ILIKE :${placeholderName}`, { [placeholderName]: `%${escapeILikePattern(value)}` })
      break;

    case '$notContains':
      qBuilder.andWhere(`${fullAttributeName} NOT ILIKE :${placeholderName}`, { [placeholderName]: `%${escapeILikePattern(value)}%` })
      break;
    case '$notStartsWith':
      qBuilder.andWhere(`${fullAttributeName} NOT ILIKE :${placeholderName}`, { [placeholderName]: `${escapeILikePattern(value)}%` })
      break;
    case '$notEndsWith':
      qBuilder.andWhere(`${fullAttributeName} NOT ILIKE :${placeholderName}`, { [placeholderName]: `%${escapeILikePattern(value)}` })
      break;

    default:
      throw new Error(`Unknown filter operator: ${operator}`)
  }
}



const buildWhereAttributeConditionQuery = (qBuilder, attributeName, filter, entityName) => {

  if (isMap(filter)) {

    const operators = Object.keys(filter)

    operators.map(operator => {

      const value = filter[operator]
      buildWhereAttributeOperatorConditionQuery(qBuilder, attributeName, operator, value, entityName)
    })
  }
  else {
    buildWhereAttributeOperatorConditionQuery(qBuilder, attributeName, '$eq', filter, entityName)
  }
}



export const buildWhereQuery = (qBuilder, filter, entityName) => {

  if (isMap(filter)) {
    if (isMap(filter, true)) {

      return new Brackets(qbAnd => {
        const keys = Object.keys(filter)

        keys.map(key => {

          const newFilter = filter[key]

          if (key === '$and') {
            const andFilters = []
            newFilter.map(andFilter => {
              if (isMap(andFilter, true)) {
                andFilters.push(andFilter)
              }
            })

            if (andFilters.length) {
              newFilter.map(val => {
                const where = buildWhereQuery(qbAnd, val, entityName)
                if (where) {
                  qBuilder.andWhere(where)
                }
              })
            }
          }
          else {
            buildWhereAttributeConditionQuery(qbAnd, key, newFilter, entityName)
          }
        })

      })
    }

  }

  return null
}
