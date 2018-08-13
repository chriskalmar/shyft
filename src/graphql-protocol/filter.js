import { GraphQLList, GraphQLNonNull, GraphQLInputObjectType } from 'graphql';

import _ from 'lodash';

import ProtocolGraphQL from './ProtocolGraphQL';

import {
  isEntity,
  constants,
  isComplexDataType,
  isArray,
  isMap,
} from 'shift-engine';

const {
  storageDataTypeCapabilities,
  storageDataTypeCapabilityType,
} = constants;

const AND_OPERATOR = 'AND';
const OR_OPERATOR = 'OR';
const logicalKeysMap = {
  [AND_OPERATOR]: '$and',
  [OR_OPERATOR]: '$or',
};

const DEEP_FILTER_OPERATOR = 'filter';

export const generateFilterInput = (entity, graphRegistry) => {
  const protocolConfiguration = ProtocolGraphQL.getProtocolConfiguration();
  const typeNamePluralListName = entity.graphql.typeNamePluralPascalCase;

  const storageType = entity.storageType;

  const filterInputTypeName = protocolConfiguration.generateFilterInputTypeName(
    entity,
  );
  const entityFilterType = new GraphQLInputObjectType({
    name: filterInputTypeName,
    description: `Filter **\`${typeNamePluralListName}\`** by various criteria`,

    fields: () => {
      const fields = {
        [AND_OPERATOR]: {
          description: `Combine **\`${filterInputTypeName}\`** by a logical **AND**`,
          type: new GraphQLList(new GraphQLNonNull(entityFilterType)),
        },
        [OR_OPERATOR]: {
          description: `Combine **\`${filterInputTypeName}\`** by a logical **OR**`,
          type: new GraphQLList(new GraphQLNonNull(entityFilterType)),
        },
      };

      _.forEach(entity.getAttributes(), attribute => {
        let attributeType = attribute.type;

        if (isComplexDataType(attributeType) || attribute.mutationInput) {
          return;
        }

        // it's a reference
        if (isEntity(attributeType)) {
          const targetEntity = attributeType;
          const targetTypeName = targetEntity.graphql.typeName;
          const targetRegistryType = graphRegistry.types[targetTypeName];
          const targetConnectionArgs = targetRegistryType.connectionArgs;

          const fieldName = `${
            attribute.gqlFieldName
          }__${DEEP_FILTER_OPERATOR}`;
          fields[fieldName] = targetConnectionArgs.filter;

          const primaryAttribute = targetEntity.getPrimaryAttribute();
          attributeType = primaryAttribute.type;
        }

        const fieldType = ProtocolGraphQL.convertToProtocolDataType(
          attributeType,
          entity.name,
          true,
        );

        const storageDataType = storageType.convertToStorageDataType(
          attributeType,
        );

        fields[attribute.gqlFieldName] = {
          type: fieldType,
        };

        storageDataType.capabilities.map(capability => {
          const fieldName = `${attribute.gqlFieldName}__${capability}`;
          const field = {};

          if (
            storageDataTypeCapabilities[capability] ===
            storageDataTypeCapabilityType.VALUE
          ) {
            field.type = fieldType;
          }
          else if (
            storageDataTypeCapabilities[capability] ===
            storageDataTypeCapabilityType.LIST
          ) {
            field.type = new GraphQLList(new GraphQLNonNull(fieldType));
          }

          fields[fieldName] = field;
        });
      });

      return fields;
    },
  });

  return {
    type: entityFilterType,
    description: 'Filter list by various criteria',
  };
};

export const splitAttributeAndFilterOperator = str => {
  let ret;

  if (typeof str === 'string') {
    const splitPos = str.lastIndexOf('__');

    if (splitPos > 0) {
      const operator = str.substr(splitPos + 2);
      const attributeName = str.substring(0, splitPos);

      if (operator.length > 0 && attributeName.length > 0) {
        ret = {
          operator,
          attributeName,
        };
      }
    }
    else {
      ret = {
        attributeName: str,
      };
    }
  }

  if (!ret) {
    throw new Error(`invalid filter '${str}'`);
  }

  return ret;
};

