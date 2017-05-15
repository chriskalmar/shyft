
import { StorageDataType } from 'shift-engine';



export const StorageDataTypeBoolean = new StorageDataType({
  name: 'StorageDataTypeBoolean',
  description: 'Data type representing a boolean value',
  nativeDataType: Boolean,
  isSortable: true,
  serialize: (value) => !!value,
})


export const StorageDataTypeNumber = new StorageDataType({
  name: 'StorageDataTypeNumber',
  description: 'Data type representing a numeric value',
  nativeDataType: Number,
  isSortable: true,
  serialize: Number,
})


export const StorageDataTypeString = new StorageDataType({
  name: 'StorageDataTypeString',
  description: 'Data type representing a text value',
  nativeDataType: String,
  isSortable: true,
  serialize: String,
})


export const StorageDataTypeObject = new StorageDataType({
  name: 'StorageDataTypeObject',
  description: 'Data type representing a json object',
  nativeDataType: Object,
  isSortable: false,
  serialize: (value) => value,
})


export const StorageDataTimestamp = new StorageDataType({
  name: 'StorageDataTimestamp',
  description: 'Data type representing a date and time value',
  nativeDataType: Date,
  isSortable: false,
  serialize: (value) => value,
})
