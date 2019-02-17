import { passOrThrow, isArray } from '../util';

import { isSchema } from '../schema/Schema';

import { languageIsoCodeRegex, LANGUAGE_ISO_CODE_PATTERN } from '../constants';

import { isProtocolConfiguration } from '../protocol/ProtocolConfiguration';
import { isStorageConfiguration } from '../storage/StorageConfiguration';

import * as _ from 'lodash';

export class Configuration {
  constructor(setup = {}) {
    const {
      languages,
      schema,
      protocolConfiguration,
      storageConfiguration,
    } = setup;

    this.setLanguages(languages || [ 'en' ]);

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

  setLanguages(languages) {
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

  getLanguages() {
    return this.languages;
  }

  setSchema(schema) {
    passOrThrow(isSchema(schema), () => 'Configuration expects a valid schema');

    this.schema = schema;
  }

  getSchema() {
    passOrThrow(this.schema, () => 'Configuration is missing a valid schema');

    return this.schema;
  }

  setProtocolConfiguration(protocolConfiguration) {
    passOrThrow(
      isProtocolConfiguration(protocolConfiguration),
      () => 'Configuration expects a valid protocolConfiguration',
    );

    this.protocolConfiguration = protocolConfiguration;

    protocolConfiguration.getParentConfiguration = () => this;
  }

  getProtocolConfiguration() {
    passOrThrow(
      this.protocolConfiguration,
      () => 'Configuration is missing a valid protocolConfiguration',
    );

    return this.protocolConfiguration;
  }

  setStorageConfiguration(storageConfiguration) {
    passOrThrow(
      isStorageConfiguration(storageConfiguration),
      () => 'Configuration expects a valid storageConfiguration',
    );

    this.storageConfiguration = storageConfiguration;

    storageConfiguration.getParentConfiguration = () => this;
  }

  getStorageConfiguration() {
    passOrThrow(
      this.storageConfiguration,
      () => 'Configuration is missing a valid storageConfiguration',
    );

    return this.storageConfiguration;
  }
}

export const isConfiguration = obj => {
  return obj instanceof Configuration;
};
