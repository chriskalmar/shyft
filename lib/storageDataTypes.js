
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


export const StorageDataJSON = new StorageDataType({
  name: 'StorageDataJSON',
  description: 'Data type representing a json object',
  nativeDataType: 'json',
  isSortable: true,
  serialize: JSON.stringify,
})
