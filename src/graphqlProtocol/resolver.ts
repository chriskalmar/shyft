import * as _ from 'lodash';
import {
  addRelayTypePromoterToList,
  addRelayTypePromoterToInstanceFn,
  translateList,
  translateInstanceFn,
  addRelayTypePromoterToInstance,
  translateInstance,
} from './util';
import { ProtocolGraphQL } from './ProtocolGraphQL';
import { ProtocolGraphQLConfiguration } from './ProtocolGraphQLConfiguration';

import {
  validateConnectionArgs,
  forceSortByUnique,
  connectionFromData,
  Connection,
} from './connection';

import { transformFilterLevel } from './filter';

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
import { ShadowEntity } from '../engine/entity/ShadowEntity';
import { getRegisteredEntity, getRegisteredEntityAttribute } from './registry';
import { ViewEntity } from '..';
import { isViewEntity } from '../engine/entity/ViewEntity';

const AccessDeniedError = new CustomError(
  'Access denied',
  'PermissionError',
  403,
);

type GraphQLFieldResolveFn = (
  source?: any,
  args?: { [key: string]: unknown },
  context?: Context,
  info?: GraphQLResolveInfo,
) => any;

export const resolveByFind = (
  entity: Entity | ViewEntity,
  parentConnectionCollector?: any,
): GraphQLFieldResolveFn => {
  const storageType = entity.storageType;
  const protocolConfiguration = ProtocolGraphQL.getProtocolConfiguration() as ProtocolGraphQLConfiguration;

  return async (source, args, context, info): Promise<Connection> => {
    const parentConnection = parentConnectionCollector
      ? parentConnectionCollector({ source, args, context, info })
      : null;

    // validateConnectionArgs(source, args, context, info);
    validateConnectionArgs(source, args);
    forceSortByUnique(args.orderBy, entity);

    let finalContext = context;
    let finalArgs = args;

    if (entity.preProcessor) {
      const preProcessorResult = isEntity(entity)
        ? await entity.preProcessor({
            entity,
            source,
            args,
            context,
            info,
          })
        : await entity.preProcessor({
            entity,
            source,
            args,
            context,
            info,
          });

      if (preProcessorResult) {
        finalArgs = preProcessorResult.args
          ? { ...finalArgs, ...preProcessorResult.args }
          : args;
        if (preProcessorResult.context) {
          if (Object.keys(finalContext).length > 0) {
            finalContext = { ...finalContext, ...preProcessorResult.context };
          } else {
            finalContext = preProcessorResult.context;
          }
        }
      }
    }

    finalArgs.filter = await transformFilterLevel(
      entity,
      finalArgs.filter,
      entity.getAttributes(),
      finalContext,
    );

    const { data, pageInfo } = await storageType.find(
      entity,
      finalArgs,
      finalContext,
      parentConnection,
    );

    const { dataSetShaper } = getRegisteredEntity(entity.name);
    const transformed = dataSetShaper(
      addRelayTypePromoterToList(
        protocolConfiguration.generateEntityTypeName(entity),
        data,
      ),
    );

    const translated = translateList(entity, transformed, finalContext);

    const transformedData = entity.postProcessor
      ? translated.map((translatedRow) =>
          isEntity(entity)
            ? entity.postProcessor({
                result: translatedRow,
                entity,
                source,
                args: finalArgs,
                context: finalContext,
                info,
              })
            : entity.postProcessor({
                result: translatedRow,
                entity,
                source,
                args: finalArgs,
                context: finalContext,
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
      finalArgs,
      finalContext,
      info,
      parentConnection,
      pageInfo,
    );
  };
};

export const resolveByFindOne = (
  entity: Entity | ViewEntity | ShadowEntity,
  idCollector,
): GraphQLFieldResolveFn => {
  const storageType = entity.storageType;
  const protocolConfiguration = ProtocolGraphQL.getProtocolConfiguration() as ProtocolGraphQLConfiguration;

  return (source, args, context, info) => {
    const id = idCollector({ source, args, context });

    if (id === null || typeof id === 'undefined') {
      return Promise.resolve(null);
    }

    const { dataShaper } = getRegisteredEntity(entity.name);

    return storageType
      .findOne(entity, id, args, context)
      .then(
        addRelayTypePromoterToInstanceFn(
          protocolConfiguration.generateEntityTypeName(entity),
        ),
      )
      .then(dataShaper)
      .then(translateInstanceFn(entity, context))
      .then((translated) => {
        return isEntity(entity) && entity.postProcessor
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

        const {
          fieldName: gqlFieldName,
          fieldNameI18n: gqlFieldNameI18n,
        } = getRegisteredEntityAttribute(entity.name, attribute.name);

        if (isEntity(attributeType)) {
          const targetEntity = attributeType;
          const uniquenessAttributesList = getEntityUniquenessAttributes(
            targetEntity,
          );

          if (uniquenessAttributesList.length > 0) {
            const uniquenessFieldNames = [gqlFieldName];
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

                const { dataShaper } = getRegisteredEntity(targetEntity.name);

                result = await storageType
                  .findOneByValues(targetEntity, args[foundInput], context)
                  .then(dataShaper);

                if (!result) {
                  throw new CustomError(
                    `Nested instance at path '${newPath.join(
                      '.',
                    )}' not found or access denied`,
                    'NestedInstanceNotFoundOrAccessDenied',
                  );
                }

                if (result) {
                  resultPayload[gqlFieldName] = result[primaryAttributeName];
                }
              } else {
                resultPayload[gqlFieldName] = args[foundInput];
              }
            }
          } else {
            resultPayload[gqlFieldName] = args[gqlFieldName];
          }
        } else {
          resultPayload[gqlFieldName] = args[gqlFieldName];

          if (attribute.i18n) {
            resultPayload[gqlFieldNameI18n] = args[gqlFieldNameI18n];
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

      const { dataShaper, reverseDataShaper } = getRegisteredEntity(
        entity.name,
      );
      const input = reverseDataShaper(args.input[typeName]);

      let result = await storageType.mutate(
        entity,
        id,
        input,
        entityMutation,
        context,
      );

      if (result) {
        if (entityMutation.type !== MUTATION_TYPE_DELETE) {
          result = dataShaper(
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
