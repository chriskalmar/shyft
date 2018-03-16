
import { StorageDataType } from 'shift-engine';


export const StorageDataTypeInteger = new StorageDataType({
  name: 'StorageDataTypeInteger',
  description: 'Data type representing a 32-bit integer value',
  nativeDataType: 'int',
  isSortable: true,
  serialize: parseInt,
  capabilities: [
    'in',
    'lt',
    'lte',
    'gt',
    'gte',
    'ne',
    'not_in',
  ],
})


export const StorageDataTypeBigInt = new StorageDataType({
  name: 'StorageDataTypeBigInt',
  description: 'Data type representing a 64-bit integer value',
  nativeDataType: 'bigint',
  isSortable: true,
  serialize: toString,
  capabilities: [
    'in',
    'lt',
    'lte',
    'gt',
    'gte',
    'ne',
    'not_in',
  ],
})


export const StorageDataTypeNumeric = new StorageDataType({
  name: 'StorageDataTypeNumeric',
  description: 'Data type representing a floating-point value',
  nativeDataType: 'numeric',
  isSortable: true,
  serialize: parseFloat,
  capabilities: [
    'in',
    'lt',
    'lte',
    'gt',
    'gte',
    'ne',
    'not_in',
  ],
})


export const StorageDataTypeBoolean = new StorageDataType({
  name: 'StorageDataTypeBoolean',
  description: 'Data type representing a boolean value',
  nativeDataType: 'boolean',
  isSortable: true,
  serialize: (value) => !!value ? 'TRUE' : 'FALSE',
  capabilities: [
    'ne',
  ],
})


export const StorageDataTypeText = new StorageDataType({
  name: 'StorageDataTypeText',
  description: 'Data type representing a text value',
  nativeDataType: 'text',
  isSortable: true,
  serialize: toString,
  capabilities: [
    'in',
    'lt',
    'lte',
    'gt',
    'gte',
    'contains',
    'starts_with',
    'ends_with',
    'ne',
    'not_in',
    'not_contains',
    'not_starts_with',
    'not_ends_with',
  ],
})


export const StorageDataTypeJSON = new StorageDataType({
  name: 'StorageDataTypeJSON',
  description: 'Data type representing a json object',
  nativeDataType: 'jsonb',
  isSortable: false,
  serialize: JSON.stringify,
})


export const StorageDataTypeTimestamp = new StorageDataType({
  name: 'StorageDataTypeTimestamp',
  description: 'Data type representing a timestamp without timezone',
  nativeDataType: 'timestamp without time zone',
  isSortable: true,
  serialize: toString,
  capabilities: [
    'in',
    'lt',
    'lte',
    'gt',
    'gte',
    'ne',
    'not_in',
  ],
})


export const StorageDataTypeTimestampTz = new StorageDataType({
  name: 'StorageDataTypeTimestampTz',
  description: 'Data type representing a timestamp with timezone',
  nativeDataType: 'timestamp with time zone',
  isSortable: true,
  serialize: toString,
  capabilities: [
    'in',
    'lt',
    'lte',
    'gt',
    'gte',
    'ne',
    'not_in',
  ],
})


export const StorageDataTypeDate = new StorageDataType({
  name: 'StorageDataTypeDate',
  description: 'Data type representing a date',
  nativeDataType: 'date',
  isSortable: true,
  serialize: toString,
  capabilities: [
    'in',
    'lt',
    'lte',
    'gt',
    'gte',
    'ne',
    'not_in',
  ],
})


export const StorageDataTypeEnum = new StorageDataType({
  name: 'StorageDataTypeEnum',
  description: 'Data type representing an enum',
  nativeDataType: 'enum',
  isSortable: true,
  serialize: parseInt,
  capabilities: [
    'in',
    'lt',
    'lte',
    'gt',
    'gte',
    'ne',
    'not_in',
  ],
})


export const StorageDataTypeUUID = new StorageDataType({
  name: 'StorageDataTypeUUID',
  description: 'Data type representing a UUID',
  nativeDataType: 'uuid',
  isSortable: true,
  serialize: toString,
  capabilities: [
    'in',
    'lt',
    'lte',
    'gt',
    'gte',
    'contains',
    'starts_with',
    'ends_with',
    'ne',
    'not_in',
    'not_contains',
    'not_starts_with',
    'not_ends_with',
  ],
})

