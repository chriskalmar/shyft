import {
  GraphQLScalarType,
  GraphQLID,
  GraphQLInt,
  GraphQLInputObjectType,
  GraphQLObjectType,
  GraphQLFloat,
  GraphQLString,
  GraphQLBoolean,
  GraphQLEnumType,
} from 'graphql';

import { ProtocolType } from '../engine/protocol/ProtocolType';
import {
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
  DataTypeTime,
  DataTypeTimeTz,
  DataTypeUUID,
  DataTypeI18n,
} from '../engine/datatype/dataTypes';

import { isDataTypeState } from '../engine/datatype/DataTypeState';
import { isDataTypeEnum } from '../engine/datatype/DataTypeEnum';
import { isObjectDataType } from '../engine/datatype/ObjectDataType';
import { isListDataType } from '../engine/datatype/ListDataType';

import { graphRegistry } from './graphRegistry';

import {
  GraphQLBigInt,
  GraphQLJSON,
  GraphQLDateTime,
  GraphQLDate,
  GraphQLTime,
} from './dataTypes';

import { generateDataInput, generateDataOutput } from './io';

export const ProtocolGraphQL = new ProtocolType({
  name: 'ProtocolGraphQL',
  description: 'GraphQL API protocol',
  isProtocolDataType(protocolDataType) {
    return protocolDataType instanceof GraphQLScalarType;
  },
});

ProtocolGraphQL.addDataTypeMap(DataTypeID, GraphQLID);
ProtocolGraphQL.addDataTypeMap(DataTypeInteger, GraphQLInt);
ProtocolGraphQL.addDataTypeMap(DataTypeBigInt, GraphQLBigInt);
ProtocolGraphQL.addDataTypeMap(DataTypeFloat, GraphQLFloat);
ProtocolGraphQL.addDataTypeMap(DataTypeBoolean, GraphQLBoolean);
ProtocolGraphQL.addDataTypeMap(DataTypeString, GraphQLString);
ProtocolGraphQL.addDataTypeMap(DataTypeJson, GraphQLJSON);
ProtocolGraphQL.addDataTypeMap(DataTypeTimestamp, GraphQLDateTime);
ProtocolGraphQL.addDataTypeMap(DataTypeTimestampTz, GraphQLDateTime);
ProtocolGraphQL.addDataTypeMap(DataTypeTime, GraphQLTime);
ProtocolGraphQL.addDataTypeMap(DataTypeTimeTz, GraphQLTime);
ProtocolGraphQL.addDataTypeMap(DataTypeDate, GraphQLDate);
ProtocolGraphQL.addDataTypeMap(DataTypeUUID, GraphQLID);
ProtocolGraphQL.addDataTypeMap(DataTypeI18n, GraphQLJSON);

const dataTypesRegistry = {
  object: {},
  enum: {},
};

ProtocolGraphQL.addDynamicDataTypeMap(isDataTypeState, attributeType => {
  const name = attributeType.name;
  const values = {};

  if (dataTypesRegistry.enum[name]) {
    if (attributeType === dataTypesRegistry.enum[name].attributeType) {
      return dataTypesRegistry.enum[name].type;
    }
  }

  const states = attributeType.states;
  const stateNames = Object.keys(states);
  stateNames.map(stateName => {
    values[stateName] = {
      value: states[stateName],
    };
  });

  const type = new GraphQLEnumType({
    name,
    values,
  });

  dataTypesRegistry.enum[name] = {
    type,
    attributeType,
  };

  return type;
});

ProtocolGraphQL.addDynamicDataTypeMap(isDataTypeEnum, attributeType => {
  const name = attributeType.name;
  const values = {};

  if (dataTypesRegistry.enum[name]) {
    if (attributeType === dataTypesRegistry.enum[name].attributeType) {
      return dataTypesRegistry.enum[name].type;
    }
  }

  const enumValues = attributeType.values;
  const enumValuesNames = Object.keys(enumValues);
  enumValuesNames.map(valueName => {
    values[valueName] = {
      value: enumValues[valueName],
    };
  });

  const type = new GraphQLEnumType({
    name,
    values,
  });

  dataTypesRegistry.enum[name] = {
    type,
    attributeType,
  };

  return type;
});

ProtocolGraphQL.addDynamicDataTypeMap(
  isObjectDataType,
  (attributeType, sourceName, asInput) => {
    const name = attributeType.name;
    const uniqueName = `${name}-${sourceName}-${asInput ? 'Input' : 'Output'}`;

    if (asInput) {
      if (!dataTypesRegistry.object[uniqueName]) {
        const dataInputType = generateDataInput(
          `${sourceName}-${name}`,
          attributeType.getAttributes(),
        );
        dataTypesRegistry.object[uniqueName] = dataInputType;
      }

      return dataTypesRegistry.object[uniqueName];
    }

    if (!dataTypesRegistry.object[uniqueName]) {
      const dataOutputType = generateDataOutput(
        `${sourceName}-${name}`,
        attributeType.getAttributes(),
        graphRegistry,
      );
      dataTypesRegistry.object[uniqueName] = dataOutputType;
    }

    return dataTypesRegistry.object[uniqueName];
  },
);

ProtocolGraphQL.addDynamicDataTypeMap(
  isListDataType,
  (attributeType, sourceName, asInput) => {
    const name = attributeType.name;
    const uniqueName = `${name}-${sourceName}-${asInput ? 'Input' : 'Output'}`;

    // hack: wrap list type into an object data type and extract later that single field
    // to reuse the same input / ouput logic as with object data types
    const params = {
      wrapped: {
        type: attributeType,
      },
    };

    if (asInput) {
      if (!dataTypesRegistry.object[uniqueName]) {
        const dataInputType = generateDataInput(
          `${sourceName}-${name}`,
          params,
        ) as GraphQLInputObjectType;
        dataTypesRegistry.object[
          uniqueName
        ] = dataInputType.getFields().wrapped.type;
      }

      return dataTypesRegistry.object[uniqueName];
    }

    if (!dataTypesRegistry.object[uniqueName]) {
      const dataOutputType = generateDataOutput(
        `${sourceName}-${name}`,
        params,
        graphRegistry,
      ) as GraphQLObjectType;
      dataTypesRegistry.object[
        uniqueName
      ] = dataOutputType.getFields().wrapped.type;
    }

    return dataTypesRegistry.object[uniqueName];
  },
);
