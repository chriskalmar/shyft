import * as _ from 'lodash';
import {
  addRelayTypePromoterToList,
  addRelayTypePromoterToInstanceFn,
  translateList,
  translateInstanceFn,
} from './util';
import { ProtocolGraphQL } from './ProtocolGraphQL';
import { ProtocolGraphQLConfiguration } from './ProtocolGraphQLConfiguration';

import {
  validateConnectionArgs,
  forceSortByUnique,
  connectionFromData,
} from './connection';

import { transformFilterLevel } from './filter';

import { addRelayTypePromoterToInstance, translateInstance } from './util';

import {
  getEntityUniquenessAttributes,
  checkRequiredI18nInputs,
} from './helper';
import { isEntity, Entity } from '../engine/entity/Entity';
import {
  MUTATION_TYPE_CREATE,
  MUTATION_TYPE_UPDATE,
  MUTATION_TYPE_DELETE,
  Mutation,
} from '../engine/mutation/Mutation';
import {
  SUBSCRIPTION_TYPE_CREATE,
  SUBSCRIPTION_TYPE_UPDATE,
  // SUBSCRIPTION_TYPE_DELETE,
  pubsub,
  Subscription,
} from '../engine/subscription/Subscription';
import { CustomError } from '../engine/CustomError';
import {
  fillSystemAttributesDefaultValues,
  fillDefaultValues,
  serializeValues,
} from '../engine/helpers';
import { validateMutationPayload } from '../engine/validation';
import {
  buildActionPermissionFilter,
  Permission,
} from '../engine/permission/Permission';
import { Context } from '../engine/context/Context';
import { GraphQLResolveInfo } from 'graphql';

const AccessDeniedError = new CustomError(
  'Access denied',
  'PermissionError',
  403,
);

export const resolveByFind = (
  entity: Entity,
  parentConnectionCollector?: any,
) => {
  const storageType = entity.storageType;
  const protocolConfiguration = ProtocolGraphQL.getProtocolConfiguration() as ProtocolGraphQLConfiguration;

  return async (source, args, context, info) => {
    const parentConnection = parentConnectionCollector
      ? parentConnectionCollector({ source, args, context, info })
      : null;

    // validateConnectionArgs(source, args, context, info);
    validateConnectionArgs(source, args);
    forceSortByUnique(args.orderBy, entity);

    if (entity.preProcessor) {
      const preProcessorResult = await entity.preProcessor({
        entity,
        source,
        args,
        context,
        info,
      });
      if (preProcessorResult) {
        /* eslint-disable no-param-reassign */
        // console.log('after preProcessor', args, preProcessorResult);
        args = preProcessorResult.args
          ? { ...args, ...preProcessorResult.args }
          : args;
        if (preProcessorResult.context) {
          if (Object.keys(context).length > 0) {
            context = { ...context, ...preProcessorResult.context };
          } else {
            context = preProcessorResult.context;
          }
        }

        /* eslint-enable no-param-reassign */
      }
    }

    args.filter = await transformFilterLevel(
      entity,
      args.filter,
      entity.getAttributes(),
      context,
    );

    const { data, pageInfo } = await storageType.find(
      entity,
      args,
      context,
      parentConnection,
    );

    const transformed = entity.graphql.dataSetShaper(
      addRelayTypePromoterToList(
        protocolConfiguration.generateEntityTypeName(entity),
        data,
      ),
    );

    const translated = translateList(entity, transformed, context);

    const transformedData = entity.postProcessor
      ? translated.map((translatedRow) =>
          entity.postProcessor({
            result: translatedRow,
            entity,
            source,
            args,
            context,
            info,
          }),
        )
      : translated;

    return connectionFromData(
      {
        transformedData,
        originalData: data,
      },
      entity,
      source,
      args,
      context,
      info,
      parentConnection,
      pageInfo,
    );
  };
};

