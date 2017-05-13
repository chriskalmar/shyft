
import DataType, {
  DataTypeUser,
} from './DataType';



export const DataTypeUserID = new DataTypeUser({
  name: 'DataTypeUserID',
  description: 'Data type representing a reference to a user'
})



export const DataTypeID = new DataType({
  name: 'DataTypeID',
  description: 'Data type representing unique IDs'
})


export const DataTypeInteger = new DataType({
  name: 'DataTypeInteger',
  description: 'Data type representing integer values'
})


export const DataTypeBigInt = new DataType({
  name: 'DataTypeBigInt',
  description: 'Data type representing big integer values'
})


export const DataTypeFloat = new DataType({
  name: 'DataTypeFloat',
  description: 'Data type representing float values'
})


export const DataTypeBoolean = new DataType({
  name: 'DataTypeBoolean',
  description: 'Data type representing boolean values'
})


export const DataTypeString = new DataType({
  name: 'DataTypeString',
  description: 'Data type representing text values'
})


export const DataTypeJson = new DataType({
  name: 'DataTypeJson',
  description: 'Data type representing json objects'
})


export const DataTypeTimestamp = new DataType({
  name: 'DataTypeTimestamp',
  description: 'Data type representing a timestamp'
})


export const DataTypeTimestampTz = new DataType({
  name: 'DataTypeTimestampTz',
  description: 'Data type representing a timestamp with time zone information'
})
