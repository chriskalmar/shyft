
import _ from 'lodash';

import {
  isObjectDataType,
  isListDataType,
  isComplexDataType,
  isMap,
} from 'shift-engine';


const validateDataTypePayload = (paramType, payload, context) => {
  const dataTypeValidator = paramType.validate

  if (dataTypeValidator) {
    dataTypeValidator(payload, context)
  }
}


const validatePayload = (param, payload, source, context) => {

  if (typeof payload !== 'undefined') {

    const paramName = param.name

    const paramType = isListDataType(param.type)
      ? param.type.getItemType()
      : param.type

    validateDataTypePayload(param.type, payload[paramName], context)

    if (isObjectDataType(paramType)) {
      const attributes = paramType.getAttributes()
      _.forEach(attributes, (attribute) => {
        validatePayload(attribute, payload[paramName], source, context)
      })
    }

    if (isListDataType(param.type)) {
      const payloadList = payload[paramName]

      if (typeof payloadList !== 'undefined') {
        payloadList.map(itemPayload => {

          if (isObjectDataType(paramType)) {
            validateDataTypePayload(paramType, itemPayload, context)

            const attributes = paramType.getAttributes()
            _.forEach(attributes, (attribute) => {
              validatePayload(attribute, itemPayload, source, context)
            })
          }
        })
      }
    }

    if (!isComplexDataType(paramType)) {
      const attributeValidator = param.validate

      if (attributeValidator) {
        const attributeName = param.name
        const result = attributeValidator(payload[attributeName], payload, source, context)
        if (result instanceof Error) {
          throw result
        }
      }
    }

  }
}


export const validateActionPayload = (param, payload, action, context) => {
  const newParam = {
    ...param,
    name: 'input'
  }

  const newPayload = {
    input: {
      ...payload
    }
  }

  if (!isMap(payload)) {
    newPayload.input = payload
  }

  validatePayload(newParam, newPayload, { action }, context)
}


export const validateMutationPayload = (entity, mutation, payload, context) => {

  const attributes = entity.getAttributes()
  const systemAttributes = _.filter(
    attributes,
    attribute => attribute.isSystemAttribute && attribute.defaultValue
  ).map(attribute => attribute.name)

  const attributesToValidate = systemAttributes.concat(mutation.attributes || [])

  attributesToValidate.map(attributeName => {
    const attribute = attributes[attributeName]
    validatePayload(attribute, payload, { mutation, entity }, context)
  })
}

