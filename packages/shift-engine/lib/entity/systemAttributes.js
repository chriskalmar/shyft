
import {
  DataTypeID,
  DataTypeUserID,
  DataTypeTimestampTz,
} from '../datatype/dataTypes';


export const systemAttributePrimary = {
  name: 'id',
  description: 'Unique row identifier',
  type: DataTypeID,
  required: true,
  isPrimary: true,
}


export const systemAttributesTimeTracking = [
  {
    name: 'createdAt',
    description: 'Record was created at this time',
    type: DataTypeTimestampTz,
    required: true,
    defaultValue: (data, mutation) => {
      return (mutation.isTypeCreate)
        ? new Date()
        : undefined
    },
  },
  {
    name: 'updatedAt',
    description: 'Record was updated at this time',
    type: DataTypeTimestampTz,
    required: true,
    defaultValue: (data, mutation) => {
      return (mutation.isTypeCreate || mutation.isTypeUpdate)
        ? new Date()
        : undefined
    },
  },
]


export const systemAttributesUserTracking = [
  {
    name: 'createdBy',
    description: 'Record was created by this time',
    type: DataTypeUserID,
    required: true,
  },
  {
    name: 'updatedBy',
    description: 'Record was updated by this user',
    type: DataTypeUserID,
    required: true,
  },
]
