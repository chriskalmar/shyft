
import {
  GraphQLNonNull,
} from 'graphql';

import _ from 'lodash';

import {
  generateInput,
  generateDataInput,
  generateOutput,
  generateDataOutput,
} from './io';

import {
  isObjectDataType,
  isListDataType,
  validateActionPayload,
} from 'shift-engine';



const fillSingleDefaultValues = async (param, payload, context) => {

  let ret = payload

  if (typeof payload === 'undefined') {
    if (param.required && param.defaultValue) {
      ret = param.defaultValue({}, context)
    }
  }

  if (isObjectDataType(param.type)) {
    const attributes = param.type.getAttributes()
    ret = fillNestedDefaultValues(attributes, ret, context) // eslint-disable-line no-use-before-define
  }

  if (isListDataType(param.type) && payload) {
    const paramType = param.type.getItemType()

    ret = await Promise.all(payload.map(async itemPayload => {

      if (isObjectDataType(paramType)) {
        const attributes = paramType.getAttributes()
        return fillNestedDefaultValues(attributes, itemPayload, context) // eslint-disable-line no-use-before-define
      }

      return await fillSingleDefaultValues(paramType, itemPayload, context)
    }))
  }

  return ret
}


const fillNestedDefaultValues = async (params, payload, context) => {

  const ret = {
    ...payload
  }

  const paramNames = Object.keys(params)
  await Promise.all(paramNames.map(async (paramName) => {
    const param = params[paramName]
    ret[paramName] = await fillSingleDefaultValues(param, ret[paramName], context)
  }))

  return ret
}


const fillDefaultValues = async (param, payload, context) => fillSingleDefaultValues(param, payload, context)



export const generateActions = (configuration, graphRegistry) => {

  const protocolConfiguration = configuration.getProtocolConfiguration()

  const actions = {}

  _.forEach(graphRegistry.actions, ( { action }, actionName) => {

    const queryName = protocolConfiguration.generateActionTypeName(action)

    let actionDataInputType
    let actionDataOutputType

    if (action.hasInput()) {
      actionDataInputType = generateDataInput(actionName, action.getInput(), true)
    }

    if (action.hasOutput()) {
      actionDataOutputType = generateDataOutput(actionName, action.getOutput(), graphRegistry, true)
    }

    const actionInputType = generateInput(actionName, actionDataInputType, true)
    const actionOutputType = generateOutput(actionName, actionDataOutputType, true)

    actions[ queryName ] = {
      type: actionOutputType,
      description: action.description,

      args: {
        input: {
          description: 'Input argument for this action',
          type: new GraphQLNonNull( actionInputType ),
        },
      },

      resolve: async (source, args, context, info) => {
        if (action.hasInput()) {
          const input = action.getInput()
          args.input.data = await fillDefaultValues(input, args.input.data, context)
          validateActionPayload(input, args.input.data, action, context)
        }

        const result = await action.resolve(source, args.input.data, context, info)
        return {
          result,
          clientMutationId: args.input.clientMutationId,
        }
      }
    }


  })


  return actions
}

