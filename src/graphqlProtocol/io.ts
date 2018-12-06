import {
  GraphQLString,
  GraphQLNonNull,
  GraphQLInputObjectType,
  GraphQLObjectType,
  GraphQLList,
} from 'graphql';

import * as _ from 'lodash';

import { ProtocolGraphQL } from './ProtocolGraphQL';
import { resolveByFindOne } from './resolver';
import { isEntity } from '../engine/entity/Entity';
import { isObjectDataType } from '../engine/datatype/ObjectDataType';
import { isListDataType } from '../engine/datatype/ListDataType';
import { isArray } from '../engine/util';

export const generateDataInput = (baseName, inputParams, singleParam) => {
  const protocolConfiguration = ProtocolGraphQL.getProtocolConfiguration();

  if (singleParam) {
    // eslint-disable-next-line no-use-before-define
    return generateDataInputField(
      inputParams,
      inputParams.name || '',
      baseName,
    ); // eslint-disable-line no-use-before-define
  }

  const dataInputType = new GraphQLInputObjectType({
    name: protocolConfiguration.generateDataInputTypeName(baseName),
    description: `Mutation data input type for **\`${baseName}\`**`,

    fields: () => {
      return generateDataInputFields(inputParams, baseName); // eslint-disable-line no-use-before-define
    },
  });

  return dataInputType;
};

export const generateNestedDataInput = (
  baseName,
  nestedParam,
  nestedParamName,
  level = 1,
) => {
  const protocolConfiguration = ProtocolGraphQL.getProtocolConfiguration();

  const dataInputType = new GraphQLInputObjectType({
    name: protocolConfiguration.generateNestedDataInputTypeName(
      baseName,
      nestedParamName,
      level,
    ),
    description: nestedParam.description,

    fields: () => {
      const inputParams = nestedParam.getAttributes();
      // eslint-disable-next-line no-use-before-define
      return generateDataInputFields(
        inputParams,
        `${baseName}-${nestedParamName}`,
        level,
      ); // eslint-disable-line no-use-before-define
    },
  });

  return dataInputType;
};

const generateDataInputField = (param, paramName, baseName, level = 0) => {
  let paramType = param.type;
  let baseFieldType;
  let isList = false;

  if (!paramType) {
    throw new Error(
      `Param '${baseName}.${paramName}' in generateDataInputField() has no type`,
    );
  }

  if (isListDataType(paramType)) {
    isList = true;
    paramType = paramType.getItemType();
  }

  if (isObjectDataType(paramType)) {
    baseFieldType = generateNestedDataInput(
      baseName,
      paramType,
      paramName,
      level + 1,
    );
  }
  else if (isEntity(paramType)) {
    const targetEntity = paramType;
    const primaryAttribute = targetEntity.getPrimaryAttribute();
    baseFieldType = ProtocolGraphQL.convertToProtocolDataType(
      primaryAttribute.type,
      baseName,
      true,
    );
  }
  else {
    baseFieldType = ProtocolGraphQL.convertToProtocolDataType(
      paramType,
      baseName,
      true,
    );
  }

  const fieldType = isList ? new GraphQLList(baseFieldType) : baseFieldType;

  return {
    type:
      param.required && !param.defaultValue
        ? new GraphQLNonNull(fieldType)
        : fieldType,
    description: param.description,
  };
};

const generateDataInputFields = (inputParams, baseName, level = 0) => {
  const fields = {};

  _.forEach(inputParams, (param, paramName) => {
    fields[paramName] = generateDataInputField(
      param,
      paramName,
      baseName,
      level,
    );
  });

  return fields;
};

export const generateInput = (
  baseName,
  dataInputType,
  isField,
  includeClientMutationId = false,
) => {
  const protocolConfiguration = ProtocolGraphQL.getProtocolConfiguration();

  const inputType = new GraphQLInputObjectType({
    name: protocolConfiguration.generateInputTypeName(baseName),
    description: `Mutation input type for **\`${baseName}\`**`,

    fields: () => {
      const fields = {};
      if (includeClientMutationId) {
        fields.clientMutationId = {
          type: GraphQLString,
        };
      }

      if (dataInputType) {
        fields.data = isField
          ? dataInputType
          : {
            type: new GraphQLNonNull(dataInputType),
          };
      }

      return fields;
    },
  });

  return inputType;
};

export const generateDataOutput = (
  baseName,
  outputParams,
  graphRegistry,
  singleParam,
) => {
  const protocolConfiguration = ProtocolGraphQL.getProtocolConfiguration();

  if (singleParam) {
    // eslint-disable-next-line no-use-before-define
    return generateDataOutputField(
      outputParams,
      outputParams.name || '',
      baseName,
      graphRegistry,
    ); // eslint-disable-line no-use-before-define
  }

  const actionDataOutputType = new GraphQLObjectType({
    name: protocolConfiguration.generateDataOutPutTypeName(baseName),
    description: `Mutation data output type for **\`${baseName}\`**`,

    fields: () => {
      return generateDataOutputFields(outputParams, baseName, graphRegistry); // eslint-disable-line no-use-before-define
    },
  });

  return actionDataOutputType;
};