export const resolveByFindOne = (entity: Entity, idCollector) => {
  const storageType = entity.storageType;
  const protocolConfiguration = ProtocolGraphQL.getProtocolConfiguration() as ProtocolGraphQLConfiguration;

  return async (
    source: any,
    args: any,
    context?: Context,
    info?: GraphQLResolveInfo,
  ) => {
    const id = idCollector({ source, args, context });

    if (id === null || typeof id === 'undefined') {
      return Promise.resolve(null);
    }

    return storageType
      .findOne(entity, id, args, context)
      .then(
        addRelayTypePromoterToInstanceFn(
          protocolConfiguration.generateEntityTypeName(entity),
        ),
      )
      .then(entity.graphql.dataShaper)
      .then(translateInstanceFn(entity, context))
      .then((translated) => {
        return entity.postProcessor
          ? entity.postProcessor({
              result: translated,
              entity,
              source,
              args,
              context,
              info,
            })
          : translated;
      });
  };
};

export const getNestedPayloadResolver = (
  entity,
  attributeNames,
  storageType,
  path = [],
) => {
  const protocolConfiguration = ProtocolGraphQL.getProtocolConfiguration() as ProtocolGraphQLConfiguration;

  return async (source, args, context, info) => {
    const resultPayload = {};
    const entityAttributes = entity.getAttributes();

    await Promise.all(
      attributeNames.map(async (attributeName) => {
        const attribute = entityAttributes[attributeName];
        const attributeType = attribute.type;

        if (isEntity(attributeType)) {
          const targetEntity = attributeType;
          const uniquenessAttributesList = getEntityUniquenessAttributes(
            targetEntity,
          );

          if (uniquenessAttributesList.length > 0) {
            const uniquenessFieldNames = [attribute.gqlFieldName];
            const fieldNameToUniquenessAttributesMap = {};

            uniquenessAttributesList.map(({ uniquenessName, attributes }) => {
              const fieldName = protocolConfiguration.generateUniquenessAttributesFieldName(
                entity,
                attribute,
                uniquenessName,
              );
              uniquenessFieldNames.push(fieldName);
              fieldNameToUniquenessAttributesMap[fieldName] = attributes;
            });

            let foundInput = null;

            uniquenessFieldNames.map((uniquenessFieldName) => {
              if (args[uniquenessFieldName]) {
                if (foundInput) {
                  throw new CustomError(
                    `Only one of these fields may be used: ${uniquenessFieldNames.join(
                      ', ',
                    )}`,
                    'AmbigiousNestedInputError',
                  );
                }

                foundInput = uniquenessFieldName;
              }
            });

            if (!foundInput) {
              if (attribute.required) {
                throw new CustomError(
                  `Provide one of these fields: ${uniquenessFieldNames.join(
                    ', ',
                  )}`,
                  'MissingNestedInputError',
                );
              }
            } else {
              const attributes = targetEntity.getAttributes();
              const primaryAttributeName = _.findKey(attributes, {
                primary: true,
              });
              const uniquenessAttributes =
                fieldNameToUniquenessAttributesMap[foundInput];

              let result;

              if (uniquenessAttributes) {
                const newPath = path.concat(foundInput);
                const nestedPayloadResolver = getNestedPayloadResolver(
                  targetEntity,
                  uniquenessAttributes,
                  storageType,
                  newPath,
                );
                args[foundInput] = await nestedPayloadResolver(
                  source,
                  args[foundInput],
                  context,
                  info,
                );

                result = await storageType
                  .findOneByValues(targetEntity, args[foundInput], context)
                  .then(targetEntity.graphql.dataShaper);

                if (!result) {
                  throw new CustomError(
                    `Nested instance at path '${newPath.join(
                      '.',
                    )}' not found or access denied`,
                    'NestedInstanceNotFoundOrAccessDenied',
                  );
                }

                if (result) {
                  resultPayload[attribute.gqlFieldName] =
                    result[primaryAttributeName];
                }
              } else {
                resultPayload[attribute.gqlFieldName] = args[foundInput];
              }
            }
          } else {
            resultPayload[attribute.gqlFieldName] =
              args[attribute.gqlFieldName];
          }
        } else {
          resultPayload[attribute.gqlFieldName] = args[attribute.gqlFieldName];

          if (attribute.i18n) {
            resultPayload[attribute.gqlFieldNameI18n] =
              args[attribute.gqlFieldNameI18n];
          }
        }
      }),
    );

    return resultPayload;
  };
};

