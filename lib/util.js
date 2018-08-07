
import crypto from 'crypto';

// postgres limitation
const SYSTEM_NAME_MAX_LENGTH = 63


export const generateIndexName = (entityName, attributes, suffix = '_idx') => {
  let ret = `${entityName}_${suffix}_`
  const attributesChain = (attributes || []).join('_')
  const attributesSortedChain = (attributes || []).sort().join('_')

  if (ret.length + attributesChain.length > SYSTEM_NAME_MAX_LENGTH) {
    const hashLength = 10
    const hash = crypto.createHash('sha256')
      .update(attributesSortedChain)
      .digest('hex')
      .substr(0, hashLength);

    const shortendAttributesChain = attributesChain.substr(0, SYSTEM_NAME_MAX_LENGTH - hashLength - ret.length - 1)

    ret = `${entityName}_${shortendAttributesChain}_${hash}_${suffix}`
  }
  else {
    ret = `${entityName}_${attributesChain}_${suffix}`
  }

  return ret;
}



export const invertDirection = (direction) => {
  return direction === 'DESC' ? 'ASC' : 'DESC'
}


export const getLimit = (first, last) => {
  if (first >= 0) {
    return first
  }
  else if (last >= 0) {
    return last
  }

  return 10
}