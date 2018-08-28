import { StorageConfiguration } from 'shyft';
import { generateIndexName } from './util';
import fs from 'fs';
import _ from 'lodash';

const templatesPath = `${__dirname}/../storageScripts`;

const loadTemplate = templateFileName =>
  fs.readFileSync(`${templatesPath}/${templateFileName}`, 'UTF8');
const formatJSON = obj =>
  JSON.stringify(obj, null, 2)
    .split('\n')
    .join('\n  ');

class StoragePostgresConfiguration extends StorageConfiguration {
  constructor(setup = {}) {
    super({
      ...setup,
      name: 'StorageTypePostgres',
    });
  }

  generateGetLanguageIsoCodeFunction = configuration => {
    const languages = configuration.getLanguages();
    const languageNames = Object.keys(languages);
    if (languageNames.length < 2) {
      return '';
    }

    const template = loadTemplate('get_language_iso_code.tpl.sql');
    const vars = {
      languagesInverted: formatJSON(_.invert(languages)),
    };

    return _.template(template)(vars);
  };

  generateGetLanguageIdFunction = configuration => {
    const languages = configuration.getLanguages();
    const languageNames = Object.keys(languages);
    if (languageNames.length < 2) {
      return '';
    }

    const template = loadTemplate('get_language_id.tpl.sql');
    const vars = {
      languages: formatJSON(languages),
    };

    return _.template(template)(vars);
  };

  _generateGetStateFunction = (
    configuration,
    templateFileName,
    functionName,
  ) => {
    const schema = configuration.getSchema();
    const statesMap = {};
    const statesMapFlipped = {};

    _.forEach(schema.getEntities(), entity => {
      const states = entity.getStates();

      if (states) {
        statesMap[entity.storageTableName] = states;
        statesMapFlipped[entity.storageTableName] = _.invert(states);
      }
    });

    const template = loadTemplate(templateFileName);
    const vars = {
      functionName,
      statesMap: formatJSON(statesMap),
      statesMapFlipped: formatJSON(statesMapFlipped),
    };

    return _.template(template)(vars);
  };

  generateGetStateIdFunctionName = () => 'get_state_id';

  generateGetStateIdFunction = configuration => {
    return this._generateGetStateFunction(
      configuration,
      'get_state_id.tpl.sql',
      this.generateGetStateIdFunctionName(),
    );
  };

  generateGetStateIdsFunctionName = () => 'get_state_ids';

  generateGetStateIdsFunction = configuration => {
    return this._generateGetStateFunction(
      configuration,
      'get_state_ids.tpl.sql',
      this.generateGetStateIdsFunctionName(),
    );
  };

  generateGetStateMapFunctionName = () => 'get_state_map';

  generateGetStateMapFunction = configuration => {
    return this._generateGetStateFunction(
      configuration,
      'get_state_map.tpl.sql',
      this.generateGetStateMapFunctionName(),
    );
  };

  generateGetStateNameFunctionName = () => 'get_state_name';

  generateGetStateNameFunction = configuration => {
    return this._generateGetStateFunction(
      configuration,
      'get_state_name.tpl.sql',
      this.generateGetStateNameFunctionName(),
    );
  };

  _generateGetAttributeTranslationFunction = (
    configuration,
    templateFileName,
    functionName,
  ) => {
    const languages = configuration.getLanguages();
    const languageNames = Object.keys(languages);
    if (languageNames.length < 2) {
      return '';
    }

    const template = loadTemplate(templateFileName);
    const vars = {
      functionName,
      languages: formatJSON(languages),
      languageNames,
    };

    return _.template(template)(vars);
  };

  generateGetAttributeTranslationFunctionName = () =>
    'get_attribute_translation';

  generateGetAttributeTranslationFunction = configuration => {
    return this._generateGetAttributeTranslationFunction(
      configuration,
      'get_attribute_translation.tpl.sql',
      this.generateGetAttributeTranslationFunctionName(),
    );
  };

  generateGetAttributeTranslationsFunctionName = () =>
    'get_attribute_translations';

  generateGetAttributeTranslationsFunction = configuration => {
    return this._generateGetAttributeTranslationFunction(
      configuration,
      'get_attribute_translations.tpl.sql',
      this.generateGetAttributeTranslationsFunctionName(),
    );
  };

  generateMergeTranslationsFunctionName = () => 'merge_translations';

  generateMergeTranslationsFunction = configuration => {
    return this._generateGetAttributeTranslationFunction(
      configuration,
      'merge_translations.tpl.sql',
      this.generateMergeTranslationsFunctionName(),
    );
  };

  generateI18nIndices = configuration => {
    let result = '';
    let foundI18n = false;

    const languages = configuration.getLanguages();
    const languageIds = Object.keys(languages)
      .filter(languageName => languageName !== 'default')
      .map(languageName => languages[languageName]);

    const schema = configuration.getSchema();
    const storageConfiguration = configuration.getStorageConfiguration();
    const modelRegistry = storageConfiguration.getStorageModels();

    _.forEach(schema.getEntities(), entity => {
      const i18nAttributeNames = entity.getI18nAttributeNames();

      if (!i18nAttributeNames) {
        return;
      }

      foundI18n = true;

      const entityName = entity.name;
      const { dataShaperMap } = modelRegistry[entityName];

      const vars = {
        entity: entity.storageTableName,
        items: [],
      };

      i18nAttributeNames.map(i18nAttributeName => {
        const attributeName = dataShaperMap[i18nAttributeName];

        languageIds.map(languageId => {
          const textIndexName = generateIndexName(
            entity.storageTableName,
            [ attributeName ],
            `_i18n_${languageId}_text_idx`,
          );
          const trgmIndexName = generateIndexName(
            entity.storageTableName,
            [ attributeName ],
            `_i18n_${languageId}_trgm_idx`,
          );

          vars.items.push({
            textIndexName,
            trgmIndexName,
            attributeName,
            languageId,
          });
        });
      });

      const template = loadTemplate('i18n_index.tpl.sql');

      result += _.template(template)(vars);
    });

    if (foundI18n) {
      result = _.template(loadTemplate('trigram_extension.tpl.sql'))() + result;
    }

    return result;
  };
}

export default StoragePostgresConfiguration;

export const isStoragePostgresConfiguration = obj => {
  return obj instanceof StoragePostgresConfiguration;
};
