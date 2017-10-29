
import DataType from './DataType';
import DataTypeUser from './DataTypeUser';

import casual from 'casual';
import _ from 'lodash';


export const DataTypeUserID = new DataTypeUser({
  name: 'DataTypeUserID',
  description: 'Data type representing a reference to a user',
  mock: /* istanbul ignore next */
    () => casual.integer(2^20, 2^51).toString(),
})



export const DataTypeID = new DataType({
  name: 'DataTypeID',
  description: 'Data type representing unique IDs',
  mock: /* istanbul ignore next */
    () => casual.integer(2^20, 2^51).toString(),
})


export const DataTypeInteger = new DataType({
  name: 'DataTypeInteger',
  description: 'Data type representing integer values',
  mock: /* istanbul ignore next */
    () => casual.integer(-2^10, 2^10),
})


export const DataTypeBigInt = new DataType({
  name: 'DataTypeBigInt',
  description: 'Data type representing big integer values',
  mock: /* istanbul ignore next */
    () => casual.integer(2^20, 2^51).toString(),
})


export const DataTypeFloat = new DataType({
  name: 'DataTypeFloat',
  description: 'Data type representing float values',
  mock: /* istanbul ignore next */
    () => casual.double(-2^10, 2^10),
})


export const DataTypeBoolean = new DataType({
  name: 'DataTypeBoolean',
  description: 'Data type representing boolean values',
  mock: /* istanbul ignore next */
    () => casual.boolean,
})


export const DataTypeString = new DataType({
  name: 'DataTypeString',
  description: 'Data type representing text values',
  mock: /* istanbul ignore next */
    () => casual.title,
})


export const DataTypeJson = new DataType({
  name: 'DataTypeJson',
  description: 'Data type representing json objects',
  mock: /* istanbul ignore next */
    randomJson,
})


export const DataTypeTimestamp = new DataType({
  name: 'DataTypeTimestamp',
  description: 'Data type representing a timestamp',
  mock: /* istanbul ignore next */
    () => new Date(casual.unix_time * 1000),
})


export const DataTypeTimestampTz = new DataType({
  name: 'DataTypeTimestampTz',
  description: 'Data type representing a timestamp with time zone information',
  mock: /* istanbul ignore next */
    () => new Date(casual.unix_time * 1000),
})

export const DataTypeDate = new DataType({
  name: 'DataTypeDate',
  description: 'Data type representing a date',
  mock: /* istanbul ignore next */
    () => new Date(casual.unix_time * 1000),
})


/* istanbul ignore next */
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
