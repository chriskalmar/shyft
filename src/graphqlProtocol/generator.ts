import * as _ from 'lodash';
import { RELAY_TYPE_PROMOTER_FIELD } from './protocolGraphqlConstants';
import { graphRegistry } from './graphRegistry';
import { ProtocolGraphQL } from './ProtocolGraphQL';
import { ProtocolGraphQLConfiguration } from './ProtocolGraphQLConfiguration';
import { shaper } from 'json-shaper';
import {
  GraphQLObjectType,
  GraphQLSchema,
  GraphQLNonNull,
  GraphQLID,
} from 'graphql';
import { nodeDefinitions, fromGlobalId, toGlobalId } from 'graphql-relay';
import { registerConnection, generateReverseConnections } from './connection';
import { generateListQueries, generateInstanceQueries } from './query';
import { generateMutations } from './mutation';
import { generateActions } from './action';
import { generateSubscriptions } from './subscription';
import { resolveByFindOne } from './resolver';
import { isConfiguration } from '../engine/configuration/Configuration';
import { Entity, isEntity } from '../engine/entity/Entity';
import { DataTypeI18n } from '../engine/datatype/dataTypes';
import {
  ACTION_TYPE_MUTATION,
  ACTION_TYPE_QUERY,
} from '../engine/action/Action';
import { isViewEntity } from '../engine/entity/ViewEntity';
import { isShadowEntity } from '../engine/entity/ShadowEntity';
import { generateInstanceUniquenessInputs } from './operation';
import { registerEntity } from './registry';

export const getTypeForEntityFromGraphRegistry = (entity) => {
  const typeName = entity.graphql.typeName;
  return graphRegistry.types[typeName];
};

// prepare models for graphql
export const extendModelsForGql = (entities: Entity[]) => {
  const protocolConfiguration = ProtocolGraphQL.getProtocolConfiguration() as ProtocolGraphQLConfiguration;

  _.forEach(entities, (entity) => {
    const dataShaperMap = {};
    const reverseDataShaperMap = {};

    _.forEach(entity.getAttributes(), (attribute) => {
      const fieldName = attribute.primary
        ? 'id'
        : protocolConfiguration.generateFieldName(attribute);

      dataShaperMap[fieldName] = attribute.name;
      reverseDataShaperMap[attribute.name] = fieldName;

      let fieldNameI18n: string;
      let fieldNameI18nJson: string;

      if (attribute.i18n) {
        fieldNameI18n = protocolConfiguration.generateI18nFieldName(attribute);
        dataShaperMap[fieldNameI18n] = `${attribute.name}.i18n`;
        reverseDataShaperMap[`${attribute.name}.i18n`] = fieldNameI18n;

        fieldNameI18nJson = protocolConfiguration.generateI18nJsonFieldName(
          attribute,
        );
        dataShaperMap[fieldNameI18nJson] = `${attribute.name}.i18n`;
        // no i18n JSON output mapping for reverse shaper map
        // so it doesn't overwrite values in mutation inputs
      }

      // entity.setAttributeGraphqlMeta(attribute.name, {
      //   fieldName,
      //   fieldNameI18n,
      //   fieldNameI18nJson,
      // });
    });

    // forward relay type promoter field as well
    dataShaperMap[RELAY_TYPE_PROMOTER_FIELD] = RELAY_TYPE_PROMOTER_FIELD;
    reverseDataShaperMap[RELAY_TYPE_PROMOTER_FIELD] = RELAY_TYPE_PROMOTER_FIELD;

    // generate json shaper - translate schema attribute names to graphql attribute names
    const dataShaper = shaper(dataShaperMap);
    const reverseDataShaper = shaper(reverseDataShaperMap);

    registerEntity({
      entity,
      typeName: protocolConfiguration.generateEntityTypeName(entity),
      typeNamePlural: protocolConfiguration.generateEntityTypeNamePlural(
        entity,
      ),
      typeNamePascalCase: protocolConfiguration.generateEntityTypeNamePascalCase(
        entity,
      ),
      typeNamePluralPascalCase: protocolConfiguration.generateEntityTypeNamePluralPascalCase(
        entity,
      ),
      attributes: {},
      dataShaper: (data) => {
        return data ? dataShaper(data) : data;
      },
      dataSetShaper: (set) => {
        return set.map(dataShaper);
      },
      reverseDataShaper: (data) => {
        return data ? reverseDataShaper(data) : data;
      },
    });
  });
};

