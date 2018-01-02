
import {
  ProtocolType,
  DataTypeID,
  DataTypeInteger,
  DataTypeBigInt,
  DataTypeFloat,
  DataTypeBoolean,
  DataTypeString,
  DataTypeJson,
  DataTypeTimestamp,
  DataTypeTimestampTz,
  DataTypeDate,
  isDataTypeState,
  isDataTypeEnum,
  isObjectDataType,
} from 'shift-engine';

import {
  GraphQLScalarType,
  GraphQLID,
  GraphQLInt,
  GraphQLFloat,
  GraphQLString,
  GraphQLBoolean,
  GraphQLEnumType,
} from 'graphql';

import {
  GraphQLBigInt,
  GraphQLJSON,
  GraphQLDateTime,
  GraphQLDate,
} from './dataTypes';

import {
  generateDataInput,
  generateDataOutput,
 } from './io';



export const ProtocolGraphQL = new ProtocolType({
  name: 'ProtocolGraphQL',
  description: 'GraphQL API protocol',
  isProtocolDataType(protocolDataType) {
    return (protocolDataType instanceof GraphQLScalarType)
  }
})

export default ProtocolGraphQL


ProtocolGraphQL.addDataTypeMap(DataTypeID, GraphQLID);
ProtocolGraphQL.addDataTypeMap(DataTypeInteger, GraphQLInt);
ProtocolGraphQL.addDataTypeMap(DataTypeBigInt, GraphQLBigInt);
ProtocolGraphQL.addDataTypeMap(DataTypeFloat, GraphQLFloat);
ProtocolGraphQL.addDataTypeMap(DataTypeBoolean, GraphQLBoolean);
ProtocolGraphQL.addDataTypeMap(DataTypeString, GraphQLString);
ProtocolGraphQL.addDataTypeMap(DataTypeJson, GraphQLJSON);
ProtocolGraphQL.addDataTypeMap(DataTypeTimestamp, GraphQLDateTime);
ProtocolGraphQL.addDataTypeMap(DataTypeTimestampTz, GraphQLDateTime);
ProtocolGraphQL.addDataTypeMap(DataTypeDate, GraphQLDate);


const enumDataTypesRegistry = {}


ProtocolGraphQL.addDynamicDataTypeMap(isDataTypeState, (attributeType) => {

  const name = attributeType.name
  const values = {}

  if (enumDataTypesRegistry[name]) {
    if (attributeType === enumDataTypesRegistry[name].attributeType) {
      return enumDataTypesRegistry[name].type
    }
  }

  const states = attributeType.states
  const stateNames = Object.keys(states)
  stateNames.map(stateName => {
    values[ stateName ] = {
      value: states[ stateName ]
    }
  })

  const type = new GraphQLEnumType({
    name,
    values,
  })

  enumDataTypesRegistry[name] = {
    type,
    attributeType,
  }

  return type
})



ProtocolGraphQL.addDynamicDataTypeMap(isDataTypeEnum, (attributeType) => {

  const name = attributeType.name
  const values = {}

  if (enumDataTypesRegistry[ name ]) {
    if (attributeType === enumDataTypesRegistry[ name ].attributeType) {
      return enumDataTypesRegistry[ name ].type
    }
  }

  attributeType.values.map(value => {
    values[ value ] = {
      value
    }
  })


  const type = new GraphQLEnumType({
    name,
    values,
  })

  enumDataTypesRegistry[ name ] = {
    type,
    attributeType,
  }

  return type
});


const dataTypesRegistry = {
  object: {},
}


ProtocolGraphQL.addDynamicDataTypeMap(isObjectDataType, (attributeType, asInput) => {

  const name = attributeType.name
  const uniqueName = `${name}-${asInput ? 'Input' : 'Output' }`

  if (asInput) {
    if (!dataTypesRegistry.object[ uniqueName ]) {
      const dataInputType = generateDataInput(name, attributeType.getAttributes())
      dataTypesRegistry.object[ uniqueName ] = dataInputType
    }

    return dataTypesRegistry.object[ uniqueName ]
  }


  if (!dataTypesRegistry.object[ uniqueName ]) {
    const dataOutputType = generateDataOutput(name, attributeType.getAttributes())
    dataTypesRegistry.object[ uniqueName ] = dataOutputType
  }

  return dataTypesRegistry.object[ uniqueName ]
});


