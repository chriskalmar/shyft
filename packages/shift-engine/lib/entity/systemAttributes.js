
import {
  DataTypeID,
  DataTypeUserID,
  DataTypeTimestampTz,
} from '../datatype/dataTypes';

import CustomError from '../CustomError'

import DataTypeState from '../datatype/DataTypeState.js';

import _ from 'lodash';


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
    defaultValue: (data, mutation, entity, { req }) => {
      // TODO: make overridable
      return (mutation.isTypeCreate && req && req.user && req.user.id)
        ? req.user.id
        : undefined
    },
  },
  {
    name: 'updatedBy',
    description: 'Record was updated by this user',
    type: DataTypeUserID,
    required: true,
    defaultValue: (data, mutation, entity, { req }) => {
      // TODO: make overridable
      return ((mutation.isTypeCreate || mutation.isTypeUpdate) && req && req.user && req.user.id)
        ? req.user.id
        : undefined
    },
  },
]


export const systemAttributeState = {
  name: 'state',
  description: 'State of record',
  type: (attribute, entity) => new DataTypeState({
    ...attribute,
    name: _.camelCase(`${entity.name}-instance-state`),
    states: entity.states,
  }),
  required: true,
}

