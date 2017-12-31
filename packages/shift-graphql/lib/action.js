
import {
  GraphQLString,
  GraphQLNonNull,
  GraphQLInputObjectType,
  GraphQLObjectType,
} from 'graphql';


import _ from 'lodash';

import ProtocolGraphQL from './ProtocolGraphQL';

import {
  isEntity,
  isObjectDataType,
} from 'shift-engine';

import {
  generateTypeNamePascalCase,
} from './util';



export const generateActionDataInput = (action) => {

  const actionDataInputType = new GraphQLInputObjectType({
    name: generateTypeNamePascalCase(`${action.name}DataInput`),
    description: `Mutation data input type for action **\`${action.name}\`**`,

    fields: () => {
      const inputParams = action.getInput()
      return generateActionDataInputFields(inputParams, action) // eslint-disable-line no-use-before-define
    }
  })

  return actionDataInputType
}


export const generateNestedActionDataInput = (action, nestedParam, nestedParamName, level=1) => {

  const levelStr = level > 1
    ? `L${level}`
    : ''

  const actionDataInputType = new GraphQLInputObjectType({
    name: generateTypeNamePascalCase(`${action.name}-${nestedParamName}-${levelStr}DataInput`),
    description: nestedParam.description,

    fields: () => {
      const inputParams = nestedParam.getAttributes()
      return generateActionDataInputFields(inputParams, action, level) // eslint-disable-line no-use-before-define
    }
  })

  return actionDataInputType
}


const generateActionDataInputFields = (inputParams, action, level=0) => {
  const fields = {}

  _.forEach(inputParams, (param, paramName) => {

    if (isObjectDataType(param.type)) {
      const nestedActionDataInput = generateNestedActionDataInput(action, param.type, paramName, level + 1)

      fields[ paramName ] = {
        type: param.required
          ? new GraphQLNonNull(nestedActionDataInput)
          : nestedActionDataInput,
        description: param.description,
      }

      return
    }

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
        : fieldType,
      description: param.description,
    }

  });

  return fields
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



export const generateActionDataOutput = (action, graphRegistry) => {

  const actionDataOutputType = new GraphQLObjectType({
    name: generateTypeNamePascalCase(`${action.name}DataOutput`),
    description: `Mutation data output type for action **\`${action.name}\`**`,

    fields: () => {
      const outputParams = action.getOutput()
      return generateActionDataOutputFields(outputParams, action, graphRegistry) // eslint-disable-line no-use-before-define
    }
  })

  return actionDataOutputType
}


export const generateNestedActionDataOutput = (action, nestedParam, graphRegistry, level=1) => {

  const levelStr = level > 1
    ? `L${level}`
    : ''

  const actionDataOutputType = new GraphQLObjectType({
    name: generateTypeNamePascalCase(`${action.name}-${nestedParam.name}-${levelStr}DataOutput`),
    description: nestedParam.description,

    fields: () => {
      const outputParams = nestedParam.getAttributes()
      return generateActionDataOutputFields(outputParams, action, graphRegistry, level) // eslint-disable-line no-use-before-define
    }
  })

  return actionDataOutputType
}


const generateActionDataOutputFields = (outputParams, action, graphRegistry, level=0) => {
  const fields = {}

  _.forEach(outputParams, (param, paramName) => {

    if (isObjectDataType(param.type)) {

      const nestedActionDataOutput = generateNestedActionDataOutput(action, param.type, graphRegistry, level + 1)

      fields[ paramName ] = {
        type: nestedActionDataOutput,
        description: param.description,
      }

      return
    }

    const paramType = param.type
    let fieldType

    if (isEntity(paramType)) {
      const targetEntity = paramType
      const targetTypeName = targetEntity.graphql.typeName
      const registryType = graphRegistry.types[ targetTypeName ]

      fieldType = registryType.type
    }
    else {
      fieldType = ProtocolGraphQL.convertToProtocolDataType(paramType)
    }



    fields[ paramName ] = {
      type: fieldType,
      description: param.description,
    }

  });

  return fields
}



export const generateActionOutput = (action, actionDataOutputType) => {

  const actionOutputType = new GraphQLObjectType({

    name: generateTypeNamePascalCase(`${action.name}Output`),
    description: `Mutation output type for action **\`${action.name}\`**`,

    fields: () => {
      const fields = {
        clientMutationId: {
          type: GraphQLString,
        }
      }

      if (actionDataOutputType) {
        fields.result = {
          type: actionDataOutputType
        }
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
    let actionDataOutputType

    if (action.hasInputParams()) {
      actionDataInputType = generateActionDataInput(action, graphRegistry)
    }

    if (action.hasOutputParams()) {
      actionDataOutputType = generateActionDataOutput(action, graphRegistry)
    }

    const actionInputType = generateActionInput(action, actionDataInputType)
    const actionOutputType = generateActionOutput(action, actionDataOutputType)

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