const deepFilterResolver = async (entity, filter, context, path) => {
  const storageType = entity.storageType;

  // eslint-disable-next-line no-use-before-define
  const transformedFilter = await transformFilterLevel(
    filter,
    entity.getAttributes(),
    context,
    path,
  ); // eslint-disable-line no-use-before-define
  const { data } = await storageType.find(
    entity,
    { all: true, filter: transformedFilter },
    context,
  );
  const ids = data.map(({ id }) => id);

  if (ids.length < 1) {
    return null;
  }

  return ids;
};

export const transformFilterLevel = async (
  filters = {},
  attributes,
  context,
  path,
) => {
  const ret = {};
  const hasFilter = {};

  if (path && !isArray(path, true)) {
    throw new Error(
      'optional path in transformFilterLevel() needs to be an array',
    );
  }

  const errorLocation = path ? ` at '${path.join('.')}'` : '';

  if (!isMap(filters)) {
    throw new Error(
      `filter${errorLocation} needs to be an object of filter criteria`,
    );
  }

  if (!isMap(attributes, true)) {
    throw new Error('transformFilterLevel() expects an attribute map');
  }

  const filterKeys = Object.keys(filters);
  await Promise.all(
    filterKeys.map(async filter => {
      const value = filters[filter];
      if (filter === AND_OPERATOR || filter === OR_OPERATOR) {
        const logicalKey = logicalKeysMap[filter];
        const newPath = path ? path.slice() : [];

        ret[logicalKey] = await Promise.all(
          value.map(async (newFilter, idx) => {
            const idxPath = newPath.slice();
            idxPath.push(`${filter}[${idx}]`);
            return await transformFilterLevel(
              newFilter,
              attributes,
              context,
              idxPath,
            );
          }),
        );

        return;
      }

      const { operator, attributeName } = splitAttributeAndFilterOperator(
        filter,
      );

      let attribute;
      const attributesNames = Object.keys(attributes);

      attributesNames.find(name => {
        const { gqlFieldName } = attributes[name];

        if (attributeName === gqlFieldName) {
          attribute = attributes[name];
        }
      });

      if (!attribute) {
        throw new Error(
          `Unknown attribute name '${attributeName}' used in filter${errorLocation}`,
        );
      }

      hasFilter[attributeName] = hasFilter[attributeName] || {};

      if (operator) {
        if (operator === DEEP_FILTER_OPERATOR) {
          hasFilter[attributeName].hasDeepFilter = true;
        }
        else {
          hasFilter[attributeName].hasComplexFilter = true;
        }
      }
      else {
        hasFilter[attributeName].hasExactMatchFilter = true;
      }

      const realAttributeName = attribute.name;

      if (
        hasFilter[attributeName].hasDeepFilter &&
        (hasFilter[attributeName].hasComplexFilter ||
          hasFilter[attributeName].hasExactMatchFilter)
      ) {
        throw new Error(
          `Cannot combine 'filter' operator with other operators on attribute '${attributeName}' used in filter${errorLocation}`,
        );
      }

      if (
        hasFilter[attributeName].hasExactMatchFilter &&
        (hasFilter[attributeName].hasComplexFilter ||
          hasFilter[attributeName].hasDeepFilter)
      ) {
        throw new Error(
          `Cannot combine 'exact match' operator with other operators on attribute '${attributeName}' used in filter${errorLocation}`,
        );
      }

      if (operator) {
        ret[realAttributeName] = ret[realAttributeName] || {};

        if (operator === DEEP_FILTER_OPERATOR) {
          const newPath = path ? path.slice() : [];

          newPath.push(filter);

          const targetEntity = attributes[attributeName].type;
          const resolvedList = await deepFilterResolver(
            targetEntity,
            value,
            context,
            newPath,
          );
          if (resolvedList) {
            ret[realAttributeName].$in = resolvedList;
          }
          else {
            ret[realAttributeName].$noResult = true;
          }
        }
        else {
          const operatorKey = `\$${operator}`;
          ret[realAttributeName][operatorKey] = value;
        }
      }
      else {
        ret[realAttributeName] = value;
      }
    }),
  );

  return ret;
};