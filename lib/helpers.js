import StorageTypePostgres from './StorageTypePostgres';
import { isEntity } from 'shift-engine';
import _ from 'lodash';


export const parseValues = (entity, data, context) => {

  if (!data) {
    return data
  }

  const entityAttributes = entity.getAttributes()

  _.forEach(entityAttributes, (attribute) => {
    const attributeName = attribute.name
    const value = data[ attributeName ]

    if (typeof value === 'undefined') {
      return
    }

    let attributeType

    if (isEntity(attribute.type)) {
      const primaryAttribute = attribute.type.getPrimaryAttribute()
      attributeType = primaryAttribute.type
    }
    else {
      attributeType = attribute.type
    }

    const storageDataType = StorageTypePostgres.convertToStorageDataType(attributeType)

    if (storageDataType.parse) {
      data[ attributeName ] = storageDataType.parse(value, data, entity, context)
    }
  })

  return data
}


export const parseValuesMap = (entity, rows, context) => {
  return rows.map(row => parseValues(entity, row, context))
}


export const serializeValues = (entity, mutation, data, context) => {

  const entityAttributes = entity.getAttributes()
  const mutationAttributes = mutation.attributes || []

  _.forEach(entityAttributes, (attribute) => {

    const attributeName = attribute.name
    const value = data[ attributeName ]

    let attributeType

    if (isEntity(attribute.type)) {
      const primaryAttribute = attribute.type.getPrimaryAttribute()
      attributeType = primaryAttribute.type
    }
    else {
      attributeType = attribute.type
    }

    const storageDataType = StorageTypePostgres.convertToStorageDataType(attributeType)

    if (!mutationAttributes.includes(attributeName) && !storageDataType.enforceSerialize) {
      return
    }

    if (storageDataType.serialize) {
      data[ attributeName ] = storageDataType.serialize(value, data, entity, mutation, context)
    }
  })

  return data
}

