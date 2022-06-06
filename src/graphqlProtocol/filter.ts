import {
  GraphQLList,
  GraphQLNonNull,
  GraphQLInputObjectType,
  GraphQLBoolean,
} from 'graphql';
import * as _ from 'lodash';
import { ProtocolGraphQL } from './ProtocolGraphQL';
import { ProtocolGraphQLConfiguration } from './ProtocolGraphQLConfiguration';
import { isEntity, Entity } from '../engine/entity/Entity';
import {
  storageDataTypeCapabilities,
  storageDataTypeCapabilityType,
} from '../engine/constants';
import { isComplexDataType } from '../engine/datatype/ComplexDataType';
import { isArray, isMap } from '../engine/util';
import { isViewEntity, ViewEntity } from '../engine/entity/ViewEntity';
import { isShadowEntity } from '../engine/entity/ShadowEntity';
import { DataTypeBoolean, DataTypeString } from '../engine/datatype/dataTypes';
import { getRegisteredEntity, getRegisteredEntityAttribute } from './registry';

const AND_OPERATOR = 'AND';
const OR_OPERATOR = 'OR';
const logicalKeysMap = {
  [AND_OPERATOR]: '$and',
  [OR_OPERATOR]: '$or',
};

const DEEP_FILTER_OPERATOR = 'filter';
const PRE_FILTER_OPERATOR = 'pre_filter';

export const generateFilterInput = (entity, graphRegistry) => {
  const protocolConfiguration =
    ProtocolGraphQL.getProtocolConfiguration() as ProtocolGraphQLConfiguration;

  const { typeNamePluralPascalCase: typeNamePluralListName } =
    getRegisteredEntity(entity.name);

  const storageType = entity.storageType;

  const filterInputTypeName =
    protocolConfiguration.generateFilterInputTypeName(entity);

  const preFilters = entity.getPreFilters();

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

      _.forEach(entity.getAttributes(), (attribute) => {
        let attributeType = attribute.type;
        const isPrimary = attribute.primary;

        if (attribute.hidden) {
          return;
        }

        if (attribute.mutationInput) {
          return;
        }

        const { fieldName: gqlFieldName } = getRegisteredEntityAttribute(
          entity.name,
          attribute.name,
        );

        // it's a reference
        if (isEntity(attributeType)) {
          const targetEntity = attributeType;
          const { typeName: targetTypeName } = getRegisteredEntity(
            targetEntity.name,
          );

          const targetRegistryType = graphRegistry.types[targetTypeName];
          const targetConnectionArgs = targetRegistryType.connectionArgs;

          const fieldName = `${gqlFieldName}__${DEEP_FILTER_OPERATOR}`;
          fields[fieldName] = targetConnectionArgs.filter;

          const primaryAttribute = targetEntity.getPrimaryAttribute();
          attributeType = primaryAttribute.type;
        } else if (isShadowEntity(attributeType)) {
          const targetEntity = attributeType;
          const primaryAttribute = targetEntity.getPrimaryAttribute();

          attributeType = primaryAttribute.type;
        }

        const fieldType = ProtocolGraphQL.convertToProtocolDataType(
          attributeType,
          entity.name,
          true,
        );

        const storageDataType =
          storageType.convertToStorageDataType(attributeType);

        if (!isComplexDataType(attributeType)) {
          fields[gqlFieldName] = {
            type: fieldType,
          };
        }

        storageDataType.capabilities.map((capability) => {
          const fieldName = `${gqlFieldName}__${capability}`;
          const field = {} as any;

          if (
            storageDataTypeCapabilities[capability] ===
            storageDataTypeCapabilityType.STRING
          ) {
            // object types and list types can only accept a string as filter
            field.type = ProtocolGraphQL.convertToProtocolDataType(
              DataTypeString,
              entity.name,
              true,
            );
          } else if (
            storageDataTypeCapabilities[capability] ===
            storageDataTypeCapabilityType.VALUE
          ) {
            field.type = fieldType;
          } else if (
            storageDataTypeCapabilities[capability] ===
            storageDataTypeCapabilityType.LIST
          ) {
            field.type = new GraphQLList(new GraphQLNonNull(fieldType));
          } else if (
            storageDataTypeCapabilities[capability] ===
            storageDataTypeCapabilityType.BOOLEAN
          ) {
            field.type = ProtocolGraphQL.convertToProtocolDataType(
              DataTypeBoolean,
              entity.name,
              true,
            );
          }

          fields[fieldName] = field;
        });

        if (isPrimary && preFilters) {
          const preFilterInputTypeName =
            protocolConfiguration.generateFilterPreFilterInputTypeName(entity);

          const fieldName = `${gqlFieldName}__${PRE_FILTER_OPERATOR}`;
          const preFilterFieldType = new GraphQLInputObjectType({
            name: preFilterInputTypeName,
            description: `Filter **\`${typeNamePluralListName}\`** by a custom pre-filter`,

            fields: () => {
              const preFilterFields = {};

              Object.keys(preFilters).map((preFilterName) => {
                const preFilter = preFilters[preFilterName];
                // TODO:
                // const preFilterParamsInputTypeName = protocolConfiguration.generateFilterPreFilterParamsInputTypeName(
                //   entity,
                //   preFilterName,
                // );

                if (preFilter.attributes) {
                  // TODO
                } else {
                  preFilterFields[preFilterName] = {
                    type: GraphQLBoolean,
                  };
                }
              });

              return preFilterFields;
            },
          });

          fields[fieldName] = {
            type: preFilterFieldType,
            description: `Filter **\`${typeNamePluralListName}\`** by a custom pre-filter`,
          };
        }
      });

      return fields;
    },
  });

  return {
    type: entityFilterType,
    description: 'Filter list by various criteria',
  };
};

