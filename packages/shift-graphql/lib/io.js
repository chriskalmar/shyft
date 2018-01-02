
import {
  GraphQLString,
  GraphQLNonNull,
  GraphQLInputObjectType,
  GraphQLObjectType,
  GraphQLList,
} from 'graphql';


import _ from 'lodash';

import ProtocolGraphQL from './ProtocolGraphQL';

import {
  isEntity,
  isObjectDataType,
  isListDataType,
} from 'shift-engine';

import {
  generateTypeNamePascalCase,
} from './util';



export const generateDataInput = (baseName, inputParams) => {

  const dataInputType = new GraphQLInputObjectType({
    name: generateTypeNamePascalCase(`${baseName}DataInput`),
    description: `Mutation data input type for **\`${baseName}\`**`,

    fields: () => {
      return generateDataInputFields(inputParams, baseName) // eslint-disable-line no-use-before-define
    }
  })

  return dataInputType
}


export const generateNestedDataInput = (baseName, nestedParam, nestedParamName, level = 1) => {

  const levelStr = level > 1
    ? `L${level}`
    : ''

  const dataInputType = new GraphQLInputObjectType({
    name: generateTypeNamePascalCase(`${baseName}-${nestedParamName}-${levelStr}DataInput`),
    description: nestedParam.description,

    fields: () => {
      const inputParams = nestedParam.getAttributes()
      return generateDataInputFields(inputParams, baseName, level) // eslint-disable-line no-use-before-define
    }
  })

  return dataInputType
}


const generateDataInputFields = (inputParams, baseName, level = 0) => {
  const fields = {}

  _.forEach(inputParams, (param, paramName) => {

    let paramType = param.type
    let baseFieldType
    let isList = false

    if (isListDataType(paramType)) {
      isList = true
      paramType = paramType.getItemType()
    }


    if (isObjectDataType(paramType)) {
      baseFieldType = generateNestedDataInput(baseName, paramType, paramName, level + 1)
    }
    else if (isEntity(paramType)) {
      const targetEntity = paramType
      const primaryAttribute = targetEntity.getPrimaryAttribute()
      baseFieldType = ProtocolGraphQL.convertToProtocolDataType(primaryAttribute.type, baseName, true)
    }
    else {
      baseFieldType = ProtocolGraphQL.convertToProtocolDataType(paramType, baseName, true)
    }

    const fieldType = isList
      ? new GraphQLList(baseFieldType)
      : baseFieldType


    fields[ paramName ] = {
      type: param.required
        ? new GraphQLNonNull(fieldType)
        : fieldType,
      description: param.description,
    }

  });

  return fields
}


export const generateInput = (baseName, dataInputType) => {

  const inputType = new GraphQLInputObjectType({

    name: generateTypeNamePascalCase(`${baseName}Input`),
    description: `Mutation input type for **\`${baseName}\`**`,

    fields: () => {
      const fields = {
        clientMutationId: {
          type: GraphQLString,
        }
      }

      if (dataInputType) {
        fields.data = {
          type: new GraphQLNonNull(dataInputType)
        }
      }

      return fields
    }
  })

  return inputType
}



export const generateDataOutput = (baseName, outputParams, graphRegistry) => {

  const actionDataOutputType = new GraphQLObjectType({
    name: generateTypeNamePascalCase(`${baseName}DataOutput`),
    description: `Mutation data output type for **\`${baseName}\`**`,

    fields: () => {
      return generateDataOutputFields(outputParams, baseName, graphRegistry) // eslint-disable-line no-use-before-define
    }
  })

  return actionDataOutputType
}


export const generateNestedDataOutput = (baseName, nestedParam, nestedParamName, graphRegistry, level = 1) => {

  const levelStr = level > 1
    ? `L${level}`
    : ''

  const dataOutputType = new GraphQLObjectType({
    name: generateTypeNamePascalCase(`${baseName}-${nestedParamName}-${levelStr}DataOutput`),
    description: nestedParam.description,

    fields: () => {
      const outputParams = nestedParam.getAttributes()
      return generateDataOutputFields(outputParams, baseName, graphRegistry, level) // eslint-disable-line no-use-before-define
    }
  })

  return dataOutputType
}


const generateDataOutputFields = (outputParams, baseName, graphRegistry, level = 0) => {
  const fields = {}

  _.forEach(outputParams, (param, paramName) => {

    let paramType = param.type
    let baseFieldType
    let isList = false

    if (isListDataType(paramType)) {
      isList = true
      paramType = paramType.getItemType()
    }


    if (isObjectDataType(paramType)) {
      baseFieldType = generateNestedDataOutput(baseName, paramType, paramName, graphRegistry, level + 1)
    }
    else if (isEntity(paramType)) {
      const targetEntity = paramType
      const targetTypeName = targetEntity.graphql.typeName
      baseFieldType = graphRegistry.types[ targetTypeName ]
    }
    else {
      baseFieldType = ProtocolGraphQL.convertToProtocolDataType(paramType, baseName, false)
    }

    const fieldType = isList
      ? new GraphQLList(baseFieldType)
      : baseFieldType


    fields[ paramName ] = {
      type: fieldType,
      description: param.description,
    }

  });

  return fields
}



export const generateOutput = (baseName, dataOutputType) => {

  const outputType = new GraphQLObjectType({

    name: generateTypeNamePascalCase(`${baseName}Output`),
    description: `Mutation output type for **\`${baseName}\`**`,

    fields: () => {
      const fields = {
        clientMutationId: {
          type: GraphQLString,
        }
      }

      if (dataOutputType) {
        fields.result = {
          type: dataOutputType
        }
      }

      return fields
    }
  })

  return outputType
}

