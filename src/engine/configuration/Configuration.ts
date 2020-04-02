import { passOrThrow, isArray } from '../util';

import { Schema, isSchema } from '../schema/Schema';
import { languageIsoCodeRegex, LANGUAGE_ISO_CODE_PATTERN } from '../constants';
import {
  ProtocolConfiguration,
  isProtocolConfiguration,
} from '../protocol/ProtocolConfiguration';
import {
  StorageConfiguration,
  isStorageConfiguration,
} from '../storage/StorageConfiguration';

import * as _ from 'lodash';

export type ConfigurationSetup = {
  languages?: string[];
  schema?: Schema;
  protocolConfiguration?: ProtocolConfiguration;
  storageConfiguration?: StorageConfiguration;
};

export class Configuration {
  languages: string[];
  schema: Schema;
  protocolConfiguration: ProtocolConfiguration;
  storageConfiguration: StorageConfiguration;

  constructor(setup: ConfigurationSetup = {} as ConfigurationSetup) {
    const {
      languages,
      schema,
      protocolConfiguration,
      storageConfiguration,
    } = setup;

    this.setLanguages(languages || ['en']);

    if (schema) {
      this.setSchema(schema);
    }

    if (protocolConfiguration) {
      this.setProtocolConfiguration(protocolConfiguration);
    }

    if (storageConfiguration) {
      this.setStorageConfiguration(storageConfiguration);
    }
  }

  setLanguages(languages: string[]): void {
    passOrThrow(
      isArray(languages, true),
      () => 'Configuration.setLanguages() expects a list of language iso codes',
    );

    languages.map(language => {
      passOrThrow(
        languageIsoCodeRegex.test(language),
        () =>
          `Invalid language iso code '${language}' provided (Regex: /${LANGUAGE_ISO_CODE_PATTERN}/)`,
      );
    });

    passOrThrow(
      languages.length === _.uniq(languages).length,
      () => 'Language codes should be unique in the list',
    );

    this.languages = languages;
  }

  getLanguages(): string[] {
    return this.languages;
  }

  getDefaultLanguage(): string {
    return this.getLanguages()[0];
  }

  setSchema(schema: Schema): void {
    passOrThrow(isSchema(schema), () => 'Configuration expects a valid schema');

    this.schema = schema;
  }

  getSchema(): Schema {
    passOrThrow(this.schema, () => 'Configuration is missing a valid schema');

    return this.schema;
  }

  setProtocolConfiguration(protocolConfiguration: ProtocolConfiguration): void {
    passOrThrow(
      isProtocolConfiguration(protocolConfiguration),
      () => 'Configuration expects a valid protocolConfiguration',
    );

    this.protocolConfiguration = protocolConfiguration;

    protocolConfiguration.getParentConfiguration = () => this;
  }

  getProtocolConfiguration(): ProtocolConfiguration {
    passOrThrow(
      this.protocolConfiguration,
      () => 'Configuration is missing a valid protocolConfiguration',
    );

    return this.protocolConfiguration;
  }

  setStorageConfiguration(storageConfiguration: StorageConfiguration): void {
    passOrThrow(
      isStorageConfiguration(storageConfiguration),
      () => 'Configuration expects a valid storageConfiguration',
    );

    this.storageConfiguration = storageConfiguration;

    storageConfiguration.getParentConfiguration = () => this;
  }

  getStorageConfiguration(): StorageConfiguration {
    passOrThrow(
      this.storageConfiguration,
      () => 'Configuration is missing a valid storageConfiguration',
    );

    return this.storageConfiguration;
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const isConfiguration = (obj: any): boolean => {
  return obj instanceof Configuration;
};
