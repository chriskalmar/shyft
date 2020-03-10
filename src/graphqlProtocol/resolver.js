import {
  addRelayTypePromoterToList,
  addRelayTypePromoterToInstanceFn,
  translateList,
  translateInstanceFn,
} from './util';

import { ProtocolGraphQL } from './ProtocolGraphQL';

import {
  validateConnectionArgs,
  forceSortByUnique,
  connectionFromData,
} from './connection';

import { transformFilterLevel } from './filter';

import * as _ from 'lodash';

import { addRelayTypePromoterToInstance, translateInstance } from './util';

import {
  getEntityUniquenessAttributes,
  checkRequiredI18nInputs,
} from './helper';
import { isEntity } from '../engine/entity/Entity';
import {
  MUTATION_TYPE_CREATE,
  MUTATION_TYPE_UPDATE,
  MUTATION_TYPE_DELETE,
} from '../engine/mutation/Mutation';
import { CustomError } from '../engine/CustomError';
import {
  fillSystemAttributesDefaultValues,
  fillDefaultValues,
  serializeValues,
} from '../engine/helpers';
import { validateMutationPayload } from '../engine/validation';

export const resolveByFind = (entity, parentConnectionCollector) => {
  const storageType = entity.storageType;
  const protocolConfiguration = ProtocolGraphQL.getProtocolConfiguration();

  return async (source, args, context, info) => {
    const parentConnection = parentConnectionCollector
      ? parentConnectionCollector({ source, args, context, info })
      : null;

    validateConnectionArgs(source, args, context, info);
    forceSortByUnique(args.orderBy, entity);

    args.filter = await transformFilterLevel(
      entity,
      args.filter,
      entity.getAttributes(),
      context,
    );

    // implementing entity.preProcessor here is correct ?
    if (entity.preProcessor) {
      const preProcessorResult = await entity.preProcessor(
        entity,
        source,
        args,
        context,
        info,
      );
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
      ? translated.map(translatedRow =>
        entity.postProcessor(
          translatedRow,
          entity,
          source,
          args,
          context,
          info,
        ),
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

export const resolveByFindOne = (entity, idCollector) => {
  const storageType = entity.storageType;
  const protocolConfiguration = ProtocolGraphQL.getProtocolConfiguration();

  return async (source, args, context, info) => {
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
      .then(translated => {
        return entity.postProcessor
          ? entity.postProcessor(
            translated,
            entity,
            source,
            args,
            context,
            info,
          )
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
  const protocolConfiguration = ProtocolGraphQL.getProtocolConfiguration();

  return async (source, args, context, info) => {
    const resultPayload = {};
    const entityAttributes = entity.getAttributes();

    await Promise.all(
      attributeNames.map(async attributeName => {
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

            uniquenessFieldNames.map(uniquenessFieldName => {
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
  entity,
  entityMutation,
  typeName,
  nested,
  idResolver,
) => {
  const storageType = entity.storageType;
  const protocolConfiguration = ProtocolGraphQL.getProtocolConfiguration();
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
      context,
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
        args.input[typeName] = serializeValues(
          entity,
          entityMutation,
          args.input[typeName],
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
