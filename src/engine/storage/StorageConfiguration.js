import { passOrThrow } from '../util';

class StorageConfiguration {
  constructor(setup = {}) {
    const { name, storageInstance, storageModels, connectionConfig } = setup;

    if (name) {
      this.name = name;
    }

    if (storageInstance) {
      this.setStorageInstance(storageInstance);
    }

    if (storageModels) {
      this.setStorageModels(storageModels);
    }

    if (connectionConfig) {
      this.setConnectionConfig(connectionConfig);
    }
  }

  setStorageInstance(storageInstance) {
    this.storageInstance = storageInstance;
  }

  getStorageInstance() {
    passOrThrow(
      this.storageInstance,
      () => `Storage instance not set for storage type '${this.name}'`,
    );

    return this.storageInstance;
  }

  setStorageModels(storageModels) {
    this.storageModels = storageModels;
  }

  getStorageModels() {
    passOrThrow(
      this.storageModels,
      () => `Storage models not set for storage type '${this.name}'`,
    );

    return this.storageModels;
  }

  setConnectionConfig(connectionConfig) {
    this.connectionConfig = connectionConfig;
  }

  getConnectionConfig() {
    passOrThrow(
      this.connectionConfig,
      () => `Connection config not set for storage type '${this.name}'`,
    );

    return this.connectionConfig;
  }
}

export default StorageConfiguration;

export const isStorageConfiguration = obj => {
  return obj instanceof StorageConfiguration;
};