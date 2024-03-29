import {
  GraphQLInputFieldConfig,
  GraphQLInputFieldConfigMap,
  GraphQLInputObjectType,
  GraphQLList,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLResolveInfo,
  GraphQLString,
} from 'graphql';
import * as _ from 'lodash';
import { Context } from '../engine/context/Context';
import { isListDataType } from '../engine/datatype/ListDataType';
import { isObjectDataType } from '../engine/datatype/ObjectDataType';
import { isEntity } from '../engine/entity/Entity';
import { isArray } from '../engine/util';
import { ProtocolGraphQL } from './ProtocolGraphQL';
import { ProtocolGraphQLConfiguration } from './ProtocolGraphQLConfiguration';
import { getRegisteredEntity } from './registry';
import { resolveByFindOne } from './resolver';
import {
  DataOutputField,
  InputFields,
  OutputFields,
  WrappedDataOutputField,
} from './types';

const generateDataInputField = (
  param,
  paramName,
  baseName,
  level = 0,
): GraphQLInputFieldConfigMap => {
  let paramType = param.type;
  let fieldName = paramName;
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
    // eslint-disable-next-line @typescript-eslint/no-use-before-define
    baseFieldType = generateNestedDataInput(
      baseName,
      paramType,
      paramName,
      level + 1,
    );
  } else if (isEntity(paramType)) {
    const targetEntity = paramType;
    const primaryAttribute = targetEntity.getPrimaryAttribute();
    baseFieldType = ProtocolGraphQL.convertToProtocolDataType(
      primaryAttribute.type,
      baseName,
      true,
    );
  } else if (param.i18n) {
    // const protocolConfiguration = ProtocolGraphQL.getProtocolConfiguration();
    const protocolConfiguration =
      ProtocolGraphQL.getProtocolConfiguration() as ProtocolGraphQLConfiguration;

    const languages = protocolConfiguration
      .getParentConfiguration()
      .getLanguages();

    param.gqlFieldNameI18n = protocolConfiguration.generateI18nFieldName(param);

    const i18nFieldTypeName =
      protocolConfiguration.generateOperationI18nAttributeInputTypeName(
        {
          name: baseName,
        },
        {
          name: paramName,
        },
        {
          name: level,
        },
      );

    const fieldType = ProtocolGraphQL.convertToProtocolDataType(
      paramType,
      baseName,
      true,
    );

    const i18nFieldType = new GraphQLInputObjectType({
      name: i18nFieldTypeName,
      description: `**\`${baseName}\`** action translations input type for **\`${param.gqlFieldNameI18n}\`**`,

      fields: () => {
        const i18nFields = {};

        languages.map((language, langIdx) => {
          const type =
            langIdx === 0 && param.required
              ? new GraphQLNonNull(fieldType)
              : fieldType;

          i18nFields[language] = {
            type,
          };
        });

        return i18nFields;
      },
    });

    baseFieldType = i18nFieldType;
    fieldName = param.gqlFieldNameI18n;
  } else {
    baseFieldType = ProtocolGraphQL.convertToProtocolDataType(
      paramType,
      baseName,
      true,
    );
  }

  const fieldType = isList ? new GraphQLList(baseFieldType) : baseFieldType;

  const field: GraphQLInputFieldConfig = {
    type:
      param.required && !param.defaultValue
        ? new GraphQLNonNull(fieldType)
        : fieldType,
    description: param.description,
  };

  return {
    [fieldName]: field,
  };
};

const generateDataInputFields = (
  inputParams,
  baseName,
  level = 0,
): GraphQLInputFieldConfigMap => {
  const fields = {};

  _.forEach(inputParams, (param, paramName) => {
    const generated = generateDataInputField(param, paramName, baseName, level);

    Object.keys(generated).map((paramN) => {
      fields[paramN] = generated[paramN];
    });
  });

  return fields;
};

//GraphQLInputObjectType | ?
export const generateDataInput = (
  baseName: string,
  inputParams: any,
  singleParam?: any,
) => {
  const protocolConfiguration =
    ProtocolGraphQL.getProtocolConfiguration() as ProtocolGraphQLConfiguration;

  if (singleParam) {
    // eslint-disable-next-line no-use-before-define
    const generated = generateDataInputField(
      inputParams,
      inputParams.name || '',
      baseName,
    ); // eslint-disable-line no-use-before-define

    return Object.values(generated)[0];
  }

  const dataInputType = new GraphQLInputObjectType({
    name: protocolConfiguration.generateDataInputTypeName(baseName),
    description: `Mutation data input type for **\`${baseName}\`**`,

    fields: () => {
      return generateDataInputFields(inputParams, baseName); // eslint-disable-line no-use-before-define
    },
  });

  dataInputType.getFields();
  return dataInputType;
};

