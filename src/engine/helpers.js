import * as _ from 'lodash';

export const fillSystemAttributesDefaultValues = (
  entity,
  entityMutation,
  payload,
  context,
) => {
  const ret = {
    ...payload,
  };

  const entityAttributes = entity.getAttributes();
  const systemAttributes = _.filter(
    entityAttributes,
    attribute => attribute.isSystemAttribute && attribute.defaultValue,
  );

  systemAttributes.map(attribute => {
    const attributeName = attribute.name;
    const defaultValue = attribute.defaultValue;

    const value = defaultValue(ret, entityMutation, entity, context);
    if (typeof value !== 'undefined') {
      ret[attributeName] = value;
    }
  });

  return ret;
};

export const fillDefaultValues = async (
  entity,
  entityMutation,
  payload,
  context,
) => {
  const ret = {
    ...payload,
  };

  const entityAttributes = entity.getAttributes();
  const payloadAttributes = Object.keys(payload);
  const requiredAttributes = _.filter(
    entityAttributes,
    attribute => attribute.required && !attribute.isSystemAttribute,
  );

  await Promise.all(
    requiredAttributes.map(async attribute => {
      const attributeName = attribute.name;
      if (!payloadAttributes.includes(attributeName)) {
        if (attribute.defaultValue) {
          ret[attributeName] = await attribute.defaultValue(
            payload,
            entityMutation,
            entity,
            context,
          );
        }
      }
    }),
  );

  return ret;
};

export const serializeValues = (
  entity,
  entityMutation,
  payload,
  model,
  context,
) => {
  const ret = {
    ...payload,
  };

  const entityAttributes = entity.getAttributes();

  _.forEach(entityAttributes, attribute => {
    const attributeName = attribute.name;
    const gqlFieldNameI18n = attribute.gqlFieldNameI18n;

    if (attribute.serialize) {
      if (attribute.i18n && typeof ret[gqlFieldNameI18n] !== 'undefined') {
        Object.keys(ret[gqlFieldNameI18n]).map(language => {
          ret[gqlFieldNameI18n][language] = attribute.serialize(
            ret[gqlFieldNameI18n][language],
            ret,
            entityMutation,
            entity,
            model,
            context,
            language,
          );
        });
      }
      else if (typeof ret[attributeName] !== 'undefined') {
        ret[attributeName] = attribute.serialize(
          ret[attributeName],
          ret,
          entityMutation,
          entity,
          model,
          context,
        );
      }
    }
  });

  return ret;
};
