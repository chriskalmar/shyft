import _ from 'lodash';

import { isObjectDataType } from './datatype/ObjectDataType';

import { isListDataType } from './datatype/ListDataType';

import { isComplexDataType } from './datatype/ComplexDataType';

import { isMap, passOrThrow, isDefined } from './util';

import { MUTATION_TYPE_CREATE } from './mutation/Mutation';

const validateDataTypePayload = (paramType, payload, context) => {
  const dataTypeValidator = paramType.validate;

  if (dataTypeValidator) {
    dataTypeValidator(payload, context);
  }
};

const validatePayload = (param, payload, source, context, path = []) => {
  if (typeof payload !== 'undefined' && payload !== null) {
    const paramName = param.name;

    const paramType = isListDataType(param.type)
      ? param.type.getItemType()
      : param.type;

    validateDataTypePayload(param.type, payload[paramName], context);

    if (isObjectDataType(paramType)) {
      const attributes = paramType.getAttributes();
      _.forEach(attributes, attribute => {
        const newPath = [ ...path, attribute.name ];
        validatePayload(
          attribute,
          payload[paramName],
          source,
          context,
          newPath,
        );
      });
    }

    if (isListDataType(param.type)) {
      const payloadList = payload[paramName];

      if (typeof payloadList !== 'undefined') {
        payloadList.map(itemPayload => {
          if (isObjectDataType(paramType)) {
            validateDataTypePayload(paramType, itemPayload, context);

            const attributes = paramType.getAttributes();
            const pathString = path.length ? path.join('.') + '.' : '';

            _.forEach(attributes, attribute => {
              passOrThrow(
                !attribute.required || isDefined(itemPayload[attribute.name]),
                () =>
                  `Missing required input attribute '${pathString}${
                    attribute.name
                  }'`,
              );
              const newPath = [ ...path, attribute.name ];
              validatePayload(attribute, itemPayload, source, context, newPath);
            });
          }
        });
      }
    }

    if (!isComplexDataType(paramType)) {
      const attributeName = param.name;
      const attributeValidator = param.validate;

      validateDataTypePayload(paramType, payload[attributeName], context);

      if (attributeValidator) {
        if (
          param.isSystemAttribute ||
          typeof payload[attributeName] !== 'undefined'
        ) {
          const result = attributeValidator(
            payload[attributeName],
            attributeName,
            payload,
            source,
            context,
          );
          if (result instanceof Error) {
            throw result;
          }
        }
      }
    }
  }
};

export const validateActionPayload = (param, payload, action, context) => {
  const newParam = {
    ...param,
    name: 'input',
  };

  const newPayload = {
    input: {
      ...payload,
    },
  };

  if (!isMap(payload)) {
    newPayload.input = payload;
  }

  validatePayload(newParam, newPayload, { action }, context);
};

export const validateMutationPayload = (entity, mutation, payload, context) => {
  const attributes = entity.getAttributes();
  const systemAttributes = _.filter(
    attributes,
    attribute => attribute.isSystemAttribute && attribute.defaultValue,
  ).map(attribute => attribute.name);

  systemAttributes.map(attributeName => {
    const attribute = attributes[attributeName];
    validatePayload(attribute, payload, { mutation, entity }, context);
  });

  const attributesToValidate = mutation.attributes || [];

  attributesToValidate.map(attributeName => {
    const attribute = attributes[attributeName];

    if (mutation.type === MUTATION_TYPE_CREATE && !attribute.i18n) {
      passOrThrow(
        !attribute.required || isDefined(payload[attributeName]),
        () => `Missing required input attribute '${attributeName}'`,
      );
    }

    validatePayload(attribute, payload, { mutation, entity }, context, [
      attributeName,
    ]);
  });
};