export const generateNestedDataOutput = (
  baseName,
  nestedParam,
  nestedParamName,
  graphRegistry,
  level = 1,
) => {
  const protocolConfiguration = ProtocolGraphQL.getProtocolConfiguration();

  const dataOutputType = new GraphQLObjectType({
    name: protocolConfiguration.generateNestedDataOutPutTypeName(
      baseName,
      nestedParamName,
      level,
    ),
    description: nestedParam.description,

    fields: () => {
      const outputParams = nestedParam.getAttributes();
      // eslint-disable-next-line no-use-before-define
      return generateDataOutputFields(
        outputParams,
        `${baseName}-${nestedParamName}`,
        graphRegistry,
        level,
      ); // eslint-disable-line no-use-before-define
    },
  });

  return dataOutputType;
};

const wrapFieldInFieldName = (fieldName, field) => {
  return {
    [fieldName]: field,
  };
};

const generateDataOutputField = (
  param,
  paramName,
  baseName,
  graphRegistry,
  level = 0,
  returnAsFieldNameMap = false,
) => {
  const protocolConfiguration = ProtocolGraphQL.getProtocolConfiguration();

  let paramType = param.type;
  let baseFieldType;
  let isList = false;

  if (!paramType) {
    throw new Error(
      `Param '${baseName}.${paramName}' in generateDataOutputField() has no type`,
    );
  }

  if (isListDataType(paramType)) {
    isList = true;
    paramType = paramType.getItemType();
  }

  if (isObjectDataType(paramType)) {
    baseFieldType = generateNestedDataOutput(
      baseName,
      paramType,
      paramName,
      graphRegistry,
      level + 1,
    );
  }
  else if (isEntity(paramType)) {
    if (!returnAsFieldNameMap) {
      throw new Error(
        `Param '${baseName}.${paramName}' in generateDataOutputField() needs to return multiple fields but returnAsFieldNameMap is set to false`,
      );
    }

    const result = {};
    const targetEntity = paramType;

    const targetTypeName = targetEntity.graphql.typeName;
    const primaryAttribute = targetEntity.getPrimaryAttribute();

    const simpleFieldType = ProtocolGraphQL.convertToProtocolDataType(
      primaryAttribute.type,
      baseName,
      false,
    );

    const simpleField = {
      description: param.description,
      type: simpleFieldType,
    };

    if (isList) {
      const simpleFieldList = {
        type: new GraphQLList(simpleFieldType),
      };

      result[paramName] = simpleFieldList;
    }
    else {
      result[paramName] = simpleField;
    }

    const referenceField = {
      description: param.description,
      type: graphRegistry.types[targetTypeName].type,
    };

    referenceField.resolve = resolveByFindOne(
      targetEntity,
      ({ source }) => source[paramName],
    );

    if (isList) {
      const referenceFieldList = {
        type: new GraphQLList(referenceField.type),
        resolve: (source, args, context) => {
          const referenceIds = source[paramName];

          if (!isArray(referenceIds)) {
            return Promise.resolve(null);
          }

          return referenceIds.map(referenceId => {
            return referenceField.resolve(
              { [paramName]: referenceId },
              args,
              context,
            );
          });
        },
      };

      const referenceFieldListName = protocolConfiguration.generateReferenceFieldListName(
        targetEntity,
        { name: paramName },
      );

      result[referenceFieldListName] = referenceFieldList;
    }
    else {
      const referenceFieldName = protocolConfiguration.generateReferenceFieldName(
        targetEntity,
        { name: paramName },
      );

      result[referenceFieldName] = referenceField;
    }

    return result;
  }
  else {
    baseFieldType = ProtocolGraphQL.convertToProtocolDataType(
      paramType,
      baseName,
      false,
    );
  }

  const fieldType = isList ? new GraphQLList(baseFieldType) : baseFieldType;

  const field = {
    type: fieldType,
    description: param.description,
  };

  if (param.resolve) {
    field.resolve = param.resolve;
  }

  return returnAsFieldNameMap ? wrapFieldInFieldName(paramName, field) : field;
};

const generateDataOutputFields = (
  outputParams,
  baseName,
  graphRegistry,
  level = 0,
) => {
  let fields = {};

  _.forEach(outputParams, (param, paramName) => {
    fields = {
      ...fields,
      ...generateDataOutputField(
        param,
        paramName,
        baseName,
        graphRegistry,
        level,
        true,
      ),
    };
  });

  return fields;
};

export const generateOutput = (
  baseName,
  dataOutputType,
  isField,
  includeClientMutationId = false,
) => {
  const protocolConfiguration = ProtocolGraphQL.getProtocolConfiguration();

  const outputType = new GraphQLObjectType({
    name: protocolConfiguration.generateOutPutTypeName(baseName),
    description: `Mutation output type for **\`${baseName}\`**`,

    fields: () => {
      const fields = {};
      if (includeClientMutationId) {
        fields.clientMutationId = {
          type: GraphQLString,
        };
      }

      if (dataOutputType) {
        fields.result = isField
          ? dataOutputType
          : {
            type: dataOutputType,
          };
      }

      return fields;
    },
  });

  return outputType;
};
