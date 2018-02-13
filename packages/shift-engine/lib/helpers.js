
import _ from 'lodash';


export const fillSystemAttributesDefaultValues = (entity, entityMutation, payload, context) => {

  const ret = {
    ...payload
  }

  const entityAttributes = entity.getAttributes()
  const systemAttributes = _.filter(
    entityAttributes,
    attribute => attribute.isSystemAttribute && attribute.defaultValue
  )

  systemAttributes.map((attribute) => {
    const attributeName = attribute.name
    const defaultValue = attribute.defaultValue

    const value = defaultValue(ret, entityMutation, entity, context)
    if (typeof value !== 'undefined') {
      ret[attributeName] = value
    }

  })

  return ret
}



export const fillDefaultValues = (entity, entityMutation, payload, context) => {

  const ret = {
    ...payload
  }

  const entityAttributes = entity.getAttributes()
  const requiredAttributes = _.filter(
    entityAttributes,
    attribute => attribute.required && !attribute.isSystemAttribute
  )

  requiredAttributes.map((attribute) => {
    const attributeName = attribute.name
    if (!entityMutation.attributes.includes(attributeName)) {
      if (attribute.defaultValue) {
        ret[attributeName] = attribute.defaultValue(ret, entityMutation, entity, context)
      }
    }
  })

  return ret
}


export const serializeValues = (entity, entityMutation, payload, context) => {

  const ret = {
    ...payload
  }

  const entityAttributes = entity.getAttributes()

  _.forEach(entityAttributes, (attribute) => {
    const attributeName = attribute.name
    if (attribute.serialize) {
      ret[attributeName] = attribute.serialize(ret[attributeName], ret, entityMutation, entity, context)
    }
  })

  return ret
}
