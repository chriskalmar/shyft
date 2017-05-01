
import DataType from './DataType';


export const passOrThrow = (condition, message) => {
  if (!condition) {
    throw new Error(message)
  }
}


export const isDataType = (obj) => {
  return (obj instanceof DataType)
}
