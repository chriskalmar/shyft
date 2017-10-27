
import { StorageDataType } from 'shift-engine';
import Sequelize from 'sequelize';


export const StorageDataTypeInteger = new StorageDataType({
  name: 'StorageDataTypeInteger',
  description: 'Data type representing a 32-bit integer value',
  nativeDataType: Sequelize.INTEGER,
  isSortable: true,
  serialize: parseInt,
  capabilities: [
    'in',
    'lt',
    'lte',
    'gt',
    'gte',
    'not',
    'not_in',
  ],
})


export const StorageDataTypeBigInt = new StorageDataType({
  name: 'StorageDataTypeBigInt',
  description: 'Data type representing a 64-bit integer value',
  nativeDataType: Sequelize.BIGINT,
  isSortable: true,
  serialize: toString,
  capabilities: [
    'in',
    'lt',
    'lte',
    'gt',
    'gte',
    'not',
    'not_in',
  ],
})


export const StorageDataTypeNumeric = new StorageDataType({
  name: 'StorageDataTypeNumeric',
  description: 'Data type representing a floating-point value',
  nativeDataType: Sequelize.NUMERIC,
  isSortable: true,
  serialize: parseFloat,
  capabilities: [
    'in',
    'lt',
    'lte',
    'gt',
    'gte',
    'not',
    'not_in',
  ],
})


export const StorageDataTypeBoolean = new StorageDataType({
  name: 'StorageDataTypeBoolean',
  description: 'Data type representing a boolean value',
  nativeDataType: Sequelize.BOOLEAN,
  isSortable: true,
  serialize: (value) => !!value ? 'TRUE' : 'FALSE',
})


export const StorageDataTypeText = new StorageDataType({
  name: 'StorageDataTypeText',
  description: 'Data type representing a text value',
  nativeDataType: Sequelize.TEXT,
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
    'not',
    'not_in',
    'not_contains',
    'not_starts_with',
    'not_ends_with',
  ],
})


export const StorageDataTypeJSON = new StorageDataType({
  name: 'StorageDataTypeJSON',
  description: 'Data type representing a json object',
  nativeDataType: Sequelize.JSON,
  isSortable: false,
  serialize: JSON.stringify,
})


export const StorageDataTypeTimestamp = new StorageDataType({
  name: 'StorageDataTypeTimestamp',
  description: 'Data type representing a timestamp without timezone',
  // TODO: without time zone
  nativeDataType: Sequelize.DATE,
  isSortable: true,
  serialize: toString,
  capabilities: [
    'in',
    'lt',
    'lte',
    'gt',
    'gte',
    'not',
    'not_in',
  ],
})


export const StorageDataTypeTimestampTz = new StorageDataType({
  name: 'StorageDataTypeTimestampTz',
  description: 'Data type representing a timestamp with timezone',
  nativeDataType: Sequelize.DATE,
  isSortable: true,
  serialize: toString,
  capabilities: [
    'in',
    'lt',
    'lte',
    'gt',
    'gte',
    'not',
    'not_in',
  ],
})


export const StorageDataTypeDate = new StorageDataType({
  name: 'StorageDataTypeDate',
  description: 'Data type representing a date',
  nativeDataType: Sequelize.DATEONLY,
  isSortable: true,
  serialize: toString,
  capabilities: [
    'in',
    'lt',
    'lte',
    'gt',
    'gte',
    'not',
    'not_in',
  ],
})


export const StorageDataTypeEnum = new StorageDataType({
  name: 'StorageDataTypeEnum',
  description: 'Data type representing an enum',
  nativeDataType: Sequelize.ENUM,
  isSortable: true,
  serialize: toString,
  capabilities: [
    'in',
    'lt',
    'lte',
    'gt',
    'gte',
    'not',
    'not_in',
  ],
})
