import { passOrThrow } from '../util';
import { Configuration } from '../configuration/Configuration';
import { Connection } from 'typeorm';

export type StorageConfigurationSetup = {
  // todo improve typings ?
  name?: string;
  storageInstance?: any;
  storageModels?: any;
  connectionConfig?: any;
};

export class StorageConfiguration {
  name: string;
  storageInstance: Connection;
  storageModels: any;
  connectionConfig: any;
  getParentConfiguration: () => Configuration;

  constructor(
    setup: StorageConfigurationSetup = {} as StorageConfigurationSetup,
  ) {
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

  setStorageInstance(storageInstance: Connection) {
    this.storageInstance = storageInstance;
  }

  getStorageInstance(): Connection {
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

  generateGetStateIdFunction(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    configuration: Configuration,
  ): string {
    throw new Error(
      `generateGetStateIdFunction() not implemented for storage type '${this.name}'`,
    );
  }

  generateGetStateIdsFunction(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    configuration: Configuration,
  ): string {
    throw new Error(
      `generateGetStateIdsFunction() not implemented for storage type '${this.name}'`,
    );
  }

  generateGetStateMapFunction(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    configuration: Configuration,
  ): string {
    throw new Error(
      `generateGetStateMapFunction() not implemented for storage type '${this.name}'`,
    );
  }

  generateGetStateNameFunction(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    configuration: Configuration,
  ): string {
    throw new Error(
      `generateGetStateNameFunction() not implemented for storage type '${this.name}'`,
    );
  }

  generateGetAttributeTranslationFunction(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    configuration: Configuration,
  ): string {
    throw new Error(
      `generateGetAttributeTranslationFunction() not implemented for storage type '${this.name}'`,
    );
  }

  generateGetAttributeTranslationsFunction(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    configuration: Configuration,
  ): string {
    throw new Error(
      `generateGetAttributeTranslationsFunction() not implemented for storage type '${this.name}'`,
    );
  }

  generateMergeTranslationsFunction(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    configuration: Configuration,
  ): string {
    throw new Error(
      `generateMergeTranslationsFunction() not implemented for storage type '${this.name}'`,
    );
  }

  createI18nIndices(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    configuration: Configuration,
  ): string {
    throw new Error(
      `createI18nIndices() not implemented for storage type '${this.name}'`,
    );
  }

  generateI18nIndicesMigration(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    configuration: Configuration,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    manager: unknown,
  ): Promise<{ upQueries: string[]; downQueries: string[] }> {
    throw new Error(
      `generateI18nIndicesMigration() not implemented for storage type '${this.name}'`,
    );
  }
}

export const isStorageConfiguration = (
  obj: unknown,
): obj is StorageConfiguration => {
  return obj instanceof StorageConfiguration;
};
