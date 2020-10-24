import * as casual from 'casual';
import * as _ from 'lodash';
import { viewAttributePropertiesWhitelist } from './constants';

type StringFunction = () => string;

export const deleteUndefinedProps = (obj) =>
  Object.keys(obj).forEach((key) => obj[key] === undefined && delete obj[key]);

export const passOrThrow = (
  condition: any,
  messageFn: string | StringFunction,
): void => {
  // providing the error message as a callback return massively improves code coverage reports.
  // the message function is only evaluated if the condition fails, which will show up correctly
  // in the coverage reports.
  if (typeof messageFn !== 'function') {
    throw new Error('passOrThrow() expects messageFn to be a function');
  }
  if (!condition) {
    throw new Error(messageFn());
  }
};

export const resolveFunctionMap = (functionOrMap) => {
  return typeof functionOrMap === 'function'
    ? functionOrMap()
    : { ...functionOrMap };
};

export const isMap = (map: object, nonEmpty?: boolean): boolean => {
  return (
    map !== null &&
    typeof map === 'object' &&
    Array.isArray(map) === false &&
    (!nonEmpty || (nonEmpty && Object.keys(map).length > 0))
  );
};

export const isFunction = (fn: any): boolean => {
  return typeof fn === 'function';
};

export const isArray = (set: any[], nonEmpty?: boolean): boolean => {
  return (
    set !== null &&
    Array.isArray(set) === true &&
    (!nonEmpty || (nonEmpty && set.length > 0))
  );
};

export const isString = (str: any): boolean => typeof str === 'string';

export const mergeMaps = (first, second) => {
  if (!isMap(first) || !isMap(second)) {
    throw new Error('mergeMaps() expects 2 maps for a merge to work');
  }

  return { ...first, ...second };
};

export const mapOverProperties = (
  object: object,
  iteratee: (val: any, key: any) => any,
) => {
  passOrThrow(isMap(object), () => 'Provided object is not a map');

  passOrThrow(
    isFunction(iteratee),
    () => 'Provided iteratee is not a function',
  );

  const keys = Object.keys(object);

  keys.forEach((key) => {
    iteratee(object[key], key);
  });
};

export const sortDataByKeys = (
  keys: string[],
  data: object[],
  keyProperty = 'id',
) => {
  const map = {};
  const result = [];
  const order = {};

  if (!keys || (isArray(keys) && keys.length === 0)) {
    return [];
  }

  if (!data || (isArray(data) && data.length === 0)) {
    return keys.map(() => null);
  }

  for (let d = 0; d < data.length; d++) {
    const row = data[d];
    const id = row[keyProperty];
    const found = map[id];

    if (!found) {
      map[id] = row;
    } else if (found instanceof Array) {
      found.push(row);
    } else {
      map[id] = [found, row];
    }
  }

  for (let k = 0; k < keys.length; k++) {
    const key = keys[k];
    const found = map[key];

    if (typeof found === 'undefined') {
      result.push(null);
    } else if (found instanceof Array) {
      let idx = order[key];

      if (typeof idx === 'undefined') {
        idx = 0;
      } else {
        idx++;
      }

      order[key] = idx;

      result.push(found[idx]);
    } else {
      result.push(found);
    }
  }

  return result;
};

export const reverseString = (str) => {
  return str.split('').reverse().join('');
};

export const randomJson = () => {
  const ret = {};
  const count = casual.integer(1, 5);

  _.times(count, () => {
    const key = _.camelCase(casual.words(2));
    const value = Math.random() > 0.5 ? casual.title : casual.integer();

    ret[key] = value;
  });

  return ret;
};

export const asyncForEach = async (
  array: any[],
  callback: (val, idx, arr) => any,
) => {
  for (let index = 0; index < array.length; index++) {
    await callback(array[index], index, array);
  }
};

export const isDefined = (val: any): boolean => typeof val !== 'undefined';

export const convertEntityToViewAttribute = (attribute) => {
  if (!_.isObject(attribute)) {
    throw new Error(
      'convertEntityToViewAttribute() expects an attribute as input',
    );
  }

  const newAttribute = {};

  viewAttributePropertiesWhitelist.map((prop) => {
    newAttribute[prop] = attribute[prop];
  });

  return newAttribute;
};

export const convertEntityToViewAttributesMap = (attributesMap) => {
  const newAttributesMap = {};

  if (!_.isObject(attributesMap)) {
    throw new Error(
      'convertEntityToViewAttributesMap() expects an attributes map as input',
    );
  }

  for (const [name, attribute] of Object.entries(attributesMap)) {
    newAttributesMap[name] = convertEntityToViewAttribute(attribute);
  }

  return newAttributesMap;
};
