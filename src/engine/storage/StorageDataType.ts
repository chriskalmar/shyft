import { passOrThrow, isFunction, isArray } from '../util';

import { storageDataTypeCapabilities } from '../constants';
import { Entity } from '../entity/Entity';
import { Mutation } from '../mutation/Mutation';
import { Context } from '../context/Context';
import { RegistryEntity } from '../../graphqlProtocol/registry';

export type StorageDataTypeSerializer = {
  (
    value: unknown,
    options?: {
      data?: Record<string, unknown>;
      entity?: Entity;
      mutation?: Mutation;
      model?: RegistryEntity;
      context?: Context;
    },
  ): unknown;
};

export type StorageDataTypeParser = {
  (
    value: unknown,
    options?: {
      data?: Record<string, unknown>;
      entity?: Entity;
      model?: RegistryEntity;
      context?: Context;
    },
  ): unknown;
};

export type StorageDataTypeSetup = {
  name: string;
  description: string;
  nativeDataType: any;
  isSortable?: boolean;
  serialize?: StorageDataTypeSerializer;
  enforceSerialize?: boolean;
  parse?: StorageDataTypeParser;
  capabilities?: string[];
};

export class StorageDataType {
  name: string;
  description: string;
  nativeDataType: any;
  isSortable?: boolean;
  serialize?: StorageDataTypeSerializer;
  enforceSerialize?: boolean;
  parse?: StorageDataTypeParser;
  capabilities?: string[];

  constructor(setup: StorageDataTypeSetup = {} as StorageDataTypeSetup) {
    const {
      name,
      description,
      nativeDataType,
      isSortable,
      serialize,
      enforceSerialize,
      parse,
      capabilities,
    } = setup;

    passOrThrow(name, () => 'Missing storage data type name');
    passOrThrow(
      description,
      () => `Missing description for storage data type '${name}'`,
    );
    passOrThrow(
      nativeDataType,
      () => `Missing native data type for storage data type '${name}'`,
    );

    passOrThrow(
      isFunction(serialize),
      () => `Storage data type '${name}' has an invalid serialize function`,
    );

    passOrThrow(
      !parse || isFunction(parse),
      () => `Storage data type '${name}' has an invalid parse function`,
    );

    if (capabilities) {
      passOrThrow(
        isArray(capabilities),
        () => `Storage data type '${name}' has an invalid list of capabilities`,
      );

      capabilities.map((capability) => {
        passOrThrow(
          storageDataTypeCapabilities[capability],
          () =>
            `Storage data type '${name}' has an unknown capability '${capability}'`,
        );
      });
    }

    this.name = name;
    this.description = description;
    this.nativeDataType = nativeDataType;
    this.isSortable = !!isSortable;
    this.serialize = serialize;
    this.enforceSerialize = !!enforceSerialize;
    this.parse = parse || ((value: unknown) => value);
    this.capabilities = capabilities || [];
  }

  toString() {
    return this.name;
  }
}

export const isStorageDataType = (obj: unknown): obj is StorageDataType => {
  return obj instanceof StorageDataType;
};
