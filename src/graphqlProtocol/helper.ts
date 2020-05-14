import * as _ from 'lodash';
import { ProtocolGraphQL } from './ProtocolGraphQL';
import { ProtocolGraphQLConfiguration } from './ProtocolGraphQLConfiguration';

import { INDEX_UNIQUE } from '../engine/index/Index';
import { CustomError } from '../engine/CustomError';
import { Entity, Mutation, Subscription } from '..';

export const getEntityUniquenessAttributes = entity => {
  const protocolConfiguration = ProtocolGraphQL.getProtocolConfiguration() as ProtocolGraphQLConfiguration;

  const ret = [];

  if (!entity.getIndexes) {
    return ret;
  }

  const entityIndexes = entity.getIndexes();

  if (entityIndexes) {
    entityIndexes.map(({ type, attributes }) => {
      if (type === INDEX_UNIQUE) {
        ret.push({
          uniquenessName: protocolConfiguration.generateUniquenessAttributesName(
            entity,
            attributes,
          ),
          attributes,
        });
      }
    });
  }

  return ret;
};

export const checkRequiredI18nInputs = (
  entity: Entity | any,
  operation: Mutation | Subscription,
  input: any,
) => {
  const entityAttributes = entity.getAttributes();

  _.forEach(operation.attributes, attributeName => {
    const attribute = entityAttributes[attributeName];
    const { gqlFieldName, gqlFieldNameI18n } = attribute;

    if (attribute.i18n) {
      if (
        input[gqlFieldName] &&
        input[gqlFieldNameI18n] &&
        input[gqlFieldNameI18n]
      ) {
        throw new CustomError(
          `Only one of these fields may be used: ${gqlFieldName}, ${gqlFieldNameI18n}`,
          'AmbigiousI18nInputError',
        );
      }

      if (attribute.required && !operation.ignoreRequired) {
        if (!input[gqlFieldName] && !input[gqlFieldNameI18n]) {
          throw new CustomError(
            `Provide one of these fields: ${gqlFieldName}, ${gqlFieldNameI18n}`,
            'MissingI18nInputError',
          );
        }
      }
    }
  });
};
