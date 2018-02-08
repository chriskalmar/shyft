
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
  defaultValue: (data, mutation) => {
    if (mutation.isTypeCreate || mutation.isTypeUpdate) {
      if (typeof mutation.toState === 'string') {
        return mutation.toState
      }
    }
    return undefined
  },
  serialize: (value, data, mutation, entity) => {
    const states = entity.getStates()
    const state = states[ value ]

    if (!state) {
      throw new CustomError('State was not set', 'StateNotSetError')
    }

    return state
  },
  validate: (value, data, { mutation }) => {
    if (mutation.isTypeCreate || mutation.isTypeUpdate) {
      if (typeof mutation.toState !== 'string') {

        if (!mutation.toState) {
          throw new CustomError('State transition (toState) not defined', 'StateTransitionNotDefinedError')
        }

        if (!mutation.toState.includes(value)) {
          const stateList = mutation.toState.join(', ')
          throw new CustomError(`Invalid state was set. Needs to be one of: ${stateList}`, 'InvalidStateSetError')
        }
      }
    }
  },
}

