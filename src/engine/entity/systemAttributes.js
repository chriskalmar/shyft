import {
  DataTypeID,
  DataTypeUserID,
  DataTypeTimestampTz,
  DataTypeI18n,
} from '../datatype/dataTypes';

import { CustomError } from '../CustomError';
import { DataTypeState } from '../datatype/DataTypeState';
import { i18nMockGenerator } from '../i18n';

import * as _ from 'lodash';

export const systemAttributePrimary = {
  name: 'id',
  description: 'Unique row identifier',
  type: DataTypeID,
  required: true,
  primary: true,
};

export const systemAttributesTimeTracking = [
  {
    name: 'createdAt',
    description: 'Record was created at this time',
    type: DataTypeTimestampTz,
    required: true,
    defaultValue: (data, mutation) => {
      return mutation.isTypeCreate ? new Date() : undefined;
    },
  },
  {
    name: 'updatedAt',
    description: 'Record was updated at this time',
    type: DataTypeTimestampTz,
    required: true,
    defaultValue: (data, mutation) => {
      return mutation.isTypeCreate || mutation.isTypeUpdate
        ? new Date()
        : undefined;
    },
  },
];

export const systemAttributesUserTracking = [
  {
    name: 'createdBy',
    description: 'Record was created by this time',
    type: DataTypeUserID,
    required: true,
    defaultValue: (data, mutation, entity, { userId }) => {
      // TODO: make overridable
      return mutation.isTypeCreate && userId ? userId : undefined;
    },
  },
  {
    name: 'updatedBy',
    description: 'Record was updated by this user',
    type: DataTypeUserID,
    required: true,
    defaultValue: (data, mutation, entity, { userId }) => {
      // TODO: make overridable
      return (mutation.isTypeCreate || mutation.isTypeUpdate) && userId
        ? userId
        : undefined;
    },
  },
];

export const systemAttributeState = {
  name: 'state',
  description: 'State of record',
  type: (attribute, entity) =>
    new DataTypeState({
      ...attribute,
      validate: undefined, // delete from props as it would be handled as a data type validator
      name: _.camelCase(`${entity.name}-instance-state`),
      states: entity.states,
    }),
  required: true,
  defaultValue: (data, mutation) => {
    if (mutation.isTypeCreate || mutation.isTypeUpdate) {
      if (typeof mutation.toState === 'string') {
        return mutation.toState;
      }
    }
    return undefined;
  },
  serialize: (value, data, mutation, entity) => {
    const states = entity.getStates();
    const state = states[value];

    if (!state) {
      throw new CustomError('State was not set', 'StateNotSetError');
    }

    return state;
  },
  validate: (value, attributeName, data, { mutation }) => {
    if (mutation.isTypeCreate || mutation.isTypeUpdate) {
      if (typeof mutation.toState !== 'string') {
        if (!mutation.toState) {
          throw new CustomError(
            'State transition (toState) not defined',
            'StateTransitionNotDefinedError',
          );
        }

        if (!mutation.toState.includes(value)) {
          const stateList = mutation.toState.join(', ');
          throw new CustomError(
            `Invalid state was set. Needs to be one of: ${stateList}`,
            'InvalidStateSetError',
          );
        }
      }
    }
  },
};

export const systemAttributeI18n = {
  name: 'i18n',
  description: 'Translations of record',
  type: DataTypeI18n,
  hidden: true,
  required: true,
  meta: {
    storageAttributeName: 'i18n',
  },
  mock: i18nMockGenerator,
};
