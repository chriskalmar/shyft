
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
  addRelayTypePromoterToInstanceFn,
} from './util';


export const generateDataInput = (baseName, inputParams, singleParam) => {

  const protocolConfiguration = ProtocolGraphQL.getProtocolConfiguration()

  if (singleParam) {
    return generateDataInputField(inputParams, inputParams.name || '', baseName) // eslint-disable-line no-use-before-define
  }

  const dataInputType = new GraphQLInputObjectType({
    name: protocolConfiguration.generateDataInputTypeName(baseName),
    description: `Mutation data input type for **\`${baseName}\`**`,

    fields: () => {
      return generateDataInputFields(inputParams, baseName) // eslint-disable-line no-use-before-define
    }
  })

  return dataInputType
}


export const generateNestedDataInput = (baseName, nestedParam, nestedParamName, level = 1) => {

  const protocolConfiguration = ProtocolGraphQL.getProtocolConfiguration()

  const dataInputType = new GraphQLInputObjectType({
    name: protocolConfiguration.generateNestedDataInputTypeName(baseName, nestedParamName, level),
    description: nestedParam.description,

    fields: () => {
      const inputParams = nestedParam.getAttributes()
      return generateDataInputFields(inputParams, `${baseName}-${nestedParamName}`, level) // eslint-disable-line no-use-before-define
    }
  })

  return dataInputType
}


const generateDataInputField = (param, paramName, baseName, level = 0) => {

  let paramType = param.type
  let baseFieldType
  let isList = false

  if (!paramType) {
    throw new Error(`Param '${baseName}.${paramName}' in generateDataInputField() has no type`)
  }


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

  return {
    type: param.required && !param.defaultValue
      ? new GraphQLNonNull(fieldType)
      : fieldType,
    description: param.description,
  }
}


const generateDataInputFields = (inputParams, baseName, level = 0) => {
  const fields = {}

  _.forEach(inputParams, (param, paramName) => {
    fields[paramName] = generateDataInputField(param, paramName, baseName, level)
  });

  return fields
}



export const generateInput = (baseName, dataInputType, isField, includeClientMutationId=false) => {

  const protocolConfiguration = ProtocolGraphQL.getProtocolConfiguration()

  const inputType = new GraphQLInputObjectType({

    name: protocolConfiguration.generateInputTypeName(baseName),
    description: `Mutation input type for **\`${baseName}\`**`,

    fields: () => {
      const fields = {}
      if (includeClientMutationId) {
        fields.clientMutationId = {
          type: GraphQLString,
        }
      }

      if (dataInputType) {
        fields.data = isField
          ? dataInputType
          : {
            type: new GraphQLNonNull(dataInputType)
          }
      }

      return fields
    }
  })

  return inputType
}



export const generateDataOutput = (baseName, outputParams, graphRegistry, singleParam) => {

  const protocolConfiguration = ProtocolGraphQL.getProtocolConfiguration()

  if (singleParam) {
    return generateDataOutputField(outputParams, outputParams.name || '', baseName, graphRegistry) // eslint-disable-line no-use-before-define
  }

  const actionDataOutputType = new GraphQLObjectType({
    name: protocolConfiguration.generateDataOutPutTypeName(baseName),
    description: `Mutation data output type for **\`${baseName}\`**`,

    fields: () => {
      return generateDataOutputFields(outputParams, baseName, graphRegistry) // eslint-disable-line no-use-before-define
    }
  })

  return actionDataOutputType
}


export const generateNestedDataOutput = (baseName, nestedParam, nestedParamName, graphRegistry, level = 1) => {

  const protocolConfiguration = ProtocolGraphQL.getProtocolConfiguration()

  const dataOutputType = new GraphQLObjectType({
    name: protocolConfiguration.generateNestedDataOutPutTypeName(baseName, nestedParamName, level),
    description: nestedParam.description,

    fields: () => {
      const outputParams = nestedParam.getAttributes()
      return generateDataOutputFields(outputParams, `${baseName}-${nestedParamName}`, graphRegistry, level) // eslint-disable-line no-use-before-define
    }
  })

  return dataOutputType
}


const generateDataOutputField = (param, paramName, baseName, graphRegistry, level = 0) => {

  const protocolConfiguration = ProtocolGraphQL.getProtocolConfiguration()

  let paramType = param.type
  let baseFieldType
  let isList = false

  if (!paramType) {
    throw new Error(`Param '${baseName}.${paramName}' in generateDataOutputField() has no type`)
  }

  if (isListDataType(paramType)) {
    isList = true
    paramType = paramType.getItemType()
  }


  if (isObjectDataType(paramType)) {
    baseFieldType = generateNestedDataOutput(baseName, paramType, paramName, graphRegistry, level + 1)
  }
  else if (isEntity(paramType)) {
    const targetEntity = paramType

    const reference = {
      description: param.description,
    };

    const targetTypeName = targetEntity.graphql.typeName

    reference.type = graphRegistry.types[ targetTypeName ].type
    reference.resolve = (source, args, context) => {
      const referenceId = source[ paramName ]

      if (referenceId === null) {
        return Promise.resolve(null)
      }

      const storageType = targetEntity.storageType

      return storageType.findOne(targetEntity, referenceId, args, context)
        .then(
          addRelayTypePromoterToInstanceFn(
            protocolConfiguration.generateEntityTypeName(targetEntity)
          )
        )
        .then(targetEntity.graphql.dataShaper)
    }

    return reference
  }
  else {
    baseFieldType = ProtocolGraphQL.convertToProtocolDataType(paramType, baseName, false)
  }

  const fieldType = isList
    ? new GraphQLList(baseFieldType)
    : baseFieldType


  return {
    type: fieldType,
    description: param.description,
  }
}



const generateDataOutputFields = (outputParams, baseName, graphRegistry, level = 0) => {
  const fields = {}

  _.forEach(outputParams, (param, paramName) => {
    fields[paramName] = generateDataOutputField(param, paramName, baseName, graphRegistry, level)
  });

  return fields
}



export const generateOutput = (baseName, dataOutputType, isField, includeClientMutationId=false) => {

  const protocolConfiguration = ProtocolGraphQL.getProtocolConfiguration()

  const outputType = new GraphQLObjectType({
    name: protocolConfiguration.generateOutPutTypeName(baseName),
    description: `Mutation output type for **\`${baseName}\`**`,

    fields: () => {
      const fields = {}
      if (includeClientMutationId) {
        fields.clientMutationId = {
          type: GraphQLString,
        }
      }

      if (dataOutputType) {
        fields.result = isField
          ? dataOutputType
          : {
            type: dataOutputType
          }
      }

      return fields
    }
  })

  return outputType
}