export const splitAttributeAndFilterOperator = (str) => {
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
    } else {
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

  // eslint-disable-next-line no-use-before-define,@typescript-eslint/no-use-before-define
  const transformedFilter = await transformFilterLevel(
    entity,
    filter,
    entity.getAttributes(),
    context,
    path,
  );

  const { data } = await storageType.find(
    entity,
    {
      all: true,
      skipPermissions: true,
      filter: transformedFilter,
    },
    context,
  );
  const ids = data.map(({ id }) => id);

  if (ids.length < 1) {
    return null;
  }

  return ids;
};

export const transformFilterLevel = async (
  entity: Entity | ViewEntity,
  filters = {},
  attributes: any,
  context?: any,
  path?: string[],
) => {
  const ret = {};
  const hasFilter = {};

  if (path && !isArray(path, true)) {
    throw new Error(
      'optional path in transformFilterLevel() needs to be an array',
    );
  }

  const errorLocation = path ? ` at '${path.join('.')}'` : '';

  if (!isEntity(entity) && !isViewEntity(entity)) {
    throw new Error('transformFilterLevel() expects an entity or view entity');
  }

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
    filterKeys.map(async (filter) => {
      const value = filters[filter];
      if (filter === AND_OPERATOR || filter === OR_OPERATOR) {
        const logicalKey = logicalKeysMap[filter];
        const newPath = path ? path.slice() : [];

        ret[logicalKey] = await Promise.all(
          value.map(async (newFilter, idx) => {
            const idxPath = newPath.slice();
            idxPath.push(`${filter}[${idx}]`);
            return await transformFilterLevel(
              entity,
              newFilter,
              attributes,
              context,
              idxPath,
            );
          }),
        );

        return;
      }

      const { operator, attributeName } =
        splitAttributeAndFilterOperator(filter);

      let attribute;
      const attributesNames = Object.keys(attributes);

      attributesNames.map((name) => {
        const { fieldName: gqlFieldName } = getRegisteredEntityAttribute(
          entity.name,
          attributes[name].name,
        );

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
        } else {
          hasFilter[attributeName].hasComplexFilter = true;
        }
      } else {
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
          } else {
            ret[realAttributeName].$noResult = true;
          }
        } else if (operator === PRE_FILTER_OPERATOR) {
          const preFilters = entity.getPreFilters();
          const usedPreFilters = Object.keys(value).filter((preFilterName) => {
            const preFilterValue = value[preFilterName];
            return isMap(preFilterValue) || preFilterValue === true;
          });

          if (usedPreFilters.length > 1) {
            throw new Error('Multiple preFilters cannot be combined');
          } else if (usedPreFilters.length === 1) {
            const [usedPreFilter] = usedPreFilters;

            const preFilter = preFilters[usedPreFilter];

            if (!preFilter) {
              throw new Error(`No preFilter named '${usedPreFilter}' found`);
            }

            const preFilterFn = preFilter.resolve;
            const preFilterAttributes = value[preFilter];

            const resolvedList = await preFilterFn(
              context,
              preFilterAttributes,
            );

            if (resolvedList) {
              ret[realAttributeName].$in = resolvedList;
            } else {
              ret[realAttributeName].$noResult = true;
            }
          }
        } else {
          const operatorKey = `$${operator}`;
          ret[realAttributeName][operatorKey] = value;
        }
      } else {
        ret[realAttributeName] = value;
      }
    }),
  );

  return ret;
};
