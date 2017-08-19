
import {
  GraphQLString,
  GraphQLNonNull,
  GraphQLInputObjectType,
  GraphQLObjectType,
} from 'graphql';

import { GraphQLJSON } from './dataTypes';

import _ from 'lodash';

import ProtocolGraphQL from './ProtocolGraphQL';

import {
  isEntity,
} from 'shift-engine';

import {
  generateTypeNamePascalCase,
} from './util';


export const generateActionDataInput = (action) => {

  const actionDataInputType = new GraphQLInputObjectType({
    name: generateTypeNamePascalCase(`${action.name}DataInput`),
    description: `Mutation data input type for action **\`${action.name}\`**`,

    fields: () => {
      const fields = {}

      const inputParams = action.getInput()

      _.forEach(inputParams, (param, paramName) => {

        let paramType = param.type

        // it's a reference
        if (isEntity(paramType)) {
          const targetEntity = paramType
          const primaryAttribute = targetEntity.getPrimaryAttribute()
          paramType = primaryAttribute.type
        }

        const fieldType = ProtocolGraphQL.convertToProtocolDataType(paramType)

        fields[ paramName ] = {
          type: param.required
            ? new GraphQLNonNull(fieldType)
            : fieldType
        }

      });

      return fields
    }
  })

  return actionDataInputType
}



export const generateActionInput = (action, actionDataInputType) => {

  const actionInputType = new GraphQLInputObjectType({

    name: generateTypeNamePascalCase(`${action.name}Input`),
    description: `Mutation input type for action **\`${action.name}\`**`,

    fields: () => {
      const fields = {
        clientMutationId: {
          type: GraphQLString,
        }
      }

      if (actionDataInputType) {
        fields.data = {
          type: new GraphQLNonNull( actionDataInputType )
        }
      }

      return fields
    }
  })

  return actionInputType
}



export const generateActionOutput = (action) => {

  const actionOutputType = new GraphQLObjectType({

    name: generateTypeNamePascalCase(`${action.name}Output`),
    description: `Mutation output type for action **\`${action.name}\`**`,

    fields: () => {
      const fields = {
        clientMutationId: {
          type: GraphQLString,
        }
      }

      fields.result = {
        type: new GraphQLNonNull( GraphQLJSON )
      }

      return fields
    }
  })

  return actionOutputType
}



export const generateActions = (graphRegistry) => {

  const actions = {}

  _.forEach(graphRegistry.actions, ( { action }, actionName) => {

    const queryName = _.camelCase(actionName)

    let actionDataInputType

    if (action.hasInputParams()) {
      actionDataInputType = generateActionDataInput(action)
    }

    const actionInputType = generateActionInput(action, actionDataInputType)
    const actionOutputType = generateActionOutput(action)

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

