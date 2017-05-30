
import { StorageDataType } from 'shift-engine';


export const StorageDataTypeInteger = new StorageDataType({
  name: 'StorageDataTypeInteger',
  description: 'Data type representing a 32-bit integer value',
  nativeDataType: 'integer',
  isSortable: true,
  serialize: parseInt,
})


export const StorageDataTypeBigInt = new StorageDataType({
  name: 'StorageDataTypeBigInt',
  description: 'Data type representing a 64-bit integer value',
  nativeDataType: 'bigint',
  isSortable: true,
  serialize: toString,
})


export const StorageDataTypeNumeric = new StorageDataType({
  name: 'StorageDataTypeNumeric',
  description: 'Data type representing a floating-point value',
  nativeDataType: 'numeric',
  isSortable: true,
  serialize: parseFloat,
})


export const StorageDataTypeBoolean = new StorageDataType({
  name: 'StorageDataTypeBoolean',
  description: 'Data type representing a boolean value',
  nativeDataType: 'boolean',
  isSortable: true,
  serialize: (value) => !!value ? 'TRUE' : 'FALSE',
})


export const StorageDataTypeText = new StorageDataType({
  name: 'StorageDataTypeText',
  description: 'Data type representing a text value',
  nativeDataType: 'text',
  isSortable: true,
  serialize: toString,
})


export const StorageDataTypeJSON = new StorageDataType({
  name: 'StorageDataTypeJSON',
  description: 'Data type representing a json object',
  nativeDataType: 'json',
  isSortable: false,
  serialize: JSON.stringify,
})


export const StorageDataTypeTimestamp = new StorageDataType({
  name: 'StorageDataTypeTimestamp',
  description: 'Data type representing a timestamp without timezone',
  nativeDataType: 'timestamp',
  isSortable: true,
  serialize: toString,
})


export const StorageDataTypeTimestampTz = new StorageDataType({
  name: 'StorageDataTypeTimestampTz',
  description: 'Data type representing a timestamp with timezone',
  nativeDataType: 'timestamptz',
  isSortable: true,
  serialize: toString,
})
