
import _ from 'lodash';

import {
  isObjectDataType,
  isListDataType,
} from 'shift-engine';



const validatePayload = (param, payload, source, context) => {

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
        validatePayload(attribute, payload[attributeName], source, context)
      })
    }

    if (isListDataType(param.type)) {
      payload.map(itemPayload => {
        if (isObjectDataType(paramType)) {
          const attributes = paramType.getAttributes()
          _.forEach(attributes, (attribute, attributeName) => {
            validatePayload(attribute, itemPayload[attributeName], source, context)
          })
        }
      })
    }

  }
}


  }
}


export const validateActionPayload = (param, payload, action, context) => {
  validatePayload(param, payload, { action }, context)
}

