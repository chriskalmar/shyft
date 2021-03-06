import {
  GraphQLString,
  GraphQLID,
  GraphQLNonNull,
  GraphQLInputObjectType,
  GraphQLObjectType,
  GraphQLInt,
  GraphQLInputFieldConfigMap,
  GraphQLFieldConfigMap,
  GraphQLNullableType,
} from 'graphql';
import { fromGlobalId } from 'graphql-relay';
import * as _ from 'lodash';

import { ProtocolGraphQL } from './ProtocolGraphQL';
import { ProtocolGraphQLConfiguration } from './ProtocolGraphQLConfiguration';
import { getEntityUniquenessAttributes } from './helper';
import { isEntity } from '../engine/entity/Entity';
import { Mutation, isMutation } from '../engine/mutation/Mutation';
import { Subscription } from '..';
import { isSubscription } from '../engine/subscription/Subscription';
import { getRegisteredEntity, getRegisteredEntityAttribute } from './registry';

const i18nInputFieldTypesCache = {};

const generateI18nInputFieldType = (
  entity,
  entityOperation: Mutation | Subscription,
  attribute,
) => {
  const protocolConfiguration = ProtocolGraphQL.getProtocolConfiguration() as ProtocolGraphQLConfiguration;

  const i18nFieldTypeName = protocolConfiguration.generateOperationI18nAttributeInputTypeName(
    entity,
    entityOperation,
    attribute,
  );

  if (i18nInputFieldTypesCache[i18nFieldTypeName]) {
    return i18nInputFieldTypesCache[i18nFieldTypeName];
  }

  const attributeType = attribute.type;
  const { typeNamePascalCase } = getRegisteredEntity(entity.name);
  const languages = protocolConfiguration
    .getParentConfiguration()
    .getLanguages();
  const fieldType = ProtocolGraphQL.convertToProtocolDataType(
    attributeType,
    entity.name,
    true,
  );

  const { fieldName: gqlFieldName } = getRegisteredEntityAttribute(
    entity.name,
    attribute.name,
  );

  const i18nFieldType = new GraphQLInputObjectType({
    name: i18nFieldTypeName,
    description: `**\`${entityOperation.name}\`** operation translations input type for **\`${typeNamePascalCase}.${gqlFieldName}\`**`,

    fields: () => {
      const i18nFields = {};

      languages.map((language, langIdx) => {
        const type =
          langIdx === 0 && attribute.required && !entityOperation.ignoreRequired
            ? new GraphQLNonNull(fieldType)
            : fieldType;

        i18nFields[language] = {
          type,
        };
      });

      return i18nFields;
    },
  });

  i18nInputFieldTypesCache[i18nFieldTypeName] = i18nFieldType;

  return i18nFieldType;
};

export const generateOperationInstanceInput = (entity, entityOperation) => {
  const protocolConfiguration = ProtocolGraphQL.getProtocolConfiguration() as ProtocolGraphQLConfiguration;

  const { typeNamePascalCase } = getRegisteredEntity(entity.name);

  const entityOperationInstanceInputType = new GraphQLInputObjectType({
    name: protocolConfiguration.generateOperationInstanceInputTypeName(
      entity,
      entityOperation,
    ),
    description: `**\`${entityOperation.name}\`** operation input type for **\`${typeNamePascalCase}\`**`,

    fields: () => {
      const fields: GraphQLInputFieldConfigMap = {};

      const entityAttributes = entity.getAttributes();

      _.forEach(entityOperation.attributes, (attributeName) => {
        const attribute = entityAttributes[attributeName];

        const {
          fieldName: gqlFieldName,
          fieldNameI18n: gqlFieldNameI18n,
        } = getRegisteredEntityAttribute(entity.name, attribute.name);

        let attributeType = attribute.type;

        // it's a reference
        if (isEntity(attributeType)) {
          const targetEntity = attributeType;
          const primaryAttribute = targetEntity.getPrimaryAttribute();
          attributeType = primaryAttribute.type;
        }

        const fieldType = ProtocolGraphQL.convertToProtocolDataType(
          attributeType,
          entity.name,
          true,
        );

        fields[gqlFieldName] = {
          type:
            attribute.required &&
            !entityOperation.ignoreRequired &&
            !attribute.i18n &&
            !attribute.defaultValue
              ? new GraphQLNonNull(fieldType)
              : fieldType,
        };

        if (attribute.i18n) {
          const i18nFieldType = generateI18nInputFieldType(
            entity,
            entityOperation,
            attribute,
          );

          fields[gqlFieldNameI18n] = {
            type: i18nFieldType,
          };
        }
      });

      return fields;
    },
  });

  return entityOperationInstanceInputType;
};

