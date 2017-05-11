
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
} from 'shift-engine';

import {
  GraphQLScalarType,
} from 'graphql';

import {
  GraphQLID,
  GraphQLInt,
  GraphQLFloat,
  GraphQLString,
  GraphQLBoolean,
} from 'graphql';

import {
  GraphQLBigInt,
  GraphQLJSON,
  GraphQLDateTime,
} from './dataTypes';



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
