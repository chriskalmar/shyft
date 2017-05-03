
import DataType from './datatype/DataType';
import Entity from './entity/Entity';


export const passOrThrow = (condition, messageFn) => {
  // providing the error message as a callback return massively improves code coverage reports.
  // the message function is only evaluated if the condition fails, which will show up correctly
  // in the coverage reports.
  if (typeof messageFn !== 'function') {
    throw new Error('passOrThrow() expects messageFn to be a function')
  }
  if (!condition) {
    throw new Error(messageFn())
  }
}


export const isDataType = (obj) => {
  return (obj instanceof DataType)
}


export const isEntity = (obj) => {
  return (obj instanceof Entity)
}


export const resolveFunctionMap = (functionOrMap) => {
  return typeof functionOrMap === 'function'
    ? functionOrMap()
    : functionOrMap
}


export const isMap = (map, nonEmpty) => {
  return map !== null &&
    typeof map === 'object' &&
    Array.isArray(map) === false &&
    (!nonEmpty || (nonEmpty && Object.keys(map).length > 0 ))
}


export const isFunction = (fn) => {
  return typeof fn === 'function'
}



export const isArray = (set, nonEmpty) => {
  return set !== null &&
    typeof map === 'array' &&
    Array.isArray(set) === true &&
    (!nonEmpty || (nonEmpty && set.length > 0 ))
}