export const generateOperationInput = (
  entity,
  typeName: string,
  entityOperation: Mutation | Subscription,
  entityOperationInstanceInputType,
) => {
  const protocolConfiguration = ProtocolGraphQL.getProtocolConfiguration() as ProtocolGraphQLConfiguration;

  const { typeNamePascalCase } = getRegisteredEntity(entity.name);

  const entityOperationInputType = new GraphQLInputObjectType({
    name: protocolConfiguration.generateOperationInputTypeName(
      entity,
      entityOperation,
    ),
    description: `Operation input type for **\`${typeNamePascalCase}\`**`,

    fields: () => {
      const fields: GraphQLInputFieldConfigMap = {};
      if (isMutation(entityOperation)) {
        fields.clientMutationId = {
          type: GraphQLString,
        };
      } else if (isSubscription(entityOperation)) {
        fields.clientSubscriptionId = {
          type: GraphQLString,
        };
      }

      if (entityOperation.needsInstance) {
        fields.nodeId = {
          type: new GraphQLNonNull(GraphQLID),
        };
      }

      if (entityOperationInstanceInputType) {
        fields[typeName] = {
          type: new GraphQLNonNull(entityOperationInstanceInputType),
        };
      }

      return fields;
    },
  });

  return entityOperationInputType;
};

export const generateOperationByPrimaryAttributeInput = (
  entity,
  typeName: string,
  entityOperation: Mutation | Subscription,
  entityOperationInstanceInputType,
  primaryAttribute,
) => {
  const protocolConfiguration = ProtocolGraphQL.getProtocolConfiguration() as ProtocolGraphQLConfiguration;

  const { fieldName } = getRegisteredEntityAttribute(
    entity.name,
    primaryAttribute.name,
  );

  const fieldType = ProtocolGraphQL.convertToProtocolDataType(
    primaryAttribute.type,
    entity.name,
    true,
  );
  const { typeNamePascalCase } = getRegisteredEntity(entity.name);

  const entityOperationInputType = new GraphQLInputObjectType({
    name: protocolConfiguration.generateOperationByPrimaryAttributeInputTypeName(
      entity,
      entityOperation,
      primaryAttribute,
    ),
    description: `Operation input type for **\`${typeNamePascalCase}\`** using the **\`${fieldName}\`**`,

    fields: () => {
      const fields: GraphQLInputFieldConfigMap = {};
      if (isMutation(entityOperation)) {
        fields.clientMutationId = {
          type: GraphQLString,
        };
      } else if (isSubscription(entityOperation)) {
        fields.clientSubscriptionId = {
          type: GraphQLString,
        };
      }

      if (entityOperation.needsInstance) {
        fields[fieldName] = {
          type: new GraphQLNonNull(fieldType),
        };
      }

      if (entityOperationInstanceInputType) {
        fields[typeName] = {
          type: new GraphQLNonNull(entityOperationInstanceInputType),
        };
      }

      return fields;
    },
  });

  return entityOperationInputType;
};

export const generateInstanceUniquenessInput = (
  entity,
  uniquenessAttributes,
  graphRegistry,
) => {
  const protocolConfiguration = ProtocolGraphQL.getProtocolConfiguration() as ProtocolGraphQLConfiguration;

  const { typeNamePascalCase } = getRegisteredEntity(entity.name);

  // todo watch out for duplicate !
  const entityInstanceInputType = new GraphQLInputObjectType({
    name: protocolConfiguration.generateInstanceUniquenessInputTypeName(
      entity,
      uniquenessAttributes.uniquenessName,
    ),
    description: `Input type for **\`${typeNamePascalCase}\`** using data uniqueness (${uniquenessAttributes.attributes}) to resolve the ID`,

    fields: () => {
      const fields: GraphQLInputFieldConfigMap = {};

      const entityAttributes = entity.getAttributes();

      _.forEach(uniquenessAttributes.attributes, (attributeName) => {
        const attribute = entityAttributes[attributeName];

        const { fieldName: gqlFieldName } = getRegisteredEntityAttribute(
          entity.name,
          attribute.name,
        );

        let attributeType = attribute.type;

        if (isEntity(attributeType)) {
          const targetEntity = attributeType;
          const primaryAttribute = targetEntity.getPrimaryAttribute();
          const { typeName: targetTypeName } = getRegisteredEntity(
            targetEntity.name,
          );

          attributeType = primaryAttribute.type;
          const fieldType = ProtocolGraphQL.convertToProtocolDataType(
            attributeType,
            entity.name,
            true,
          );

          const uniquenessAttributesList = getEntityUniquenessAttributes(
            targetEntity,
          );

          if (uniquenessAttributesList.length === 0) {
            fields[gqlFieldName] = {
              type: attribute.required
                ? new GraphQLNonNull(fieldType)
                : fieldType,
            };
          } else {
            fields[gqlFieldName] = {
              type: fieldType,
            };

            const registryType = graphRegistry.types[targetTypeName];
            registryType.instanceUniquenessInputs =
              registryType.instanceUniquenessInputs || {};

            uniquenessAttributesList.map(({ uniquenessName }) => {
              const fieldName = protocolConfiguration.generateUniquenessAttributesFieldName(
                entity,
                attribute,
                uniquenessName,
              );
              fields[fieldName] = {
                type: registryType.instanceUniquenessInputs[uniquenessName],
              };
            });
          }
        } else {
          const fieldType = ProtocolGraphQL.convertToProtocolDataType(
            attributeType,
            entity.name,
            true,
          );

          fields[gqlFieldName] = {
            type: new GraphQLNonNull(fieldType),
          };
        }
      });

      return fields;
    },
  });

  return entityInstanceInputType;
};

