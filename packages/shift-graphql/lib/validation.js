
import _ from 'lodash';

import {
  isObjectDataType,
  isListDataType,
} from 'shift-engine';



export const validateActionPayload = (param, payload, context) => {

  if (typeof payload !== 'undefined') {
    const paramType = isListDataType(param.type)
      ? param.type.getItemType()
      : param.type

    const dataTypeValidator = isListDataType(param.type)
      ? param.type.validate
      : paramType.validate

    if (dataTypeValidator) {
      dataTypeValidator(payload, context)
    }

    if (isObjectDataType(paramType)) {
      const attributes = paramType.getAttributes()
      _.forEach(attributes, (attribute, attributeName) => {
        validateActionPayload(attribute, payload[attributeName], context)
      })
    }

    if (isListDataType(param.type)) {
      payload.map(itemPayload => {
        if (isObjectDataType(paramType)) {
          const attributes = paramType.getAttributes()
          _.forEach(attributes, (attribute, attributeName) => {
            validateActionPayload(attribute, itemPayload[attributeName], context)
          })
        }
      })
    }

  }
}

