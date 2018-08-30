import {
  GraphQLString,
  GraphQLID,
  GraphQLNonNull,
  GraphQLInputObjectType,
  GraphQLObjectType,
  GraphQLInt,
} from 'graphql';

import { fromGlobalId } from 'graphql-relay';
import * as _ from 'lodash';

import ProtocolGraphQL from './ProtocolGraphQL';
import { getEntityUniquenessAttributes } from './helper';
import { getMutationResolver } from './resolver';
import { isEntity } from '../engine/entity/Entity';

const i18nInputFieldTypesCache = {};

const generateI18nInputFieldType = (entity, entityMutation, attribute) => {
  const protocolConfiguration = ProtocolGraphQL.getProtocolConfiguration();
  const i18nFieldTypeName = protocolConfiguration.generateMutationI18nAttributeInputTypeName(
    entity,
    entityMutation,
    attribute,
  );

  if (i18nInputFieldTypesCache[i18nFieldTypeName]) {
    return i18nInputFieldTypesCache[i18nFieldTypeName];
  }

  const attributeType = attribute.type;
  const typeNamePascalCase = entity.graphql.typeNamePascalCase;
  const languages = protocolConfiguration
    .getParentConfiguration()
    .getLanguageCodes();
  const fieldType = ProtocolGraphQL.convertToProtocolDataType(
    attributeType,
    entity.name,
    true,
  );

  const i18nFieldType = new GraphQLInputObjectType({
    name: i18nFieldTypeName,
    description: `**\`${
      entityMutation.name
    }\`** mutation translations input type for **\`${typeNamePascalCase}.${
      attribute.gqlFieldName
    }\`**`,

    fields: () => {
      const i18nFields = {};

      languages.map(language => {
        const type =
          language === 'default' &&
          attribute.required &&
          !entityMutation.ignoreRequired
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

export const generateMutationInstanceInput = (entity, entityMutation) => {
  const protocolConfiguration = ProtocolGraphQL.getProtocolConfiguration();

  const typeNamePascalCase = entity.graphql.typeNamePascalCase;

  const entityMutationInstanceInputType = new GraphQLInputObjectType({
    name: protocolConfiguration.generateMutationInstanceInputTypeName(
      entity,
      entityMutation,
    ),
    description: `**\`${
      entityMutation.name
    }\`** mutation input type for **\`${typeNamePascalCase}\`**`,

    fields: () => {
      const fields = {};

      const entityAttributes = entity.getAttributes();

      _.forEach(entityMutation.attributes, attributeName => {
        const attribute = entityAttributes[attributeName];

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

        fields[attribute.gqlFieldName] = {
          type:
            attribute.required &&
            !entityMutation.ignoreRequired &&
            !attribute.i18n
              ? new GraphQLNonNull(fieldType)
              : fieldType,
        };

        if (attribute.i18n) {
          const i18nFieldType = generateI18nInputFieldType(
            entity,
            entityMutation,
            attribute,
          );

          fields[attribute.gqlFieldNameI18n] = {
            type: i18nFieldType,
          };
        }
      });

      return fields;
    },
  });

  return entityMutationInstanceInputType;
};

export const generateMutationInput = (
  entity,
  typeName,
  entityMutation,
  entityMutationInstanceInputType,
) => {
  const protocolConfiguration = ProtocolGraphQL.getProtocolConfiguration();

  const typeNamePascalCase = entity.graphql.typeNamePascalCase;

  const entityMutationInputType = new GraphQLInputObjectType({
    name: protocolConfiguration.generateMutationInputTypeName(
      entity,
      entityMutation,
    ),
    description: `Mutation input type for **\`${typeNamePascalCase}\`**`,

    fields: () => {
      const fields = {
        clientMutationId: {
          type: GraphQLString,
        },
      };

      if (entityMutation.needsInstance) {
        fields.nodeId = {
          type: new GraphQLNonNull(GraphQLID),
        };
      }

      if (entityMutationInstanceInputType) {
        fields[typeName] = {
          type: new GraphQLNonNull(entityMutationInstanceInputType),
        };
      }

      return fields;
    },
  });

  return entityMutationInputType;
};

export const generateMutationByPrimaryAttributeInput = (
  entity,
  typeName,
  entityMutation,
  entityMutationInstanceInputType,
  primaryAttribute,
) => {
  const protocolConfiguration = ProtocolGraphQL.getProtocolConfiguration();

  const fieldName = primaryAttribute.gqlFieldName;
  const fieldType = ProtocolGraphQL.convertToProtocolDataType(
    primaryAttribute.type,
    entity.name,
    true,
  );
  const typeNamePascalCase = entity.graphql.typeNamePascalCase;

  const entityMutationInputType = new GraphQLInputObjectType({
    name: protocolConfiguration.generateMutationByPrimaryAttributeInputTypeName(
      entity,
      entityMutation,
      primaryAttribute,
    ),
    description: `Mutation input type for **\`${typeNamePascalCase}\`** using the **\`${fieldName}\`**`,

    fields: () => {
      const fields = {
        clientMutationId: {
          type: GraphQLString,
        },
      };

      if (entityMutation.needsInstance) {
        fields[fieldName] = {
          type: new GraphQLNonNull(fieldType),
        };
      }

      if (entityMutationInstanceInputType) {
        fields[typeName] = {
          type: new GraphQLNonNull(entityMutationInstanceInputType),
        };
      }

      return fields;
    },
  });

  return entityMutationInputType;
};

export const generateInstanceUniquenessInput = (
  entity,
  uniquenessAttributes,
  graphRegistry,
) => {
  const protocolConfiguration = ProtocolGraphQL.getProtocolConfiguration();

  const typeNamePascalCase = entity.graphql.typeNamePascalCase;

  const entityInstanceInputType = new GraphQLInputObjectType({
    name: protocolConfiguration.generateInstanceUniquenessInputTypeName(
      entity,
      uniquenessAttributes.uniquenessName,
    ),
    description: `Input type for **\`${typeNamePascalCase}\`** using data uniqueness (${
      uniquenessAttributes.attributes
    }) to resolve the ID`,

    fields: () => {
      const fields = {};

      const entityAttributes = entity.getAttributes();

      _.forEach(uniquenessAttributes.attributes, attributeName => {
        const attribute = entityAttributes[attributeName];

        let attributeType = attribute.type;

        if (isEntity(attributeType)) {
          const targetEntity = attributeType;
          const primaryAttribute = targetEntity.getPrimaryAttribute();
          const targetTypeName = targetEntity.graphql.typeName;

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
            fields[attribute.gqlFieldName] = {
              type: attribute.required
                ? new GraphQLNonNull(fieldType)
                : fieldType,
            };
          }
          else {
            fields[attribute.gqlFieldName] = {
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
        }
        else {
          const fieldType = ProtocolGraphQL.convertToProtocolDataType(
            attributeType,
            entity.name,
            true,
          );

          fields[attribute.gqlFieldName] = {
            type: new GraphQLNonNull(fieldType),
          };
        }
      });

      return fields;
    },
  });

  return entityInstanceInputType;
};

export const generateInstanceUniquenessInputs = graphRegistry => {
  _.forEach(graphRegistry.types, ({ entity }, typeName) => {
    const uniquenessAttributesList = getEntityUniquenessAttributes(entity);

    const registryType = graphRegistry.types[typeName];
    registryType.instanceUniquenessInputs =
      registryType.instanceUniquenessInputs || {};

    uniquenessAttributesList.map(uniquenessAttributes => {
      const instanceUniquenessInput = generateInstanceUniquenessInput(
        entity,
        uniquenessAttributes,
        graphRegistry,
      );
      registryType.instanceUniquenessInputs[
        uniquenessAttributes.uniquenessName
      ] = instanceUniquenessInput;
    });
  });
};

export const generateMutationInstanceNestedInput = (
  entity,
  entityMutation,
  graphRegistry,
) => {
  const protocolConfiguration = ProtocolGraphQL.getProtocolConfiguration();

  const typeNamePascalCase = entity.graphql.typeNamePascalCase;

  const entityMutationInstanceInputType = new GraphQLInputObjectType({
    name: protocolConfiguration.generateMutationInstanceNestedInputTypeName(
      entity,
      entityMutation,
    ),
    description: `**\`${
      entityMutation.name
    }\`** mutation input type for **\`${typeNamePascalCase}\`** using data uniqueness to resolve references`,

    fields: () => {
      const fields = {};

      const entityAttributes = entity.getAttributes();

      _.forEach(entityMutation.attributes, attributeName => {
        const attribute = entityAttributes[attributeName];

        let attributeType = attribute.type;

        if (isEntity(attributeType)) {
          const targetEntity = attributeType;
          const primaryAttribute = targetEntity.getPrimaryAttribute();
          const targetTypeName = targetEntity.graphql.typeName;

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
            fields[attribute.gqlFieldName] = {
              type:
                attribute.required && !entityMutation.ignoreRequired
                  ? new GraphQLNonNull(fieldType)
                  : fieldType,
            };
          }
          else {
            fields[attribute.gqlFieldName] = {
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
        }
        else {
          const fieldType = ProtocolGraphQL.convertToProtocolDataType(
            attributeType,
            entity.name,
            true,
          );

          fields[attribute.gqlFieldName] = {
            type:
              attribute.required &&
              !entityMutation.ignoreRequired &&
              !attribute.i18n
                ? new GraphQLNonNull(fieldType)
                : fieldType,
          };

          if (attribute.i18n) {
            const i18nFieldType = generateI18nInputFieldType(
              entity,
              entityMutation,
              attribute,
            );

            fields[attribute.gqlFieldNameI18n] = {
              type: i18nFieldType,
            };
          }
        }
      });

      return fields;
    },
  });

  return entityMutationInstanceInputType;
};

export const generateMutationNestedInput = (
  entity,
  typeName,
  entityMutation,
  entityMutationInstanceUniquenessInputType,
) => {
  const protocolConfiguration = ProtocolGraphQL.getProtocolConfiguration();

  const typeNamePascalCase = entity.graphql.typeNamePascalCase;

  const entityMutationInputType = new GraphQLInputObjectType({
    name: protocolConfiguration.generateMutationNestedInputTypeName(
      entity,
      entityMutation,
    ),
    description: `Mutation input type for **\`${typeNamePascalCase}\`** using data uniqueness to resolve references`,

    fields: () => {
      const fields = {
        clientMutationId: {
          type: GraphQLString,
        },
      };

      if (entityMutation.needsInstance) {
        fields.nodeId = {
          type: new GraphQLNonNull(GraphQLID),
        };
      }

      if (entityMutationInstanceUniquenessInputType) {
        fields[typeName] = {
          type: new GraphQLNonNull(entityMutationInstanceUniquenessInputType),
        };
      }

      return fields;
    },
  });

  return entityMutationInputType;
};

export const generateMutationOutput = (
  entity,
  typeName,
  type,
  entityMutation,
) => {
  const protocolConfiguration = ProtocolGraphQL.getProtocolConfiguration();

  const typeNamePascalCase = entity.graphql.typeNamePascalCase;

  const entityMutationOutputType = new GraphQLObjectType({
    name: protocolConfiguration.generateMutationOutputTypeName(
      entity,
      entityMutation,
    ),
    description: `Mutation output type for **\`${typeNamePascalCase}\`**`,

    fields: () => {
      const fields = {
        clientMutationId: {
          type: GraphQLString,
        },
      };

      if (entityMutation.isTypeDelete) {
        fields.deleteRowCount = {
          type: new GraphQLNonNull(GraphQLInt),
          description: 'Number of deleted rows',
        };

        const primaryAttribute = entity.getPrimaryAttribute();

        if (primaryAttribute) {
          const fieldName = primaryAttribute.gqlFieldName;
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
      }
      else {
        fields[typeName] = {
          type: new GraphQLNonNull(type),
        };
      }

      return fields;
    },
  });

  return entityMutationOutputType;
};

const extractIdFromNodeId = (graphRegistry, sourceEntityName, nodeId) => {
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

export const generateMutations = graphRegistry => {
  const protocolConfiguration = ProtocolGraphQL.getProtocolConfiguration();
  const mutations = {};

  generateInstanceUniquenessInputs(graphRegistry);

  _.forEach(graphRegistry.types, ({ type, entity }, typeName) => {
    const entityMutations = entity.getMutations();

    if (!entityMutations || entityMutations.length < 1) {
      return;
    }

    entityMutations.map(entityMutation => {
      const mutationName = protocolConfiguration.generateMutationTypeName(
        entity,
        entityMutation,
      );

      let entityMutationInstanceInputType;

      if (entityMutation.attributes) {
        entityMutationInstanceInputType = generateMutationInstanceInput(
          entity,
          entityMutation,
        );
      }

      const mutationInputType = generateMutationInput(
        entity,
        typeName,
        entityMutation,
        entityMutationInstanceInputType,
      );
      const mutationOutputType = generateMutationOutput(
        entity,
        typeName,
        type,
        entityMutation,
      );

      mutations[mutationName] = {
        type: mutationOutputType,
        description: entityMutation.description,
        args: {
          input: {
            description: 'Input argument for this mutation',
            type: new GraphQLNonNull(mutationInputType),
          },
        },
        resolve: getMutationResolver(
          entity,
          entityMutation,
          typeName,
          false,
          ({ args }) => {
            return extractIdFromNodeId(
              graphRegistry,
              entity.name,
              args.input.nodeId,
            );
          },
        ),
      };

      if (entityMutation.isTypeCreate || entityMutation.isTypeUpdate) {
        const mutationNestedName = protocolConfiguration.generateMutationNestedTypeName(
          entity,
          entityMutation,
        );

        let entityMutationInstanceNestedInputType;

        if (entityMutation.attributes) {
          entityMutationInstanceNestedInputType = generateMutationInstanceNestedInput(
            entity,
            entityMutation,
            graphRegistry,
          );
        }

        const mutationInputNestedType = generateMutationNestedInput(
          entity,
          typeName,
          entityMutation,
          entityMutationInstanceNestedInputType,
        );
        mutations[mutationNestedName] = {
          type: mutationOutputType,
          description: entityMutation.description,
          args: {
            input: {
              description: 'Input argument for this mutation',
              type: new GraphQLNonNull(mutationInputNestedType),
            },
          },
          resolve: getMutationResolver(
            entity,
            entityMutation,
            typeName,
            true,
            ({ args }) => {
              return extractIdFromNodeId(
                graphRegistry,
                entity.name,
                args.input.nodeId,
              );
            },
          ),
        };
      }

      if (entityMutation.needsInstance) {
        const primaryAttribute = entity.getPrimaryAttribute();

        if (primaryAttribute) {
          const fieldName = primaryAttribute.gqlFieldName;
          const mutationByPrimaryAttributeInputType = generateMutationByPrimaryAttributeInput(
            entity,
            typeName,
            entityMutation,
            entityMutationInstanceInputType,
            primaryAttribute,
          );
          const mutationByPrimaryAttributeName = protocolConfiguration.generateMutationByPrimaryAttributeTypeName(
            entity,
            entityMutation,
            primaryAttribute,
          );

          mutations[mutationByPrimaryAttributeName] = {
            type: mutationOutputType,
            description: entityMutation.description,
            args: {
              input: {
                description: 'Input argument for this mutation',
                type: new GraphQLNonNull(mutationByPrimaryAttributeInputType),
              },
            },
            resolve: getMutationResolver(
              entity,
              entityMutation,
              typeName,
              false,
              ({ args }) => {
                return args.input[fieldName];
              },
            ),
          };
        }
      }
    });
  });

  return mutations;
};
