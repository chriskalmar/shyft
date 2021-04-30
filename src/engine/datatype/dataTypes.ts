import { DataType } from './DataType';
import { DataTypeUser } from './DataTypeUser';
import { randomJson } from '../util';
import * as casual from 'casual';

export const DataTypeUserID = new DataTypeUser({
  name: 'DataTypeUserID',
  description: 'Data type representing a reference to a user',
  /* istanbul ignore next */
  mock: () => casual.integer(2 ^ 20, 2 ^ 51).toString(),
});

export const DataTypeID = new DataType({
  name: 'DataTypeID',
  description: 'Data type representing unique IDs',
  /* istanbul ignore next */
  mock: () => casual.integer(2 ^ 20, 2 ^ 51).toString(),
});

export const DataTypeInteger = new DataType({
  name: 'DataTypeInteger',
  description: 'Data type representing integer values',
  /* istanbul ignore next */
  mock: () => casual.integer(-2 ^ 10, 2 ^ 10),
});

export const DataTypeBigInt = new DataType({
  name: 'DataTypeBigInt',
  description: 'Data type representing big integer values',
  /* istanbul ignore next */
  mock: () => casual.integer(2 ^ 20, 2 ^ 51).toString(),
});

export const DataTypeFloat = new DataType({
  name: 'DataTypeFloat',
  description: 'Data type representing float values',
  /* istanbul ignore next */
  mock: () => casual.double(-2 ^ 10, 2 ^ 10),
});

export const DataTypeDouble = new DataType({
  name: 'DataTypeDouble',
  description: 'Data type representing double precision values',
  /* istanbul ignore next */
  mock: () => casual.double(-2 ^ 10, 2 ^ 10),
});

export const DataTypeBoolean = new DataType({
  name: 'DataTypeBoolean',
  description: 'Data type representing boolean values',
  /* istanbul ignore next */
  mock: () => casual.boolean,
  enforceRequired: true,
  defaultValue() {
    return false;
  },
});

export const DataTypeString = new DataType({
  name: 'DataTypeString',
  description: 'Data type representing text values',
  /* istanbul ignore next */
  mock: () => casual.title,
});

export const DataTypeJson = new DataType({
  name: 'DataTypeJson',
  description: 'Data type representing json objects',
  /* istanbul ignore next */
  mock: randomJson,
});

export const DataTypeTimestamp = new DataType({
  name: 'DataTypeTimestamp',
  description: 'Data type representing a timestamp',
  /* istanbul ignore next */
  mock: () => new Date(casual.unix_time * 1000),
});

export const DataTypeTimestampTz = new DataType({
  name: 'DataTypeTimestampTz',
  description: 'Data type representing a timestamp with time zone information',
  /* istanbul ignore next */
  mock: () => new Date(casual.unix_time * 1000),
});

export const DataTypeDate = new DataType({
  name: 'DataTypeDate',
  description: 'Data type representing a date',
  /* istanbul ignore next */
  mock: () => new Date(casual.unix_time * 1000),
});

export const DataTypeTime = new DataType({
  name: 'DataTypeTime',
  description: 'Data type representing time',
  /* istanbul ignore next */
  mock: () => new Date(casual.unix_time * 1000),
});

export const DataTypeTimeTz = new DataType({
  name: 'DataTypeTimeTz',
  description: 'Data type representing time with time zone information',
  /* istanbul ignore next */
  mock: () => new Date(casual.unix_time * 1000),
});

export const DataTypeUUID = new DataType({
  name: 'DataTypeUUID',
  description: 'Data type representing a UUID',
  /* istanbul ignore next */
  mock: () => casual.uuid,
});

export const DataTypeI18n = new DataType({
  name: 'DataTypeI18n',
  description: 'Data type representing translation objects',
  /* istanbul ignore next */
  mock: randomJson,
});

export const DataTypeUpload = new DataType({
  name: 'DataTypeUpload',
  description: 'Data type representing a file upload',
  mock: () => null,
});
