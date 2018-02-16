
import {
  passOrThrow,
  isMap,
  isArray,
  mapOverProperties,
} from './util';


const AND_OPERATOR = 'AND'
const OR_OPERATOR = 'OR'


export const splitAttributeAndFilterOperator = (str) => {

  let ret

  if (typeof str === 'string') {

    const splitPos = str.lastIndexOf('__')

    if (splitPos > 0) {
      const operator = str.substr(splitPos + 2)
      const attributeName = str.substring(0, splitPos)

      if (operator.length > 0 && attributeName.length > 0) {
        ret = {
          operator,
          attributeName,
        }
      }
    }
    else {
      ret = {
        attributeName: str,
      }
    }
  }

  passOrThrow(
    ret,
    () => {
      return `invalid filter '${str}'`
    }
  )

  return ret
}


export const processFilterLevel = (filters, attributes, path, storageType) => {

  const ret = {}

  passOrThrow(
    !path || isArray(path, true),
    () => {
      return 'optional path in processFilterLevel() needs to be an array'
    }
  )

  const errorLocation = path
    ? ` at '${path.join('.')}'`
    : ''

  passOrThrow(
    isMap(filters),
    () => `filter${errorLocation} needs to be an object of filter criteria`
  )

  passOrThrow(
    isMap(attributes, true),
    () => {
      return 'processFilterLevel() expects an attribute map'
    }
  )


  mapOverProperties(filters, (value, filter) => {

    if (filter === AND_OPERATOR || filter === OR_OPERATOR) {
      const logicalKey = `\$${filter.toLocaleLowerCase()}`
      const newPath = path
        ? path.slice()
        : []

      newPath.push(filter)

      ret[logicalKey] = value.map(newFilter => processFilterLevel(newFilter, attributes, path, storageType))

      return
    }

    const {
      operator,
      attributeName,
    } = splitAttributeAndFilterOperator(filter)

    const attribute = attributes[attributeName]

    passOrThrow(
      attribute,
      () => {
        return `Unknown attribute name '${attributeName}' used in filter${errorLocation}`
      }
    )


    if (operator) {

      ret[attributeName] = ret[attributeName] || {}

      passOrThrow(
        isMap(ret[attributeName]),
        () => {
          return `Cannot combine 'exact match' operator with other operators on attribute '${attributeName}' used in filter${errorLocation}`
        }
      )


      const storageDataType = storageType.convertToStorageDataType(attribute.type)

      passOrThrow(
        storageDataType.capabilities.indexOf(operator) >= 0,
        () => {
          return `Unknown or incompatible operator '${operator}' used on '${attributeName}' in filter${errorLocation}`
        }
      )

      const operatorKey = `\$${operator}`

      ret[attributeName][operatorKey] = value
    }
    else {

      passOrThrow(
        !isMap(ret[attributeName]),
        () => {
          return `Cannot combine 'exact match' operator with other operators on attribute '${attributeName}' used in filter${errorLocation}`
        }
      )

      ret[attributeName] = value
    }

  })

  return ret
}



export const processFilter = (entity, args, storageType) => {

  const {
    filter,
  } = args;


  if (!filter) {
    return {}
  }

  const where = {
    ...processFilterLevel(filter, entity.getAttributes(), null, storageType)
  }

  return where
}
