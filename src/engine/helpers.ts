import * as _ from 'lodash';
import { Entity, Subscription } from '..';
import { Mutation } from './mutation/Mutation';

export const fillSystemAttributesDefaultValues = (
  entity: Entity,
  operation: Mutation | Subscription,
  payload: any,
  context: Record<string, any>,
): any => {
  const ret = {
    ...payload,
  };

  const entityAttributes: any = entity.getAttributes();
  const systemAttributes = _.filter(
    entityAttributes,
    (attribute) => attribute.isSystemAttribute && attribute.defaultValue,
  );

  systemAttributes.map((attribute) => {
    const attributeName = attribute.name;
    const defaultValue = attribute.defaultValue;

    const value = defaultValue(ret, operation, entity, context);
    if (typeof value !== 'undefined') {
      ret[attributeName] = value;
    }
  });

  return ret;
};

export const fillDefaultValues = async (
  entity: Entity,
  entityMutation: Mutation,
  payload: any,
  context: Record<string, any>,
): Promise<any> => {
  const ret = {
    ...payload,
  };

  const entityAttributes = entity.getAttributes();
  const payloadAttributes = Object.keys(payload);
  const requiredAttributes = _.filter(
    entityAttributes,
    (attribute) => attribute.required && !attribute.isSystemAttribute,
  );

  await Promise.all(
    requiredAttributes.map(async (attribute) => {
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
  entity: Entity,
  entityMutation: Mutation,
  payload: any,
  model: string,
  context: Record<string, any>,
): any => {
  const ret = {
    ...payload,
  };

  const entityAttributes = entity.getAttributes();

  _.forEach(entityAttributes, (attribute) => {
    const attributeName = attribute.name;
    const gqlFieldNameI18n = attribute.gqlFieldNameI18n;

    if (attribute.serialize) {
      if (attribute.i18n && typeof ret[gqlFieldNameI18n] !== 'undefined') {
        Object.keys(ret[gqlFieldNameI18n]).map((language) => {
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
      } else if (typeof ret[attributeName] !== 'undefined') {
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