export const generateInstanceUniquenessInputs = (graphRegistry) => {
  _.forEach(graphRegistry.types, ({ entity }, typeName) => {
    const uniquenessAttributesList = getEntityUniquenessAttributes(entity);

    const registryType = graphRegistry.types[typeName];
    registryType.instanceUniquenessInputs =
      registryType.instanceUniquenessInputs || {};

    uniquenessAttributesList.map((uniquenessAttributes) => {
      const instanceUniquenessInput = generateInstanceUniquenessInput(
        entity,
        uniquenessAttributes,
        graphRegistry,
      );
      // watching out for duplicate
      if (
        !registryType.instanceUniquenessInputs[
          uniquenessAttributes.uniquenessName
        ]
      ) {
        registryType.instanceUniquenessInputs[
          uniquenessAttributes.uniquenessName
        ] = instanceUniquenessInput;
      }
    });
  });
};

export const generateOperationInstanceNestedInput = (
  entity,
  entityOperation: Mutation | Subscription,
  graphRegistry,
) => {
  const protocolConfiguration = ProtocolGraphQL.getProtocolConfiguration() as ProtocolGraphQLConfiguration;

  const { typeNamePascalCase } = getRegisteredEntity(entity.name);

  const entityOperationInstanceInputType = new GraphQLInputObjectType({
    name: protocolConfiguration.generateOperationInstanceNestedInputTypeName(
      entity,
      entityOperation,
    ),
    description: `**\`${entityOperation.name}\`** operation input type for **\`${typeNamePascalCase}\`** using data uniqueness to resolve references`,

    fields: () => {
      const fields: GraphQLInputFieldConfigMap = {};

      const entityAttributes = entity.getAttributes();

      _.forEach(entityOperation.attributes, (attributeName) => {
        const attribute = entityAttributes[attributeName];

        const {
          fieldName: gqlFieldName,
          fieldNameI18n: gqlFieldNameI18n,
        } = getRegisteredEntityAttribute(entity.name, attribute.name);

        let attributeType = attribute.type;

        if (isEntity(attributeType)) {
          const targetEntity = attributeType;
          const primaryAttribute = targetEntity.getPrimaryAttribute();
          const { typeName: targetTypeName } = getRegisteredEntity(
            targetEntity.name,
          );

          attributeType = primaryAttribute.type;
          const fieldType = ProtocolGraphQL.convertToProtocolDataType(
            attributeType,
            entity.name,
            true,
          );

          const uniquenessAttributesList = getEntityUniquenessAttributes(
            targetEntity,
          );

          if (uniquenessAttributesList.length === 0) {
            fields[gqlFieldName] = {
              type:
                attribute.required &&
                !entityOperation.ignoreRequired &&
                !attribute.defaultValue
                  ? new GraphQLNonNull(fieldType)
                  : fieldType,
            };
          } else {
            fields[gqlFieldName] = {
              type: fieldType,
            };

            const registryType = graphRegistry.types[targetTypeName];
            registryType.instanceUniquenessInputs =
              registryType.instanceUniquenessInputs || {};

            uniquenessAttributesList.map(({ uniquenessName }) => {
              const fieldName = protocolConfiguration.generateUniquenessAttributesFieldName(
                entity,
                attribute,
                uniquenessName,
              );
              fields[fieldName] = {
                type: registryType.instanceUniquenessInputs[uniquenessName],
              };
            });
          }
        } else {
          const fieldType = ProtocolGraphQL.convertToProtocolDataType(
            attributeType,
            entity.name,
            true,
          );

          fields[gqlFieldName] = {
            type:
              attribute.required &&
              !entityOperation.ignoreRequired &&
              !attribute.i18n &&
              !attribute.defaultValue
                ? new GraphQLNonNull(fieldType)
                : fieldType,
          };

          if (attribute.i18n) {
            const i18nFieldType = generateI18nInputFieldType(
              entity,
              entityOperation,
              attribute,
            );

            fields[gqlFieldNameI18n] = {
              type: i18nFieldType,
            };
          }
        }
      });

      return fields;
    },
  });

  return entityOperationInstanceInputType;
};