export const getMutationResolver = (
  entity: Entity | any,
  entityMutation: Mutation,
  typeName: string,
  nested: boolean,
  idResolver: Function,
) => {
  const storageType = entity.storageType;
  const protocolConfiguration = ProtocolGraphQL.getProtocolConfiguration() as ProtocolGraphQLConfiguration;

  const nestedPayloadResolver = getNestedPayloadResolver(
    entity,
    entityMutation.attributes,
    storageType,
  );

  return async (source, args, context, info) => {
    checkRequiredI18nInputs(
      entity,
      entityMutation,
      args.input[typeName],
      // context,
    );

    if (nested) {
      args.input[typeName] = await nestedPayloadResolver(
        source,
        args.input[typeName],
        context,
        info,
      );
    }

    const id = idResolver({ args });

    try {
      if (entityMutation.preProcessor) {
        args.input[typeName] = await entityMutation.preProcessor(
          entity,
          id,
          source,
          args.input[typeName],
          typeName,
          entityMutation,
          context,
          info,
        );
      }

      if (entityMutation.type === MUTATION_TYPE_CREATE) {
        args.input[typeName] = await fillDefaultValues(
          entity,
          entityMutation,
          args.input[typeName],
          context,
        );
      }

      if (
        entityMutation.type === MUTATION_TYPE_CREATE ||
        entityMutation.type === MUTATION_TYPE_UPDATE
      ) {
        args.input[typeName] = fillSystemAttributesDefaultValues(
          entity,
          entityMutation,
          args.input[typeName],
          context,
        );
      }

      await validateMutationPayload(
        entity,
        entityMutation,
        args.input[typeName],
        context,
      );

      if (entityMutation.type !== MUTATION_TYPE_DELETE) {
        //
        // this function might be wrong when we look serializeValues args
        // unless we add typeName ?
        args.input[typeName] = serializeValues(
          entity,
          entityMutation,
          args.input[typeName],
          typeName,
          context,
        );
      }

      let ret = {
        clientMutationId: args.input.clientMutationId,
      };

      const input = entity.graphql.reverseDataShaper(args.input[typeName]);
      let result = await storageType.mutate(
        entity,
        id,
        input,
        entityMutation,
        context,
      );

      if (result) {
        if (entityMutation.type !== MUTATION_TYPE_DELETE) {
          result = entity.graphql.dataShaper(
            addRelayTypePromoterToInstance(
              protocolConfiguration.generateEntityTypeName(entity),
              result,
            ),
          );

          result = translateInstance(entity, result, context);
        }
      }

      if (entityMutation.type === MUTATION_TYPE_DELETE) {
        ret = {
          ...ret,
          ...result,
        };
      } else {
        ret[typeName] = result;
      }

      if (entityMutation.postProcessor) {
        await entityMutation.postProcessor(
          null,
          result,
          entity,
          id,
          source,
          args.input[typeName],
          typeName,
          entityMutation,
          context,
          info,
        );
      }

      return ret;
    } catch (error) {
      if (entityMutation.postProcessor) {
        await entityMutation.postProcessor(
          error,
          null,
          entity,
          id,
          source,
          args.input[typeName],
          typeName,
          entityMutation,
          context,
          info,
        );
      }

      throw error;
    }
  };
};

export const handleSubscriptionPermission = async (
  context: any,
  entity: Entity,
  entitySubscription: Subscription,
  input: any,
) => {
  const permissionsMap = entity.getPermissions();
  if (
    !permissionsMap ||
    !permissionsMap.subscriptions ||
    !Object.keys(permissionsMap.subscriptions).length
  ) {
    return null;
  }

  const subPermissions = ([] as Permission[]).concat(
    ...Object.values(permissionsMap.subscriptions as Permission | Permission[]),
  );

  const { userId, userRoles } = context;

  const {
    where: permissionWhere,
    lookupPermissionEntity,
  } = await buildActionPermissionFilter(
    subPermissions,
    userId,
    userRoles,
    entitySubscription,
    input,
    context,
  );

  if (!permissionWhere) {
    throw AccessDeniedError;
  }

  // console.log('handleSubscriptionPermission', {
  //   permissionWhere,
  //   lookupPermissionEntity,
  // });

  // only if non-empty where clause
  if (Object.keys(permissionWhere).length > 0) {
    const storageType = lookupPermissionEntity.getStorageType();
    const found = await storageType.checkLookupPermission(
      lookupPermissionEntity,
      permissionWhere,
      context,
    );

    if (!found) {
      throw AccessDeniedError;
    }
  }

  return permissionWhere;
};

