import StorageTypePostgres from './StorageTypePostgres';
import { isEntity, isShadowEntity } from '..';
import _ from 'lodash';

export const parseValues = (entity, data, model, context) => {
  if (!data) {
    return data;
  }

  const entityAttributes = entity.getAttributes();

  _.forEach(entityAttributes, (attribute) => {
    const attributeName = attribute.name;
    const value = data[attributeName];

    if (typeof value === 'undefined' || attribute.mutationInput) {
      return;
    }

    let attributeType;

    if (isEntity(attribute.type) || isShadowEntity(attribute.type)) {
      const primaryAttribute = attribute.type.getPrimaryAttribute();
      attributeType = primaryAttribute.type;
    } else {
      attributeType = attribute.type;
    }

    const storageDataType = StorageTypePostgres.convertToStorageDataType(
      attributeType,
    );

    if (storageDataType.parse) {
      data[attributeName] = storageDataType.parse(
        value,
        data,
        entity,
        model,
        context,
      );
    }
  });

  return data;
};

export const parseValuesMap = (entity, rows, model, context) => {
  return rows.map((row) => parseValues(entity, row, model, context));
};

export const serializeValues = (entity, mutation, data, model, context) => {
  const entityAttributes = entity.getAttributes();
  const mutationAttributes = mutation.attributes || [];

  _.forEach(entityAttributes, (attribute) => {
    if (attribute.mutationInput) {
      return;
    }

    const attributeName = attribute.name;
    const value = data[attributeName];

    let attributeType;

    if (isEntity(attribute.type) || isShadowEntity(attribute.type)) {
      const primaryAttribute = attribute.type.getPrimaryAttribute();
      attributeType = primaryAttribute.type;
    } else {
      attributeType = attribute.type;
    }

    const storageDataType = StorageTypePostgres.convertToStorageDataType(
      attributeType,
    );

    if (
      !mutationAttributes.includes(attributeName) &&
      !storageDataType.enforceSerialize
    ) {
      return;
    }

    if (storageDataType.serialize) {
      data[attributeName] = storageDataType.serialize(
        value,
        data,
        entity,
        mutation,
        model,
        context,
      );
    }
  });

  return data;
};

export const runTestPlaceholderQuery = async (cmd, vars) => {
  const storageInstance = StorageTypePostgres.getStorageInstance();
  const manager = storageInstance.manager;

  const [query, parameters] = storageInstance.driver.escapeQueryWithParameters(
    cmd,
    vars,
    {},
  );

  return manager.query(query, parameters);
};
