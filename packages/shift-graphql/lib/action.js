
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


export const generateActions = (graphRegistry) => {

  const actions = {}

  _.forEach(graphRegistry.actions, ( { action }, actionName) => {

    const queryName = _.camelCase(actionName)

    let actionDataInputType
    let actionDataOutputType

    if (action.hasInputParams()) {
      actionDataInputType = generateDataInput(actionName, action.getInput(), true)
    }

    if (action.hasOutputParams()) {
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