export const generateNestedDataInput = (
  baseName,
  nestedParam,
  nestedParamName,
  level = 1,
) => {
  const protocolConfiguration =
    ProtocolGraphQL.getProtocolConfiguration() as ProtocolGraphQLConfiguration;

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

export const generateInput = (
  baseName,
  dataInputType,
  isField,
  includeClientMutationId = false,
): GraphQLInputObjectType => {
  const protocolConfiguration =
    ProtocolGraphQL.getProtocolConfiguration() as ProtocolGraphQLConfiguration;

  const inputType = new GraphQLInputObjectType({
    name: protocolConfiguration.generateInputTypeName(baseName),
    description: `Mutation input type for **\`${baseName}\`**`,

    fields: () => {
      const fields: InputFields = {};
      // const fields = {};
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
): GraphQLObjectType | WrappedDataOutputField => {
  const protocolConfiguration =
    ProtocolGraphQL.getProtocolConfiguration() as ProtocolGraphQLConfiguration;

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
    // eslint-disable-next-line @typescript-eslint/no-use-before-define
    baseFieldType = generateNestedDataOutput(
      baseName,
      paramType,
      paramName,
      graphRegistry,
      level + 1,
    );
  } else if (isEntity(paramType)) {
    if (!returnAsFieldNameMap) {
      throw new Error(
        `Param '${baseName}.${paramName}' in generateDataOutputField() needs to return multiple fields but returnAsFieldNameMap is set to false`,
      );
    }

    const result = {};
    const targetEntity = paramType;

    const { typeName: targetTypeName } = getRegisteredEntity(targetEntity.name);
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
    } else {
      result[paramName] = simpleField;
    }

    const referenceField: DataOutputField = {
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

          return referenceIds.map((referenceId) => {
            return referenceField.resolve(
              { [paramName]: referenceId },
              args,
              context,
            );
          });
        },
      };

      const referenceFieldListName =
        protocolConfiguration.generateReferenceFieldListName(targetEntity, {
          name: paramName,
        });

      result[referenceFieldListName] = referenceFieldList;
    } else {
      const referenceFieldName =
        protocolConfiguration.generateReferenceFieldName(targetEntity, {
          name: paramName,
        });

      result[referenceFieldName] = referenceField;
    }

    return result;
  } else {
    baseFieldType = ProtocolGraphQL.convertToProtocolDataType(
      paramType,
      baseName,
      false,
    );
  }

  const fieldType = isList ? new GraphQLList(baseFieldType) : baseFieldType;

  const field: DataOutputField = {
    type: fieldType,
    description: param.description,
  };

  if (param.resolve) {
    field.resolve = (
      obj: { [key: string]: unknown },
      args: { [key: string]: unknown },
      context: Context,
      info: GraphQLResolveInfo,
    ) => param.resolve({ obj, args, context, info });
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

export const generateDataOutput = (
  baseName: string,
  outputParams: any,
  graphRegistry: any,
  singleParam?: any,
): GraphQLObjectType | WrappedDataOutputField => {
  const protocolConfiguration =
    ProtocolGraphQL.getProtocolConfiguration() as ProtocolGraphQLConfiguration;

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
  graphRegistry?: any,
  level = 1,
) => {
  const protocolConfiguration =
    ProtocolGraphQL.getProtocolConfiguration() as ProtocolGraphQLConfiguration;

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

export const generateOutput = (
  baseName,
  dataOutputType,
  isField,
  includeClientMutationId = false,
): GraphQLObjectType => {
  const protocolConfiguration =
    ProtocolGraphQL.getProtocolConfiguration() as ProtocolGraphQLConfiguration;

  const outputType = new GraphQLObjectType({
    name: protocolConfiguration.generateOutPutTypeName(baseName),
    description: `Mutation output type for **\`${baseName}\`**`,

    fields: () => {
      const fields: OutputFields = {};
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
