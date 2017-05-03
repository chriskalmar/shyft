
import DataType from './DataType';


export const passOrThrow = (condition, message) => {
  if (!condition) {
    throw new Error(message)
  }
}


export const isDataType = (obj) => {
  return (obj instanceof DataType)
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


export const throwError = (message) => {
  throw new Error(message)
}
