import { passOrThrow, isFunction, isArray } from '../util';

import { storageDataTypeCapabilities } from '../constants';

export type StorageDataTypeSetup = {
  name?: string;
  description?: string;
  // improve nativeDataType typing
  nativeDataType?: any;
  isSortable?: boolean;
  serialize?: Function;
  enforceSerialize?: boolean;
  parse?: Function;
  capabilities?: string[];
};

export class StorageDataType {
  name: string;
  description: string;
  nativeDataType: any;
  isSortable?: boolean;
  serialize: Function;
  enforceSerialize?: boolean;
  parse?: Function;
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
    this.parse = parse || ((value: any) => value);
    this.capabilities = capabilities || [];
  }

  toString() {
    return this.name;
  }
}

export const isStorageDataType = (obj: unknown): obj is StorageDataType => {
  return obj instanceof StorageDataType;
};
