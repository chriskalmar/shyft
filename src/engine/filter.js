import { isEntity } from './entity/Entity';

import {
  passOrThrow,
  isMap,
  isArray,
  mapOverProperties,
  isFunction,
} from './util';
import { isObjectDataType } from './datatype/ObjectDataType';

const logicFilters = [ '$and', '$or' ];
const deepFilter = '$filter';
const preFilter = '$pre_filter';
const noResultFilter = '$noResult';

export const validateFilterLevel = (filters, attributes, path, storageType) => {
  const ret = {};

  passOrThrow(!path || isArray(path, true), () => {
    return 'optional path in validateFilterLevel() needs to be an array';
  });

  const errorLocation = path ? ` at '${path.join('.')}'` : '';

  passOrThrow(
    isMap(filters),
    () => `filter${errorLocation} needs to be an object of filter criteria`,
  );

  passOrThrow(isMap(attributes, true), () => {
    return 'validateFilterLevel() expects an attribute map';
  });

  mapOverProperties(filters, (value, filter) => {
    if (logicFilters.includes(filter)) {
      const newPath = path ? path.slice() : [];

      newPath.push(filter);
      value.map(newFilter =>
        validateFilterLevel(newFilter, attributes, path, storageType),
      );

      return;
    }

    if (filter.indexOf(deepFilter) === 0) {
      const newPath = path ? path.slice() : [];

      newPath.push(filter);

      const attributeName = filter.replace(`${deepFilter}.`, '');
      const targetEntity = attributes[attributeName].type;

      validateFilterLevel(
        value,
        targetEntity.getAttributes(),
        path,
        storageType,
      );

      return;
    }

    const attributeName = filter;
    const attribute = attributes[attributeName];

    passOrThrow(attribute, () => {
      return `Unknown attribute name '${attributeName}' used in filter${errorLocation}`;
    });

    passOrThrow(!attribute.mutationInput, () => {
      return `Mutation input attribute '${attributeName}' not allowed in filter${errorLocation}`;
    });

    if (isMap(value)) {
      let storageDataType;

      if (isEntity(attribute.type)) {
        const primaryAttribute = attribute.type.getPrimaryAttribute();
        storageDataType = storageType.convertToStorageDataType(
          primaryAttribute.type,
        );
      }
      else {
        storageDataType = storageType.convertToStorageDataType(attribute.type);
      }

      const operators = Object.keys(value);

      operators.map(operator => {
        if (operator === noResultFilter) {
          return;
        }

        if (operator === preFilter && attribute.primary) {
          return;
        }

        const operatorCapabilityName = operator.replace('$', '');
        passOrThrow(
          storageDataType.capabilities.indexOf(operatorCapabilityName) >= 0,
          () => {
            return `Unknown or incompatible operator '${operator}' used on '${attributeName}' in filter${errorLocation}`;
          },
        );
      });
    }
  });

  return ret;
};

export const processFilter = (entity, args, storageType) => {
  const { filter } = args;

  if (!filter) {
    return {};
  }

  validateFilterLevel(filter, entity.getAttributes(), null, storageType);

  const where = {
    ...filter,
  };

  return where;
};

export const convertFilterLevel = (filterShaper, filterLevel) => {
  const converted = filterShaper(filterLevel);
  const filterLevelKeys = Object.keys(converted);
  const ret = {};

  filterLevelKeys.map(key => {
    const filter = filterLevel[key];

    if (filter) {
      if (isMap(filter)) {
        ret[key] = convertFilterLevel(filterShaper, filter);
      }
      else if (logicFilters.includes(key)) {
        ret[key] = filter.map(item => convertFilterLevel(filterShaper, item));
      }
      else {
        ret[key] = converted[key];
      }
    }
  });

  filterLevelKeys.map(key => {
    if (
      typeof converted[key] !== 'undefined' &&
      typeof ret[key] === 'undefined'
    ) {
      ret[key] = converted[key];
    }
  });

  return ret;
};

const isPreFilter = preFilterDefinition => {
  if (isMap(preFilterDefinition)) {
    if (isFunction(preFilterDefinition.resolve)) {
      if (
        !preFilterDefinition.attributes ||
        isObjectDataType(preFilterDefinition.attributes)
      ) {
        return true;
      }
    }
  }

  return false;
};

export const processPreFilters = (entity, preFilters) => {
  passOrThrow(
    isMap(preFilters),
    () =>
      `Entity '${
        entity.name
      }' preFilters definition needs to be a map with individual preFilters`,
  );

  Object.keys(preFilters).map(preFilterName => {
    const preFilterDefinition = preFilters[preFilterName];

    passOrThrow(
      isPreFilter(preFilterDefinition),
      () =>
        `Invalid preFilter definition '${preFilterName}' for entity '${
          entity.name
        }'`,
    );
  });

  return preFilters;
};
