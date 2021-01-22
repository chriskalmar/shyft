import crypto from 'crypto';

// postgres limitation
export const SYSTEM_NAME_MAX_LENGTH = 63;

export const generateIndexName = (entityName, attributes, suffix = '_idx') => {
  let ret = `${entityName}_${suffix}_`;
  const attributesChain = (attributes || []).join('_');
  const attributesSortedChain = (attributes || []).sort().join('__');

  const hashLength = 10;
  const hash = crypto
    .createHash('sha256')
    .update(attributesSortedChain)
    .digest('hex')
    .substr(0, hashLength);

  const shortendAttributesChain = attributesChain.substr(
    0,
    SYSTEM_NAME_MAX_LENGTH - hashLength - ret.length - 1,
  );

  ret = `${entityName}_${shortendAttributesChain}_${hash}_${suffix}`;

  return ret;
};

export const invertDirection = (direction) => {
  return direction === 'DESC' ? 'ASC' : 'DESC';
};

export const getLimit = (first, last) => {
  if (first >= 0) {
    return first;
  } else if (last >= 0) {
    return last;
  }

  return 10;
};

export const asyncForEach = async (array, callback) => {
  for (let index = 0; index < array.length; index++) {
    await callback(array[index], index, array);
  }
};

export const quote = (item) => {
  if (!item) {
    throw new Error('quote() requires an input');
  }

  if (item.includes('.')) {
    const arr = item.split('.');
    arr[1] = quote(arr[1]);
    return arr.join('.');
  }

  // special care for json pointers
  if (item.includes('->')) {
    const arr = item.split('->');
    arr[0] = quote(arr[0]);
    return arr.join('->');
  }

  return `"${item}"`;
};
