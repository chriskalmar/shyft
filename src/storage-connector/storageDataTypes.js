import { StorageDataType } from '../';
import { i18nDataParser, i18nDataSerializer } from './i18n';

const isNotSet = (val) => val === null || typeof val === 'undefined';

const toString = (val) => {
  return isNotSet(val) ? val : String(val);
};

const toInt = (val) => {
  return isNotSet(val) ? val : parseInt(val, 10);
};

const toFloat = (val) => {
  return isNotSet(val) ? val : parseFloat(val);
};

export const StorageDataTypeInteger = new StorageDataType({
  name: 'StorageDataTypeInteger',
  description: 'Data type representing a 32-bit integer value',
  nativeDataType: 'int',
  isSortable: true,
  serialize: toInt,
  capabilities: ['in', 'lt', 'lte', 'gt', 'gte', 'ne', 'not_in'],
});

export const StorageDataTypeBigInt = new StorageDataType({
  name: 'StorageDataTypeBigInt',
  description: 'Data type representing a 64-bit integer value',
  nativeDataType: 'bigint',
  isSortable: true,
  serialize: toString,
  capabilities: ['in', 'lt', 'lte', 'gt', 'gte', 'ne', 'not_in'],
});

export const StorageDataTypeNumeric = new StorageDataType({
  name: 'StorageDataTypeNumeric',
  description: 'Data type representing a floating-point value',
  nativeDataType: 'numeric',
  isSortable: true,
  serialize: toFloat,
  capabilities: ['in', 'lt', 'lte', 'gt', 'gte', 'ne', 'not_in'],
});

export const StorageDataTypeBoolean = new StorageDataType({
  name: 'StorageDataTypeBoolean',
  description: 'Data type representing a boolean value',
  nativeDataType: 'boolean',
  isSortable: true,
  serialize: (value) => value,
  capabilities: ['ne'],
});

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
});

export const StorageDataTypeJSON = new StorageDataType({
  name: 'StorageDataTypeJSON',
  description: 'Data type representing a json object',
  nativeDataType: 'jsonb',
  isSortable: false,
  serialize: (val) => val,
  capabilities: ['includes', 'not_includes', 'is_null'],
});

export const StorageDataTypeTimestamp = new StorageDataType({
  name: 'StorageDataTypeTimestamp',
  description: 'Data type representing a timestamp without timezone',
  nativeDataType: 'timestamp without time zone',
  isSortable: true,
  serialize: toString,
  capabilities: ['in', 'lt', 'lte', 'gt', 'gte', 'ne', 'not_in'],
});

export const StorageDataTypeTimestampTz = new StorageDataType({
  name: 'StorageDataTypeTimestampTz',
  description: 'Data type representing a timestamp with timezone',
  nativeDataType: 'timestamp with time zone',
  isSortable: true,
  serialize: toString,
  capabilities: ['in', 'lt', 'lte', 'gt', 'gte', 'ne', 'not_in'],
});

export const StorageDataTypeDate = new StorageDataType({
  name: 'StorageDataTypeDate',
  description: 'Data type representing a date',
  nativeDataType: 'date',
  isSortable: true,
  serialize: toString,
  capabilities: ['in', 'lt', 'lte', 'gt', 'gte', 'ne', 'not_in'],
});

export const StorageDataTypeTime = new StorageDataType({
  name: 'StorageDataTypeTime',
  description: 'Data type representing time without timezone',
  nativeDataType: 'time without time zone',
  isSortable: true,
  serialize: toString,
  capabilities: ['in', 'lt', 'lte', 'gt', 'gte', 'ne', 'not_in'],
});

export const StorageDataTypeTimeTz = new StorageDataType({
  name: 'StorageDataTypeTimeTz',
  description: 'Data type representing time with timezone',
  nativeDataType: 'time with time zone',
  isSortable: true,
  serialize: toString,
  capabilities: ['in', 'lt', 'lte', 'gt', 'gte', 'ne', 'not_in'],
});

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
});

export const StorageDataTypeI18n = new StorageDataType({
  name: 'StorageDataTypeI18n',
  description: 'Data type representing a translation object',
  nativeDataType: 'jsonb',
  isSortable: false,
  parse: i18nDataParser,
  serialize: i18nDataSerializer,
  enforceSerialize: true,
});
