
import {
  GraphQLList,
  GraphQLNonNull,
  GraphQLInputObjectType,
} from 'graphql';

import _ from 'lodash';

import ProtocolGraphQL from './ProtocolGraphQL';

import {
  isEntity,
  constants,
  isComplexDataType,
  isArray,
  isMap,
} from 'shift-engine';


const {
  storageDataTypeCapabilities,
  storageDataTypeCapabilityType,
} = constants;

const AND_OPERATOR = 'AND'
const OR_OPERATOR = 'OR'
const logicalKeysMap = {
  [AND_OPERATOR]: '$and',
  [OR_OPERATOR]: '$or',
}

const DEEP_FILTER_OPERATOR = 'filter'


export const generateFilterInput = (entity, graphRegistry) => {

  const protocolConfiguration = ProtocolGraphQL.getProtocolConfiguration()
  const typeNamePluralListName = entity.graphql.typeNamePluralPascalCase

  const storageType = entity.storageType


  const filterInputTypeName = protocolConfiguration.generateFilterInputTypeName(entity)
  const entityFilterType = new GraphQLInputObjectType({
    name: filterInputTypeName,
    description: `Filter **\`${typeNamePluralListName}\`** by various criteria`,

    fields: () => {
      const fields = {
        [AND_OPERATOR]: {
          description: `Combine **\`${filterInputTypeName}\`** by a logical **AND**`,
          type: new GraphQLList( new GraphQLNonNull( entityFilterType )),
        },
        [OR_OPERATOR]: {
          description: `Combine **\`${filterInputTypeName}\`** by a logical **OR**`,
          type: new GraphQLList( new GraphQLNonNull( entityFilterType )),
        },
      }

      _.forEach(entity.getAttributes(), (attribute) => {

        let attributeType = attribute.type

        if (isComplexDataType(attributeType)) {
          return;
        }

        // it's a reference
        if (isEntity(attributeType)) {
          const targetEntity = attributeType
          const targetTypeName = targetEntity.graphql.typeName
          const targetRegistryType = graphRegistry.types[ targetTypeName ]
          const targetConnectionArgs = targetRegistryType.connectionArgs

          const fieldName = `${attribute.gqlFieldName}__${DEEP_FILTER_OPERATOR}`
          fields[ fieldName ] = targetConnectionArgs.filter

          const primaryAttribute = targetEntity.getPrimaryAttribute()
          attributeType = primaryAttribute.type
        }

        const fieldType = ProtocolGraphQL.convertToProtocolDataType(attributeType, entity.name, true)

        const storageDataType = storageType.convertToStorageDataType(attributeType)

        fields[ attribute.gqlFieldName ] = {
          type: fieldType,
        };

        storageDataType.capabilities.map(capability => {

          const fieldName = `${attribute.gqlFieldName}__${capability}`
          const field = {}

          if (storageDataTypeCapabilities[ capability ] === storageDataTypeCapabilityType.VALUE) {
            field.type = fieldType
          }
          else if (storageDataTypeCapabilities[ capability ] === storageDataTypeCapabilityType.LIST) {
            field.type = new GraphQLList( new GraphQLNonNull( fieldType ))
          }

          fields[ fieldName ] = field;
        })


      });

      return fields
    }
  })

  return {
    type: entityFilterType,
    description: 'Filter list by various criteria',
  }
}


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

  if(!ret) {
    throw new Error(`invalid filter '${str}'`)
  }

  return ret
}



export const transformFilterLevel = (filters = {}, attributes, path) => {

  const ret = {}

  if (path && !isArray(path, true)) {
    throw new Error('optional path in transformFilterLevel() needs to be an array')
  }


  const errorLocation = path
    ? ` at '${path.join('.')}'`
    : ''

  if (!isMap(filters)) {
    throw new Error(`filter${errorLocation} needs to be an object of filter criteria`)
  }


  if (!isMap(attributes, true)) {
    throw new Error('transformFilterLevel() expects an attribute map')
  }


  mapOverProperties(filters, (value, filter) => {

    if (filter === AND_OPERATOR || filter === OR_OPERATOR) {
      const logicalKey = logicalKeysMap[filter]
      const newPath = path
        ? path.slice()
        : []

      newPath.push(filter)

      ret[logicalKey] = value.map(newFilter => transformFilterLevel(newFilter, attributes, path))

      return
    }

    const {
      operator,
      attributeName,
    } = splitAttributeAndFilterOperator(filter)

    let attribute
    const attributesNames = Object.keys(attributes)

    attributesNames.find(name => {
      const { gqlFieldName } = attributes[name]

      if (attributeName === gqlFieldName) {
        attribute = attributes[name]
      }
    })


    if (!attribute) {
      throw new Error(`Unknown attribute name '${attributeName}' used in filter${errorLocation}`)
    }

    const realAttributeName = attribute.name

    if (operator) {
      ret[realAttributeName] = ret[realAttributeName] || {}

      if (!isMap(ret[realAttributeName])) {
        throw new Error(`Cannot combine 'exact match' operator with other operators on attribute '${attributeName}' used in filter${errorLocation}`)
      }

      const operatorKey = `\$${operator}`
      ret[realAttributeName][operatorKey] = value
    }
    else {
      if (isMap(ret[realAttributeName])) {
        throw new Error(`Cannot combine 'exact match' operator with other operators on attribute '${attributeName}' used in filter${errorLocation}`)
      }

      ret[realAttributeName] = value
    }

  })

  return ret
}
