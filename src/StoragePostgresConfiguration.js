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
    const indices = [];

    const languages = configuration.getLanguages();
    const languageIds = Object.keys(languages)
      .filter(languageName => languageName !== 'default')
      .map(languageName => languages[languageName]);

    const schema = configuration.getSchema();
    const storageConfiguration = configuration.getStorageConfiguration();
    const modelRegistry = storageConfiguration.getStorageModels();

    const textIndexTemplate = loadTemplate('i18n_text_index.tpl.sql');
    const trgmIndexTemplate = loadTemplate('i18n_trgm_index.tpl.sql');

    _.forEach(schema.getEntities(), entity => {
      const i18nAttributeNames = entity.getI18nAttributeNames();

      if (!i18nAttributeNames) {
        return;
      }

      const entityName = entity.name;
      const { dataShaperMap } = modelRegistry[entityName];
      const { storageTableName } = entity;

      i18nAttributeNames.map(i18nAttributeName => {
        const attributeName = dataShaperMap[i18nAttributeName];

        if (!attributeName) {
          return;
        }

        languageIds.map(languageId => {
          const textIndexName = generateIndexName(
            storageTableName,
            [ attributeName ],
            `_i18n_${languageId}_text_idx`,
          );

          indices.push({
            name: textIndexName,
            query: _.template(textIndexTemplate)({
              indexName: textIndexName,
              attributeName,
              languageId,
              storageTableName,
            }),
          });

          const trgmIndexName = generateIndexName(
            storageTableName,
            [ attributeName ],
            `_i18n_${languageId}_trgm_idx`,
          );

          indices.push({
            name: trgmIndexName,
            query: _.template(trgmIndexTemplate)({
              indexName: trgmIndexName,
              attributeName,
              languageId,
              storageTableName,
            }),
          });
        });
      });
    });

    return indices;
  };

  createI18nIndices = configuration => {
    let result = '';
    const extensionTemplate = loadTemplate('trigram_extension.tpl.sql');

    const indices = this.generateI18nIndices(configuration);
    if (indices && indices.length) {
      indices.forEach(({ query }) => {
        result += query;
      });

      result = _.template(extensionTemplate)() + result;
    }

    return result;
  };

  generateI18nIndicesMigration = async (configuration, manager) => {
    const upQueries = [];
    const downQueries = [];

    const indices = this.generateI18nIndices(configuration);

    const foundIndices = await manager.query(`
      SELECT *
      FROM pg_indexes
      WHERE indexname ~ '__i18n_.*(text|trgm)_idx'
    `);

    foundIndices.forEach(foundIndex => {
      if (!indices.find(({ name }) => name === foundIndex.indexname)) {
        upQueries.push(`DROP INDEX IF EXISTS ${foundIndex.indexname}`);
        downQueries.push(foundIndex.indexdef);
      }
    });

    indices.forEach(index => {
      if (!foundIndices.find(({ indexname }) => indexname === index.name)) {
        upQueries.push(index.query.replace(new RegExp('\n', 'g'), ' '));
        downQueries.push(`DROP INDEX IF EXISTS ${index.name}`);
      }
    });

    return {
      upQueries,
      downQueries,
    };
  };
}

export default StoragePostgresConfiguration;

export const isStoragePostgresConfiguration = obj => {
  return obj instanceof StoragePostgresConfiguration;
};
