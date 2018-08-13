import ProtocolGraphQL from './ProtocolGraphQL';
import _ from 'lodash';
import { INDEX_UNIQUE, CustomError } from 'shift-engine';

export const getEntityUniquenessAttributes = entity => {
  const protocolConfiguration = ProtocolGraphQL.getProtocolConfiguration();

  const ret = [];
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

export const checkRequiredI18nInputs = (entity, entityMutation, input) => {
  const entityAttributes = entity.getAttributes();

  _.forEach(entityMutation.attributes, attributeName => {
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

      if (attribute.required && !entityMutation.ignoreRequired) {
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
