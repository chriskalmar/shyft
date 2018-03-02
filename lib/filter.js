
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



const buildWhereAttributeOperatorConditionQuery = (qBuilder, attributeName, operator, value, _placeholderIdx) => {
  const placeholderIdx = _placeholderIdx || { idx: 0 }
  placeholderIdx.idx++

  const placeholderName = `${attributeName}__${placeholderIdx.idx}`.replace('.', '__')
  const data = { [placeholderName]: value }


  switch (operator) {

    case '$eq':
      qBuilder.andWhere(`${attributeName} = :${placeholderName}`, data)
      break;
    case '$ne':
      qBuilder.andWhere(`${attributeName} <> :${placeholderName}`, data)
      break;

    case '$in':
      qBuilder.andWhere(`${attributeName} IN (:${placeholderName})`, data)
      break;
    case '$notIn':
      qBuilder.andWhere(`${attributeName} NOT IN (:${placeholderName})`, data)
      break;

    case '$lt':
      qBuilder.andWhere(`${attributeName} < :${placeholderName}`, data)
      break;
    case '$lte':
      qBuilder.andWhere(`${attributeName} <= :${placeholderName}`, data)
      break;

    case '$gt':
      qBuilder.andWhere(`${attributeName} > :${placeholderName}`, data)
      break;
    case '$gte':
      qBuilder.andWhere(`${attributeName} >= :${placeholderName}`, data)
      break;

    case '$contains':
      qBuilder.andWhere(`${attributeName} ILIKE :${placeholderName}`, { [placeholderName]: `%${escapeILikePattern(value)}%` })
      break;
    case '$startsWith':
      qBuilder.andWhere(`${attributeName} ILIKE :${placeholderName}`, { [placeholderName]: `${escapeILikePattern(value)}%` })
      break;
    case '$endsWith':
      qBuilder.andWhere(`${attributeName} ILIKE :${placeholderName}`, { [placeholderName]: `%${escapeILikePattern(value)}` })
      break;

    case '$notContains':
      qBuilder.andWhere(`${attributeName} NOT ILIKE :${placeholderName}`, { [placeholderName]: `%${escapeILikePattern(value)}%` })
      break;
    case '$notStartsWith':
      qBuilder.andWhere(`${attributeName} NOT ILIKE :${placeholderName}`, { [placeholderName]: `${escapeILikePattern(value)}%` })
      break;
    case '$notEndsWith':
      qBuilder.andWhere(`${attributeName} NOT ILIKE :${placeholderName}`, { [placeholderName]: `%${escapeILikePattern(value)}` })
      break;

    default:
      throw new Error(`Unknown filter operator: ${operator}`)
  }
}



const buildWhereAttributeConditionQuery = (qBuilder, attributeName, filter, _placeholderIdx) => {
  const placeholderIdx = _placeholderIdx || { idx: 0 }
  placeholderIdx.idx++

  if (isMap(filter)) {

    const operators = Object.keys(filter)

    operators.map(operator => {

      const value = filter[operator]
      buildWhereAttributeOperatorConditionQuery(qBuilder, attributeName, operator, value, placeholderIdx)
    })
  }
  else {
    buildWhereAttributeOperatorConditionQuery(qBuilder, attributeName, '$eq', filter, placeholderIdx)
  }
}



export const buildWhereTypeQuery = (filter, entityName, modelRegistry, _placeholderIdx) => {
  const placeholderIdx = _placeholderIdx || { idx: 0 }
  placeholderIdx.idx++

  const { dataShaperMap } = modelRegistry[entityName]

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
                const where = buildWhereTypeQuery(val, entityName, modelRegistry, placeholderIdx)
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
                  const where = buildWhereTypeQuery(val, entityName, modelRegistry, placeholderIdx)
                  if (where) {
                    qbOr.orWhere(where)
                  }
                })
              })

              qbAnd.andWhere(orBrackets)
            }

          }
          else if (key === '$sub') {
            if (!newFilter.entity) {
              throw new Error('$sub expects an entity name')
            }
            if (!isArray(newFilter.condition, true)) {
              throw new Error('$sub expects an array of conditions')
            }

            const { dataShaperMap: targetDataShaperMap } = modelRegistry[newFilter.entity]

            qbAnd.andWhere(qbSub => {

              const subQuery = qbSub.subQuery()
                .select('COUNT(*) > 0', 'found')
                .from(newFilter.entity, newFilter.entity)

              newFilter.condition.map(({ targetAttribute, operator, sourceAttribute, value}) => {

                const targetAttributeName = targetDataShaperMap[targetAttribute] || targetAttribute

                if (sourceAttribute) {
                  const sourceAttributeName = `${entityName}.${dataShaperMap[sourceAttribute] || sourceAttribute}`
                  subQuery.andWhere(`${targetAttributeName} = ${sourceAttributeName}`)
                }
                else {
                  buildWhereAttributeOperatorConditionQuery(subQuery, targetAttributeName, operator, value, _placeholderIdx)
                }
              })

              return subQuery.getQuery()
            })
          }
          else if (key === '$not') {

            if (!isMap(newFilter)) {
              throw new Error('$not expects a filter')
            }

            if (isMap(newFilter, true)) {
              const where = buildWhereTypeQuery(newFilter, entityName, modelRegistry, placeholderIdx)
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
            const attributeName = dataShaperMap[key] || key
            buildWhereAttributeConditionQuery(qbAnd, attributeName, newFilter, placeholderIdx)
          }
        })

      })
    }

  }

  return null
}


export const buildWhereQuery = (qBuilder, filter, entityName, modelRegistry) => {

  if (!modelRegistry || !modelRegistry[entityName]) {
    throw new Error('buildWhereQuery() is missing a valid modelRegistry parameter')
  }

  const pureFilter = purifyFilter(filter)
  const where = buildWhereTypeQuery(pureFilter, entityName, modelRegistry)

  if (where) {
    qBuilder.andWhere(where)
  }
}
