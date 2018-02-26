
import {
  processFilter,
  isMap,
  isArray,
} from 'shift-engine';

import { Brackets } from 'typeorm';


export const purifyFilter = (filter) => {

  if (isMap(filter)) {
    if (isMap(filter, true)) {
      const ret = {}

      Object.keys(filter).map(key => {
        const pureFilter = purifyFilter(filter[key])
        if (pureFilter !== null && typeof pureFilter !== 'undefined') {
          ret[key] = pureFilter
        }
      })

      if (isMap(ret, true)) {
        return ret
      }
    }
  }
  else if (isArray(filter)) {
    if (isArray(filter, true)) {
      const ret = []

      filter.map(subFilter => {
        const pureFilter = purifyFilter(subFilter)
        if (pureFilter !== null && typeof pureFilter !== 'undefined') {
          ret.push(pureFilter)
        }
      })

      if (ret.length) {
        return ret
      }
    }
  }
  else if (filter !== null && typeof filter !== 'undefined'){
    return filter
  }

  return null
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



const buildWhereAttributeOperatorConditionQuery = (qBuilder, attributeName, operator, value, entityName, _placeholderIdx) => {
  const placeholderIdx = _placeholderIdx || { idx: 0 }
  placeholderIdx.idx++

  const fullAttributeName = attributeName.indexOf('.') >= 0
    ? attributeName
    : `${entityName}.${attributeName}`

  const placeholderName = `${fullAttributeName}__${placeholderIdx.idx}`.replace('.', '__')
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



const buildWhereAttributeConditionQuery = (qBuilder, attributeName, filter, entityName, _placeholderIdx) => {
  const placeholderIdx = _placeholderIdx || { idx: 0 }
  placeholderIdx.idx++

  if (isMap(filter)) {

    const operators = Object.keys(filter)

    operators.map(operator => {

      const value = filter[operator]
      buildWhereAttributeOperatorConditionQuery(qBuilder, attributeName, operator, value, entityName, placeholderIdx)
    })
  }
  else {
    buildWhereAttributeOperatorConditionQuery(qBuilder, attributeName, '$eq', filter, entityName, placeholderIdx)
  }
}



export const buildWhereTypeQuery = (filter, entityName, _placeholderIdx) => {
  const placeholderIdx = _placeholderIdx || { idx: 0 }
  placeholderIdx.idx++

  if (isMap(filter)) {
    if (isMap(filter, true)) {

      return new Brackets(qbAnd => {
        const keys = Object.keys(filter)

        keys.map(key => {

          const newFilter = filter[key]

          if (key === '$and') {
            if (!isArray(newFilter)) {
              throw new Error('$and expects an array of filters')
            }

            const andFilters = []
            newFilter.map(andFilter => {
              if (isMap(andFilter, true)) {
                andFilters.push(andFilter)
              }
            })

            if (andFilters.length) {
              newFilter.map(val => {
                const where = buildWhereTypeQuery(val, entityName, placeholderIdx)
                if (where) {
                  qbAnd.andWhere(where)
                }
              })
            }
          }
          else if (key === '$or') {
            if (!isArray(newFilter)) {
              throw new Error('$or expects an array of filters')
            }

            const orFilters = []
            newFilter.map(orFilter => {
              if (isMap(orFilter, true)) {
                orFilters.push(orFilter)
              }
            })

            if (orFilters.length) {
              const orBrackets = new Brackets(qbOr => {
                newFilter.map(val => {
                  const where = buildWhereTypeQuery(val, entityName, placeholderIdx)
                  if (where) {
                    qbOr.orWhere(where)
                  }
                })
              })

              qbAnd.andWhere(orBrackets)
            }

          }
          else if (key === '$not') {

            if (!isMap(newFilter)) {
              throw new Error('$not expects a filter')
            }

            if (isMap(newFilter, true)) {
              const where = buildWhereTypeQuery(newFilter, entityName, placeholderIdx)
              if (where) {
                const notBrackets = new Brackets(qbNot => {
                  qbNot.andWhere(where)
                })

                // tiny workaround to get the brackets conditions negated
                qbAnd.expressionMap.wheres.push({ type: 'simple', condition: 'NOT'});
                qbAnd.expressionMap.wheres.push({ type: 'simple', condition: qbAnd.computeWhereParameter(notBrackets)});
              }
            }
          }
          else if (key.indexOf('$') === 0) {
            throw new Error('missing attribute name for filter operator')
          }
          else {
            buildWhereAttributeConditionQuery(qbAnd, key, newFilter, entityName, placeholderIdx)
          }
        })

      })
    }

  }

  return null
}


export const buildWhereQuery = (qBuilder, filter, entityName) => {
  const pureFilter = purifyFilter(filter)
  const where = buildWhereTypeQuery(pureFilter, entityName)

  if (where) {
    qBuilder.andWhere(where)
  }
}
