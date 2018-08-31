import { passOrThrow, isFunction, isArray } from '../util';

import constants from '../constants';

export class StorageDataType {
  constructor(setup = {}) {
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

      capabilities.map(capability => {
        passOrThrow(
          constants.storageDataTypeCapabilities[capability],
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
    this.parse = parse || (value => value);
    this.capabilities = capabilities || [];
  }

  toString() {
    return this.name;
  }
}

export const isStorageDataType = obj => {
  return obj instanceof StorageDataType;
};
