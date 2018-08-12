import { passOrThrow, isMap } from '../util';

import { isSchema } from '../schema/Schema';

import { languageIsoCodeRegex, LANGUAGE_ISO_CODE_PATTERN } from '../constants';

import { isProtocolConfiguration } from '../protocol/ProtocolConfiguration';
import { isStorageConfiguration } from '../storage/StorageConfiguration';

import _ from 'lodash';

class Configuration {
  constructor(setup = {}) {
    const {
      languages,
      schema,
      protocolConfiguration,
      storageConfiguration,
    } = setup;

    this.setLanguages(languages || { default: 1 });

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
      isMap(languages, true),
      () =>
        'Configuration.setLanguages() expects a mapping of language codes and IDs',
    );

    passOrThrow(
      languages.default,
      () =>
        'Configuration.setLanguages() expects `default` language to be defined',
    );

    const languageCodes = Object.keys(languages);
    const uniqueIds = [];

    languageCodes.map(languageCode => {
      passOrThrow(
        languageIsoCodeRegex.test(languageCode),
        () =>
          `Invalid language iso code '${languageCode}' provided (Regex: /${LANGUAGE_ISO_CODE_PATTERN}/)`,
      );

      const languageId = languages[languageCode];
      uniqueIds.push(languageId);

      passOrThrow(
        languageId === parseInt(languageId, 10) && languageId > 0,
        () =>
          `Language code '${languageCode}' has an invalid unique ID (needs to be a positive integer)`,
      );
    });

    passOrThrow(
      uniqueIds.length === _.uniq(uniqueIds).length,
      () => 'Each defined language code needs to have a unique ID',
    );

    this.languages = languages;
  }

  getLanguages() {
    return this.languages;
  }

  getLanguageCodes() {
    return Object.keys(this.languages);
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

export default Configuration;

export const isConfiguration = obj => {
  return obj instanceof Configuration;
};
