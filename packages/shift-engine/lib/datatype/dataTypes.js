
import DataType, {
  DataTypeUser,
} from './DataType';

import casual from 'casual';
import _ from 'lodash';


export const DataTypeUserID = new DataTypeUser({
  name: 'DataTypeUserID',
  description: 'Data type representing a reference to a user',
  mock: () => casual.integer(2^20, 2^51).toString(),
})



export const DataTypeID = new DataType({
  name: 'DataTypeID',
  description: 'Data type representing unique IDs',
  mock: () => casual.integer(2^20, 2^51).toString(),
})


export const DataTypeInteger = new DataType({
  name: 'DataTypeInteger',
  description: 'Data type representing integer values',
  mock: () => casual.integer(-2^10, 2^10),
})


export const DataTypeBigInt = new DataType({
  name: 'DataTypeBigInt',
  description: 'Data type representing big integer values',
  mock: () => casual.integer(2^20, 2^51).toString(),
})


export const DataTypeFloat = new DataType({
  name: 'DataTypeFloat',
  description: 'Data type representing float values',
  mock: () => casual.double(-2^10, 2^10),
})


export const DataTypeBoolean = new DataType({
  name: 'DataTypeBoolean',
  description: 'Data type representing boolean values',
  mock: () => casual.boolean,
})


export const DataTypeString = new DataType({
  name: 'DataTypeString',
  description: 'Data type representing text values',
  mock: () => casual.title,
})


export const DataTypeJson = new DataType({
  name: 'DataTypeJson',
  description: 'Data type representing json objects',
  mock: randomJson,
})


export const DataTypeTimestamp = new DataType({
  name: 'DataTypeTimestamp',
  description: 'Data type representing a timestamp',
  mock: () => new Date(casual.unix_time * 1000),
})


export const DataTypeTimestampTz = new DataType({
  name: 'DataTypeTimestampTz',
  description: 'Data type representing a timestamp with time zone information',
  mock: () => new Date(casual.unix_time * 1000),
})



function randomJson() {
  const ret = {}
  const count = casual.integer(1, 5)

  _.times(count, () => {
    const key = _.camelCase( casual.words(2) )
    const value = Math.random() > 0.5
      ? casual.title
      : casual.integer

    ret[ key ] = value
  })

  return ret
}