// get node definitions for relay
const getNodeDefinitions = () => {
  const idFetcher = (globalId, context) => {
    const { type, id } = fromGlobalId(globalId);

    // resolve based on type and id
    const entity = graphRegistry.types[type]
      ? graphRegistry.types[type].entity
      : null;

    if (entity) {
      const resolver = resolveByFindOne(entity, () => id);
      return resolver(null, null, context);
    }

    return null;
  };

  const typeResolver = (obj) => {
    const typeName = obj[RELAY_TYPE_PROMOTER_FIELD];

    return graphRegistry.types[typeName]
      ? graphRegistry.types[typeName].type
      : null;
  };

  return {
    ...nodeDefinitions(idFetcher, typeResolver),
    idFetcher,
  };
};

const registerAction = (action) => {
  const actionName = action.name;
  graphRegistry.actions[actionName] = {
    action,
  };
};

export const registerActions = (actions) => {
  _.forEach(actions, (action) => registerAction(action));
};

export const generateGraphQLSchema = (configuration) => {
  if (!isConfiguration(configuration)) {
    throw new Error(
      'Invalid configuration object provided to generateGraphQLSchema()',
    );
  }

  const schema = configuration.getSchema();
  const protocolConfiguration = configuration.getProtocolConfiguration();

  ProtocolGraphQL.setProtocolConfiguration(protocolConfiguration);

  const { nodeInterface, nodeField, idFetcher } = getNodeDefinitions();

  registerActions(schema.getActions());

  // prepare models for graphql
  extendModelsForGql(schema.getEntities());

  _.forEach(schema.getEntities(), (entity) => {
    const typeName = entity.graphql.typeName;

    const objectType = new GraphQLObjectType({
      name: protocolConfiguration.generateEntityTypeNamePascalCase(entity),
      description: entity.description,
      interfaces: [nodeInterface],

      fields: () => {
        const fields = {
          id: {
            type: new GraphQLNonNull(GraphQLID),
          },
          nodeId: {
            description: 'The node ID of an object',
            type: new GraphQLNonNull(GraphQLID),
            resolve: (obj) => toGlobalId(typeName, obj.id),
          },
        };

        const fieldsReference = {};
        const fieldsI18n = {};

        _.forEach(entity.getAttributes(), (attribute) => {
          if (attribute.hidden || attribute.mutationInput) {
            return;
          }

          // const field = {
          //   description: attribute.description,
          // };

          let attributeType = attribute.type;

          // it's a reference
          if (isEntity(attributeType) || isShadowEntity(attributeType)) {
            const targetEntity = attributeType;
            const primaryAttribute = targetEntity.getPrimaryAttribute();
            attributeType = primaryAttribute.type;

            // const reference = {
            //   description: attribute.description,
            // };

            const targetTypeName = targetEntity.graphql.typeName;

            // reference.type = graphRegistry.types[targetTypeName].type;
            // reference.resolve = resolveByFindOne(
            //   targetEntity,
            //   ({ source }) => source[attribute.gqlFieldName],
            // );

            const reference = {
              description: attribute.description,
              type: graphRegistry.types[targetTypeName].type,
              resolve: resolveByFindOne(
                targetEntity,
                ({ source }) => source[attribute.gqlFieldName],
              ),
            };

            const referenceFieldName = protocolConfiguration.generateReferenceFieldName(
              targetEntity,
              attribute,
            );
            fieldsReference[referenceFieldName] = reference;
          }

          const fieldType = ProtocolGraphQL.convertToProtocolDataType(
            attributeType,
            entity.name,
            false,
          );

          // make it non-nullable if it's required
          // if (attribute.required) {
          //   field.type = new GraphQLNonNull(fieldType);
          // } else {
          //   field.type = fieldType;
          // }

          // use computed value's function as the field resolver
          // if (attribute.resolve) {
          //   field.resolve = attribute.resolve;
          // }

          const field = {
            description: attribute.description,
            type: attribute.required
              ? new GraphQLNonNull(fieldType)
              : fieldType,
            resolve: attribute.resolve ? attribute.resolve : undefined,
          };

          fields[attribute.gqlFieldName] = field;

          if (attribute.i18n) {
            // JSON i18n output
            const i18nJsonFieldType = ProtocolGraphQL.convertToProtocolDataType(
              DataTypeI18n,
              entity.name,
              false,
            );

            const i18nJsonField = {
              type: attribute.required
                ? new GraphQLNonNull(i18nJsonFieldType)
                : i18nJsonFieldType,
              description: `Translations of **\`${attribute.gqlFieldName}\`** in JSON format`,
            };

            fieldsI18n[attribute.gqlFieldNameI18nJson] = i18nJsonField;

            // Object Type i18n output
            const i18nFieldType = new GraphQLObjectType({
              name: protocolConfiguration.generateI18nFieldTypeName(
                entity,
                attribute,
              ),
              description: `Translations of **\`${attribute.gqlFieldName}\`**`,

              fields: () => {
                const languages = configuration.getLanguages();
                const i18nFields = {};

                languages.map((language, langIdx) => {
                  const type =
                    langIdx === 0 && attribute.required
                      ? new GraphQLNonNull(fieldType)
                      : fieldType;

                  i18nFields[language] = {
                    type,
                  };
                });

                return i18nFields;
              },
            });

            fieldsI18n[attribute.gqlFieldNameI18n] = {
              type: attribute.required
                ? new GraphQLNonNull(i18nFieldType)
                : i18nFieldType,
            };
          }
        });

        Object.assign(
          fields,
          fieldsI18n,
          fieldsReference,
          generateReverseConnections(configuration, graphRegistry, entity),
        );

        return fields;
      },
    });

    graphRegistry.types[typeName] = {
      entity,
      type: objectType,
    };

    if (isEntity(entity) || isViewEntity(entity)) {
      registerConnection(graphRegistry, entity);
    }
  });

  generateInstanceUniquenessInputs(graphRegistry);

  // build the query type
  const queryType = new GraphQLObjectType({
    name: 'Query',
    // root: 'The root query type',

    fields: () => {
      const listQueries = generateListQueries(graphRegistry);
      const instanceQueries = generateInstanceQueries(graphRegistry, idFetcher);
      const actions = generateActions(graphRegistry, ACTION_TYPE_QUERY);

      // override args.id of relay to args.nodeId
      nodeField.args.nodeId = nodeField.args.id;
      nodeField.resolve = (_obj, { nodeId }, context, info) =>
        idFetcher(nodeId, context, info);
      delete nodeField.args.id;

      return {
        node: nodeField,
        ...instanceQueries,
        ...listQueries,
        ...actions,
      };
    },
  });

  const mutationType = new GraphQLObjectType({
    name: 'Mutation',
    // root: 'The root mutation type',

    fields: () => {
      const mutations = generateMutations(graphRegistry);
      const actions = generateActions(graphRegistry, ACTION_TYPE_MUTATION);

      return {
        ...mutations,
        ...actions,
      };
    },
  });

  const subscriptionType = new GraphQLObjectType({
    name: 'Subscription',
    // root: 'The root subscription type',

    fields: () => {
      const subscriptions = generateSubscriptions(graphRegistry);

      return subscriptions;
    },
  });

  // put it all together into a graphQL schema
  return new GraphQLSchema({
    query: queryType,
    mutation: mutationType,
    subscription: subscriptionType,
  });
};
