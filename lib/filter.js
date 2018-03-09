
import {
  processFilter,
  isMap,
  isArray,
  convertFilterLevel,
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



const buildWhereTypeSubQuery = (qBuilder, filter, entityName, modelRegistry, isGetMany, _placeholderIdx) => {
  if (!filter.entity) {
    throw new Error('$sub expects an entity name')
  }
  if (!isArray(filter.condition, true)) {
    throw new Error('$sub expects an array of conditions')
  }

  const { dataShaperMap } = modelRegistry[entityName]
  const { dataShaperMap: targetDataShaperMap } = modelRegistry[filter.entity]

  const isSelfLookup = entityName === filter.entity

  let inOperatorLink

  if (isGetMany) {
    inOperatorLink = filter.condition.find(({ sourceAttribute }) => !!sourceAttribute)

    if (!inOperatorLink && isSelfLookup) {
      inOperatorLink = {
        targetAttribute: 'id',
        operator: '$eq',
        sourceAttribute: 'id',
      }
    }
  }

  qBuilder.andWhere(qbSub => {
    let subQuery

    if (qbSub.subQuery) {
      subQuery = qbSub.subQuery()
    }
    else {
      // typeorm cannot run subqueries on delete queries so we need to create a fresh query,
      // which will be injected in to the outer query and the end
      subQuery = qbSub.connection.manager.createQueryBuilder()
    }

    if (isGetMany && inOperatorLink) {
      const targetAttributeName = targetDataShaperMap[inOperatorLink.targetAttribute] || inOperatorLink.targetAttribute

      subQuery
        .select(targetAttributeName)
        .from(filter.entity, filter.entity)
    }
    else {
      subQuery
        .select('COUNT(*) > 0', 'found')
        .from(filter.entity, filter.entity)
    }

    const conditions = isGetMany && inOperatorLink
      ? filter.condition.filter(condition => condition !== inOperatorLink)
      : filter.condition


    conditions.map(({ targetAttribute, operator, sourceAttribute, value }) => {

      const targetAttributeName = targetDataShaperMap[targetAttribute] || targetAttribute

      if (sourceAttribute) {
        const sourceAttributeName = `${entityName}.${dataShaperMap[sourceAttribute] || sourceAttribute}`
        subQuery.andWhere(`${targetAttributeName} = ${sourceAttributeName}`)
      }
      else {
        buildWhereAttributeOperatorConditionQuery(subQuery, targetAttributeName, operator, value, _placeholderIdx)
      }
    })

    let query = subQuery.getQuery()

    if (isGetMany && inOperatorLink) {
      const sourceAttributeName = dataShaperMap[inOperatorLink.sourceAttribute] || inOperatorLink.sourceAttribute
      query = `${sourceAttributeName} IN ${query}`
    }

    // inject query params into outer query (as typeorm cannot run subqueries on delete queries)
    if (!qbSub.subQuery) {
      qbSub.setParameters(subQuery.getParameters());
    }

    return query
  })
}



export const buildWhereTypeQuery = (filter, entityName, modelRegistry, isGetMany, _placeholderIdx) => {
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
                const where = buildWhereTypeQuery(val, entityName, modelRegistry, isGetMany, placeholderIdx)
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
                  const where = buildWhereTypeQuery(val, entityName, modelRegistry, isGetMany, placeholderIdx)
                  if (where) {
                    qbOr.orWhere(where)
                  }
                })
              })

              qbAnd.andWhere(orBrackets)
            }

          }
          else if (key === '$sub') {
            buildWhereTypeSubQuery(qbAnd, newFilter, entityName, modelRegistry, isGetMany, _placeholderIdx)
          }
          else if (key === '$not') {

            if (!isMap(newFilter)) {
              throw new Error('$not expects a filter')
            }

            if (isMap(newFilter, true)) {
              const where = buildWhereTypeQuery(newFilter, entityName, modelRegistry, isGetMany, placeholderIdx)
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


export const buildWhereQuery = (qBuilder, filter, entityName, modelRegistry, isGetMany) => {

  if (!modelRegistry || !modelRegistry[entityName]) {
    throw new Error('buildWhereQuery() is missing a valid modelRegistry parameter')
  }

  const pureFilter = purifyFilter(filter)
  const where = buildWhereTypeQuery(pureFilter, entityName, modelRegistry, isGetMany)

  if (where) {
    qBuilder.andWhere(where)
  }
}
