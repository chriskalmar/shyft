import { camelCase, isFunction } from 'lodash';
import * as casual from 'casual';

import {
  DataTypeID,
  DataTypeUserID,
  DataTypeTimestampTz,
  DataTypeI18n,
} from '../datatype/dataTypes';

import { CustomError } from '../CustomError';
import { DataTypeState } from '../datatype/DataTypeState';
import { Entity, isEntity } from './Entity';
import { Mutation } from '../mutation/Mutation';
import { i18nMockGenerator } from '../i18n';
import { Attribute } from '../attribute/Attribute';
import { Context } from '../context/Context';

export const systemAttributePrimary = {
  name: 'id',
  description: 'Unique row identifier',
  type: DataTypeID,
  required: true,
  primary: true,
};

export const systemAttributesTimeTracking: Attribute[] = [
  {
    name: 'createdAt',
    description: 'Record was created at this time',
    type: DataTypeTimestampTz,
    required: true,
    defaultValue: ({ operation: mutation }: { operation: Mutation }): Date => {
      return mutation.isTypeCreate ? new Date() : undefined;
    },
    mock: (entity: Entity): Date => {
      if (entity.meta && entity.meta.mockCreatedAtGenerator) {
        if (!isFunction(entity.meta.mockCreatedAtGenerator)) {
          throw new CustomError(
            `meta.mockCreatedAtGenerator needs to be a function in entity '${entity.name}'`,
            'InvalidMetaDataError',
          );
        }
        return entity.meta.mockCreatedAtGenerator();
      }

      return new Date(casual.unix_time * 1000);
    },
  },
  {
    name: 'updatedAt',
    description: 'Record was updated at this time',
    type: DataTypeTimestampTz,
    required: true,
    defaultValue: ({ operation: mutation }: { operation: Mutation }): Date => {
      return mutation.isTypeCreate || mutation.isTypeUpdate
        ? new Date()
        : undefined;
    },
    mock: (entity: Entity) => {
      if (entity.meta && entity.meta.mockUpdatedAtGenerator) {
        if (!isFunction(entity.meta.mockUpdatedAtGenerator)) {
          throw new CustomError(
            `meta.mockUpdatedAtGenerator needs to be a function in entity '${entity.name}'`,
            'InvalidMetaDataError',
          );
        }
        return entity.meta.mockUpdatedAtGenerator();
      }

      return new Date(casual.unix_time * 1000);
    },
  },
];

export const systemAttributesUserTracking: Attribute[] = [
  {
    name: 'createdBy',
    description: 'Record was created by this time',
    type: DataTypeUserID,
    required: true,
    defaultValue: ({
      operation: mutation,
      context: { userId },
    }: {
      operation: Mutation;
      context: Context;
    }): number | string => {
      // TODO: make overridable
      return mutation.isTypeCreate && userId ? userId : undefined;
    },
  },
  {
    name: 'updatedBy',
    description: 'Record was updated by this user',
    type: DataTypeUserID,
    required: true,
    defaultValue: ({
      operation: mutation,
      context: { userId },
    }: {
      operation: Mutation;
      context: Context;
    }): number | string => {
      // TODO: make overridable
      return (mutation.isTypeCreate || mutation.isTypeUpdate) && userId
        ? userId
        : undefined;
    },
  },
];

export const systemAttributeState: Attribute = {
  name: 'state',
  description: 'State of record',
  type: ({ setup: attribute, entity }) =>
    new DataTypeState({
      ...attribute,
      name: camelCase(`${entity.name}-instance-state`),
      states: isEntity(entity) ? entity.states : undefined,
    }),
  required: true,
  defaultValue: ({
    operation: mutation,
  }: {
    operation: Mutation;
  }): number | string => {
    if (mutation.isTypeCreate || mutation.isTypeUpdate) {
      if (typeof mutation.toState === 'string') {
        return mutation.toState;
      }
    }
    return undefined;
  },
  serialize: (value, _: any, __: Mutation, entity: Entity) => {
    const states = entity.getStates();
    const state = states[value as any];

    if (!state) {
      throw new CustomError('State was not set', 'StateNotSetError');
    }

    return state;
  },
  // why ts-ignore? because mutation does not exist on the graphQl/Source class type as public member
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  validate: ({ value, source: { mutation } }) => {
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

export const systemAttributeI18n: Attribute = {
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