export const setTopicEnd = (entitySubscription: Subscription): string =>
  entitySubscription.wildCard
    ? entitySubscription.delimiter + entitySubscription.wildCard
    : '';

export const getSubscriptionResolver = (
  entity: Entity,
  entitySubscription: Subscription,
  typeName: string,
  nested: boolean,
  idResolver: Function,
) => {
  const storageType = entity.storageType;

  const nestedPayloadResolver = getNestedPayloadResolver(
    entity,
    entitySubscription.attributes,
    storageType,
  );

  return async (
    source,
    args,
    context,
    info,
  ): Promise<AsyncIterator<unknown, any, undefined>> => {
    checkRequiredI18nInputs(
      entity,
      entitySubscription,
      args.input[typeName],
      // context,
    );

    await handleSubscriptionPermission(
      context,
      entity,
      entitySubscription,
      args.input[typeName],
    );

    if (nested) {
      args.input[typeName] = await nestedPayloadResolver(
        source,
        args.input[typeName],
        context,
        info,
      );
    }

    const id = idResolver({ args });

    if (
      entitySubscription.type === SUBSCRIPTION_TYPE_CREATE ||
      entitySubscription.type === SUBSCRIPTION_TYPE_UPDATE
    ) {
      args.input[typeName] = fillSystemAttributesDefaultValues(
        entity,
        entitySubscription,
        args.input[typeName],
        context,
      );
    }

    // await validateSubscriptionPayload(
    //   entity,
    //   entitySubscription,
    //   args.input[typeName],
    //   context,
    // );

    // if (entitySubscription.type !== SUBSCRIPTION_TYPE_DELETE) {
    //   //
    //   // this function might be wrong when we look serializeValues args
    //   // unless we add typeName ?
    //   args.input[typeName] = serializeValues(
    //     entity,
    //     entitySubscription,
    //     args.input[typeName],
    //     typeName,
    //     context,
    //   );
    // }

    let extraTopic: string;
    const delimiter = entitySubscription.delimiter;
    const baseTopic = `${entitySubscription.name}${entity.name}`;

    if (entitySubscription.pattern) {
      const params = entitySubscription.pattern
        .split(delimiter)
        .reduce((acc, curr) => (acc[curr] = args.input[typeName][curr]), {});
      // console.log('getSubscriptionResolver', { params });

      const filled = Object.values(params).join(delimiter);
      // console.log('getSubscriptionResolver', { filled });
      extraTopic = `${delimiter}${filled}${setTopicEnd(entitySubscription)}`;
    } else if (entitySubscription.preProcessor) {
      extraTopic = await entitySubscription.preProcessor(
        entity,
        id,
        source,
        args.input[typeName],
        typeName,
        entitySubscription,
        context,
        info,
      );
    }
    if (!extraTopic) {
      extraTopic = setTopicEnd(entitySubscription);
    }

    const topic = `${baseTopic}${extraTopic}`;

    return context.pubsub
      ? context.pubsub.asyncIterator(topic)
      : pubsub.asyncIterator(topic);
  };
};

export const getSubscriptionPayloadResolver = (
  entity: Entity,
  entitySubscription: Subscription,
  typeName,
) => {
  return async (source, args, context, info) => {
    // let ret = {
    //   clientSubscriptionId: args.input.clientSubscriptionId,
    // };

    let ret = {};

    let result;
    if (entitySubscription.postProcessor) {
      result = await entitySubscription.postProcessor(
        entity,
        // id,
        source,
        args.input[typeName],
        typeName,
        entitySubscription,
        context,
        info,
      );
    }

    if (!result) {
      result = source;
    }

    if (entitySubscription.type === MUTATION_TYPE_DELETE) {
      ret = {
        ...ret,
        ...result,
      };
    } else {
      ret[typeName] = result;
    }

    return ret;
  };
};
