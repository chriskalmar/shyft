import * as _ from 'lodash';
import { Entity, Subscription } from '..';
import { getRegisteredEntityAttribute } from '../graphqlProtocol/registry';
import { Attribute } from './attribute/Attribute';
import { Context } from './context/Context';
import { Mutation } from './mutation/Mutation';

export const fillSystemAttributesDefaultValues = (
  entity: Entity,
  operation: Mutation | Subscription,
  payload: Record<string, unknown>,
  context: Context,
): Record<string, unknown> => {
  const ret = {
    ...payload,
  };

  const entityAttributes: any = entity.getAttributes();
  const systemAttributes = _.filter(
    entityAttributes,
    (attribute) => attribute.isSystemAttribute && attribute.defaultValue,
  );

  systemAttributes.map((attribute: Attribute) => {
    const attributeName = attribute.name;
    const defaultValue = attribute.defaultValue;

    const value = defaultValue({ payload, operation, entity, context });
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
  // TODO: isSystemAttribute does not exist? do we create it?
  const requiredAttributes = _.filter(
    entityAttributes,
    // eslint-disable-next-line dot-notation
    (attribute) => attribute.required && !attribute['isSystemAttribute'],
  );

  await Promise.all(
    requiredAttributes.map(async (attribute) => {
      // TODO: name does not exist on Attribute base
      // eslint-disable-next-line dot-notation
      const attributeName = attribute['name'];
      if (!payloadAttributes.includes(attributeName)) {
        if (attribute.defaultValue) {
          ret[attributeName] = await attribute.defaultValue({
            payload,
            operation: entityMutation,
            entity,
            context,
          });
        }
      }
    }),
  );

  return ret;
};

export const serializeValues = (
  entity: Entity,
  entityMutation: Mutation,
  payload: Record<string, unknown>,
  model: string,
  context: Record<string, any>,
): any => {
  const ret = {
    ...payload,
  };

  const entityAttributes = entity.getAttributes();

  _.forEach(entityAttributes, (attribute) => {
    // TODO: name does not exist on AttributeBase
    // eslint-disable-next-line dot-notation
    const attributeName = attribute['name'];
    const { fieldNameI18n: gqlFieldNameI18n } = getRegisteredEntityAttribute(
      entity.name,
      // TODO: name does not exist on AttributeBase
      // eslint-disable-next-line dot-notation
      attribute['name'],
    );

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
