import {
  GraphQLString,
  GraphQLID,
  GraphQLNonNull,
  GraphQLInputObjectType,
  GraphQLObjectType,
  GraphQLInt,
  GraphQLInputFieldConfigMap,
  GraphQLFieldConfigMap,
} from 'graphql';

// import { fromGlobalId } from 'graphql-relay';
import * as _ from 'lodash';

import { ProtocolGraphQL } from './ProtocolGraphQL';
import { ProtocolGraphQLConfiguration } from './ProtocolGraphQLConfiguration';
import { getEntityUniquenessAttributes } from './helper';
import {
  getSubscriptionResolver,
  getSubscriptionPayloadResolver,
} from './resolver';
import { isEntity } from '../engine/entity/Entity';

const i18nInputFieldTypesCache = {};

const generateI18nInputFieldType = (entity, entitySubscription, attribute) => {
  const protocolConfiguration = ProtocolGraphQL.getProtocolConfiguration() as ProtocolGraphQLConfiguration;

  const i18nFieldTypeName = protocolConfiguration.generateSubscriptionI18nAttributeInputTypeName(
    entity,
    entitySubscription,
    attribute,
  );

  if (i18nInputFieldTypesCache[i18nFieldTypeName]) {
    return i18nInputFieldTypesCache[i18nFieldTypeName];
  }

  const attributeType = attribute.type;
  const typeNamePascalCase = entity.graphql.typeNamePascalCase;
  const languages = protocolConfiguration
    .getParentConfiguration()
    .getLanguages();
  const fieldType = ProtocolGraphQL.convertToProtocolDataType(
    attributeType,
    entity.name,
    true,
  );

  const i18nFieldType = new GraphQLInputObjectType({
    name: i18nFieldTypeName,
    description: `**\`${entitySubscription.name}\`** subscription translations input type for **\`${typeNamePascalCase}.${attribute.gqlFieldName}\`**`,

    fields: () => {
      const i18nFields = {};

      languages.map((language, langIdx) => {
        const type =
          langIdx === 0 &&
          attribute.required &&
          !entitySubscription.ignoreRequired
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

export const generateSubscriptionInstanceInput = (
  entity,
  entitySubscription,
) => {
  const protocolConfiguration = ProtocolGraphQL.getProtocolConfiguration() as ProtocolGraphQLConfiguration;

  const typeNamePascalCase = entity.graphql.typeNamePascalCase;

  const entitySubscriptionInstanceInputType = new GraphQLInputObjectType({
    name: protocolConfiguration.generateSubscriptionInstanceInputTypeName(
      entity,
      entitySubscription,
    ),
    description: `**\`${entitySubscription.name}\`** subscription input type for **\`${typeNamePascalCase}\`**`,

    fields: () => {
      const fields: GraphQLInputFieldConfigMap = {};

      const entityAttributes = entity.getAttributes();

      _.forEach(entitySubscription.attributes, attributeName => {
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
            !entitySubscription.ignoreRequired &&
            !attribute.i18n &&
            !attribute.defaultValue
              ? new GraphQLNonNull(fieldType)
              : fieldType,
        };

        if (attribute.i18n) {
          const i18nFieldType = generateI18nInputFieldType(
            entity,
            entitySubscription,
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

  return entitySubscriptionInstanceInputType;
};

export const generateSubscriptionInput = (
  entity,
  typeName,
  entitySubscription,
  entitySubscriptionInstanceInputType,
) => {
  const protocolConfiguration = ProtocolGraphQL.getProtocolConfiguration() as ProtocolGraphQLConfiguration;

  const typeNamePascalCase = entity.graphql.typeNamePascalCase;

  const entitySubscriptionInputType = new GraphQLInputObjectType({
    name: protocolConfiguration.generateSubscriptionInputTypeName(
      entity,
      entitySubscription,
    ),
    description: `Subscription input type for **\`${typeNamePascalCase}\`**`,

    fields: () => {
      const fields: GraphQLInputFieldConfigMap = {
        clientSubscriptionId: {
          type: GraphQLString,
        },
      };

      if (entitySubscription.needsInstance) {
        fields.nodeId = {
          type: new GraphQLNonNull(GraphQLID),
        };
      }

      if (entitySubscriptionInstanceInputType) {
        fields[typeName] = {
          type: new GraphQLNonNull(entitySubscriptionInstanceInputType),
        };
      }

      return fields;
    },
  });

  return entitySubscriptionInputType;
};

export const generateSubscriptionByPrimaryAttributeInput = (
  entity,
  typeName,
  entitySubscription,
  entitySubscriptionInstanceInputType,
  primaryAttribute,
) => {
  const protocolConfiguration = ProtocolGraphQL.getProtocolConfiguration() as ProtocolGraphQLConfiguration;

  const fieldName = primaryAttribute.gqlFieldName;
  const fieldType = ProtocolGraphQL.convertToProtocolDataType(
    primaryAttribute.type,
    entity.name,
    true,
  );
  const typeNamePascalCase = entity.graphql.typeNamePascalCase;

  const entitySubscriptionInputType = new GraphQLInputObjectType({
    name: protocolConfiguration.generateMutationByPrimaryAttributeInputTypeName(
      entity,
      entitySubscription,
      primaryAttribute,
    ),
    description: `Subscription input type for **\`${typeNamePascalCase}\`** using the **\`${fieldName}\`**`,

    fields: () => {
      const fields: GraphQLInputFieldConfigMap = {
        clientSubscriptionId: {
          type: GraphQLString,
        },
      };

      if (entitySubscription.needsInstance) {
        fields[fieldName] = {
          type: new GraphQLNonNull(fieldType),
        };
      }

      if (entitySubscriptionInstanceInputType) {
        fields[typeName] = {
          type: new GraphQLNonNull(entitySubscriptionInstanceInputType),
        };
      }

      return fields;
    },
  });

  return entitySubscriptionInputType;
};

export const generateInstanceUniquenessInput = (
  entity,
  uniquenessAttributes,
  graphRegistry,
) => {
  const protocolConfiguration = ProtocolGraphQL.getProtocolConfiguration() as ProtocolGraphQLConfiguration;

  const typeNamePascalCase = entity.graphql.typeNamePascalCase;

  const entityInstanceInputType = new GraphQLInputObjectType({
    name: protocolConfiguration.generateInstanceUniquenessInputTypeName(
      entity,
      uniquenessAttributes.uniquenessName,
    ),
    description: `Input type for **\`${typeNamePascalCase}\`** using data uniqueness (${uniquenessAttributes.attributes}) to resolve the ID`,

    fields: () => {
      const fields: GraphQLInputFieldConfigMap = {};

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
          } else {
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
        } else {
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

export const generateSubscriptionInstanceNestedInput = (
  entity,
  entitySubscription,
  graphRegistry,
) => {
  const protocolConfiguration = ProtocolGraphQL.getProtocolConfiguration() as ProtocolGraphQLConfiguration;

  const typeNamePascalCase = entity.graphql.typeNamePascalCase;

  const entitySubscriptionInstanceInputType = new GraphQLInputObjectType({
    name: protocolConfiguration.generateSubscriptionInstanceNestedInputTypeName(
      entity,
      entitySubscription,
    ),
    description: `**\`${entitySubscription.name}\`** subscription input type for **\`${typeNamePascalCase}\`** using data uniqueness to resolve references`,

    fields: () => {
      const fields: GraphQLInputFieldConfigMap = {};

      const entityAttributes = entity.getAttributes();

      _.forEach(entitySubscription.attributes, attributeName => {
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
                attribute.required &&
                !entitySubscription.ignoreRequired &&
                !attribute.defaultValue
                  ? new GraphQLNonNull(fieldType)
                  : fieldType,
            };
          } else {
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
        } else {
          const fieldType = ProtocolGraphQL.convertToProtocolDataType(
            attributeType,
            entity.name,
            true,
          );

          fields[attribute.gqlFieldName] = {
            type:
              attribute.required &&
              !entitySubscription.ignoreRequired &&
              !attribute.i18n &&
              !attribute.defaultValue
                ? new GraphQLNonNull(fieldType)
                : fieldType,
          };

          if (attribute.i18n) {
            const i18nFieldType = generateI18nInputFieldType(
              entity,
              entitySubscription,
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

  return entitySubscriptionInstanceInputType;
};

export const generateSubscriptionNestedInput = (
  entity,
  typeName,
  entitySubscription,
  entitySubscriptionInstanceUniquenessInputType,
) => {
  const protocolConfiguration = ProtocolGraphQL.getProtocolConfiguration() as ProtocolGraphQLConfiguration;

  const typeNamePascalCase = entity.graphql.typeNamePascalCase;

  const entitySubscriptionInputType = new GraphQLInputObjectType({
    name: protocolConfiguration.generateSubscriptionNestedInputTypeName(
      entity,
      entitySubscription,
    ),
    description: `Mutation input type for **\`${typeNamePascalCase}\`** using data uniqueness to resolve references`,

    fields: () => {
      const fields: GraphQLInputFieldConfigMap = {
        clientSubscriptionId: {
          type: GraphQLString,
        },
      };

      if (entitySubscription.needsInstance) {
        fields.nodeId = {
          type: new GraphQLNonNull(GraphQLID),
        };
      }

      if (entitySubscriptionInstanceUniquenessInputType) {
        fields[typeName] = {
          type: new GraphQLNonNull(
            entitySubscriptionInstanceUniquenessInputType,
          ),
        };
      }

      return fields;
    },
  });

  return entitySubscriptionInputType;
};

export const generateSubscriptionOutput = (
  entity,
  typeName,
  type,
  entitySubscription,
) => {
  const protocolConfiguration = ProtocolGraphQL.getProtocolConfiguration() as ProtocolGraphQLConfiguration;

  const typeNamePascalCase = entity.graphql.typeNamePascalCase;

  const entitySubscriptionOutputType = new GraphQLObjectType({
    name: protocolConfiguration.generateSubscriptionOutputTypeName(
      entity,
      entitySubscription,
    ),
    description: `Subscription output type for **\`${typeNamePascalCase}\`**`,

    fields: () => {
      const fields: GraphQLFieldConfigMap<any, any> = {
        clientSubscriptionId: {
          type: GraphQLString,
        },
      };

      if (entitySubscription.isTypeDelete) {
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
      } else {
        fields[typeName] = {
          type: new GraphQLNonNull(type),
        };
      }

      return fields;
    },
  });

  return entitySubscriptionOutputType;
};

// const extractIdFromNodeId = (graphRegistry, sourceEntityName, nodeId) => {
//   let instanceId;

//   if (nodeId) {
//     const { type, id } = fromGlobalId(nodeId);

//     instanceId = id;

//     const entity = graphRegistry.types[type]
//       ? graphRegistry.types[type].entity
//       : null;

//     if (!entity || entity.name !== sourceEntityName) {
//       throw new Error('Incompatible nodeId used with this mutation');
//     }
//   }

//   return instanceId;
// };

export const generateSubscriptions = graphRegistry => {
  const protocolConfiguration = ProtocolGraphQL.getProtocolConfiguration() as ProtocolGraphQLConfiguration;
  const subscriptions = {};

  generateInstanceUniquenessInputs(graphRegistry);

  // console.log('generateSubscriptions', { graphRegistry });

  _.forEach(graphRegistry.types, ({ type, entity }, typeName) => {
    if (!entity.getSubscriptions) {
      return;
    }

    const entitySubscriptions = entity.getSubscriptions();

    // console.log('generateSubscriptions', { entitySubscriptions });

    if (!entitySubscriptions || entitySubscriptions.length < 1) {
      return;
    }

    entitySubscriptions.map(entitySubscription => {
      const subscriptionName = protocolConfiguration.generateSubscriptionTypeName(
        entity,
        entitySubscription,
      );

      let entitySubscriptionInstanceInputType;

      if (
        entitySubscription.attributes &&
        entitySubscription.attributes.length
      ) {
        entitySubscriptionInstanceInputType = generateSubscriptionInstanceInput(
          entity,
          entitySubscription,
        );
      }

      const subscriptionInputType = generateSubscriptionInput(
        entity,
        typeName,
        entitySubscription,
        entitySubscriptionInstanceInputType,
      );
      const subscriptionOutputType = generateSubscriptionOutput(
        entity,
        typeName,
        type,
        entitySubscription,
      );

      subscriptions[subscriptionName] = {
        type: subscriptionOutputType,
        description: entitySubscription.description,
        args: {
          input: {
            description: 'Input argument for this subscription',
            type: new GraphQLNonNull(subscriptionInputType),
          },
        },
        // use input for subscribe
        subscribe: getSubscriptionResolver(
          entity,
          entitySubscription,
          typeName,
          false,
          // ({ args }) => {
          //   return extractIdFromNodeId(
          //     graphRegistry,
          //     entity.name,
          //     args.input.nodeId,
          //   );
          // },
        ),
        // use output for resolve
        resolve: getSubscriptionPayloadResolver(
          entity,
          entitySubscription,
          typeName,
          // false,
          // ({ args }) => {
          //   return extractIdFromNodeId(
          //     graphRegistry,
          //     entity.name,
          //     args.input.nodeId,
          //   );
          // },
        ),
      };

      if (entitySubscription.isTypeCreate || entitySubscription.isTypeUpdate) {
        const subscriptionNestedName = protocolConfiguration.generateSubscriptionNestedTypeName(
          entity,
          entitySubscription,
        );

        let entitySubscriptionInstanceNestedInputType;

        if (
          entitySubscription.attributes &&
          entitySubscription.attributes.length
        ) {
          entitySubscriptionInstanceNestedInputType = generateSubscriptionInstanceNestedInput(
            entity,
            entitySubscription,
            graphRegistry,
          );
        }

        const subscriptionInputNestedType = generateSubscriptionNestedInput(
          entity,
          typeName,
          entitySubscription,
          entitySubscriptionInstanceNestedInputType,
        );
        subscriptions[subscriptionNestedName] = {
          type: subscriptionOutputType,
          description: entitySubscription.description,
          args: {
            input: {
              description: 'Input argument for this subscription',
              type: new GraphQLNonNull(subscriptionInputNestedType),
            },
          },
          // use input for subscribe
          subscribe: getSubscriptionResolver(
            entity,
            entitySubscription,
            typeName,
            true,
            // ({ args }) => {
            //   return extractIdFromNodeId(
            //     graphRegistry,
            //     entity.name,
            //     args.input.nodeId,
            //   );
            // },
          ),
          // use output for resolve
          resolve: getSubscriptionPayloadResolver(
            entity,
            entitySubscription,
            typeName,
            // true,
            // ({ args }) => {
            //   return extractIdFromNodeId(
            //     graphRegistry,
            //     entity.name,
            //     args.input.nodeId,
            //   );
            // },
          ),
        };
      }

      if (entitySubscription.needsInstance) {
        const primaryAttribute = entity.getPrimaryAttribute();

        if (primaryAttribute) {
          // const fieldName = primaryAttribute.gqlFieldName;
          const subscriptionByPrimaryAttributeInputType = generateSubscriptionByPrimaryAttributeInput(
            entity,
            typeName,
            entitySubscription,
            entitySubscriptionInstanceInputType,
            primaryAttribute,
          );
          const subscriptionByPrimaryAttributeName = protocolConfiguration.generateSubscriptionByPrimaryAttributeTypeName(
            entity,
            entitySubscription,
            primaryAttribute,
          );

          subscriptions[subscriptionByPrimaryAttributeName] = {
            type: subscriptionOutputType,
            description: entitySubscription.description,
            args: {
              input: {
                description: 'Input argument for this subscription',
                type: new GraphQLNonNull(
                  subscriptionByPrimaryAttributeInputType,
                ),
              },
            },
            subscribe: getSubscriptionResolver(
              entity,
              entitySubscription,
              typeName,
              false,
              // ({ args }) => {
              //   return args.input[fieldName];
              // },
            ),
            // use output for resolve
            resolve: getSubscriptionPayloadResolver(
              entity,
              entitySubscription,
              typeName,
              // false,
            ),
          };
        }
      }
    });
  });

  // console.log('generateSubscriptions', { subscriptions });

  return subscriptions;
};