export const generateOperationNestedInput = (
  entity,
  typeName: string,
  entityOperation: Mutation | Subscription,
  entityOperationInstanceUniquenessInputType,
) => {
  const protocolConfiguration = ProtocolGraphQL.getProtocolConfiguration() as ProtocolGraphQLConfiguration;

  const { typeNamePascalCase } = getRegisteredEntity(entity.name);

  const entityOperationInputType = new GraphQLInputObjectType({
    name: protocolConfiguration.generateOperationNestedInputTypeName(
      entity,
      entityOperation,
    ),
    description: `Operation input type for **\`${typeNamePascalCase}\`** using data uniqueness to resolve references`,

    fields: () => {
      const fields: GraphQLInputFieldConfigMap = {};
      if (isMutation(entityOperation)) {
        fields.clientMutationId = {
          type: GraphQLString,
        };
      } else if (isSubscription(entityOperation)) {
        fields.clientSubscriptionId = {
          type: GraphQLString,
        };
      }

      if (entityOperation.needsInstance) {
        fields.nodeId = {
          type: new GraphQLNonNull(GraphQLID),
        };
      }

      if (entityOperationInstanceUniquenessInputType) {
        fields[typeName] = {
          type: new GraphQLNonNull(entityOperationInstanceUniquenessInputType),
        };
      }

      return fields;
    },
  });

  return entityOperationInputType;
};

export const generateOperationOutput = (
  entity,
  typeName: string,
  type: GraphQLNullableType,
  entityOperation: Mutation | Subscription,
) => {
  const protocolConfiguration = ProtocolGraphQL.getProtocolConfiguration() as ProtocolGraphQLConfiguration;

  const { typeNamePascalCase } = getRegisteredEntity(entity.name);

  const entityOperationOutputType = new GraphQLObjectType({
    name: protocolConfiguration.generateOperationOutputTypeName(
      entity,
      entityOperation,
    ),
    description: `Operation output type for **\`${typeNamePascalCase}\`**`,

    fields: () => {
      const fields: GraphQLFieldConfigMap<any, any> = {};
      if (isMutation(entityOperation)) {
        fields.clientMutationId = {
          type: GraphQLString,
        };
      } else if (isSubscription(entityOperation)) {
        fields.clientSubscriptionId = {
          type: GraphQLString,
        };
      }

      if (entityOperation.isTypeDelete) {
        fields.deleteRowCount = {
          type: new GraphQLNonNull(GraphQLInt),
          description: 'Number of deleted rows',
        };

        const primaryAttribute = entity.getPrimaryAttribute();

        if (primaryAttribute) {
          const { fieldName } = getRegisteredEntityAttribute(
            entity.name,
            primaryAttribute.name,
          );
          const fieldType = ProtocolGraphQL.convertToProtocolDataType(
            primaryAttribute.type,
            entity.name,
            false,
          );

          fields[fieldName] = {
            type: new GraphQLNonNull(fieldType),
            description: primaryAttribute.description,
          };
        }
      } else {
        fields[typeName] = {
          type: new GraphQLNonNull(type),
        };
      }

      return fields;
    },
  });

  return entityOperationOutputType;
};

export const extractIdFromNodeId = (
  graphRegistry,
  sourceEntityName,
  nodeId,
) => {
  let instanceId;

  if (nodeId) {
    const { type, id } = fromGlobalId(nodeId);

    instanceId = id;

    const entity = graphRegistry.types[type]
      ? graphRegistry.types[type].entity
      : null;

    if (!entity || entity.name !== sourceEntityName) {
      throw new Error('Incompatible nodeId used with this mutation');
    }
  }

  return instanceId;
};
