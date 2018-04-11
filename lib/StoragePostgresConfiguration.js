
import {
  StorageConfiguration,
} from 'shift-engine';

import fs from 'fs';
import _ from 'lodash';

const templatesPath = `${__dirname}/../storageScripts`

const loadTemplate = (templateFileName) => fs.readFileSync(`${templatesPath}/${templateFileName}`, 'UTF8')
const formatJSON = (obj) => JSON
  .stringify(obj, null, 2)
  .split('\n')
  .join('\n  ')


class StoragePostgresConfiguration extends StorageConfiguration {

  constructor(setup = {}) {
    super({
      ...setup,
      name: 'StorageTypePostgres',
    })
  }


  _generateGetStateFunction = (configuration, templateFileName, functionName) => {
    const schema = configuration.getSchema()
    const statesMap = {}
    const statesMapFlipped = {}

    _.forEach(schema.getEntities(), entity => {
      const states = entity.getStates()

      if (states) {
        statesMap[ entity.storageTableName ] = states
        statesMapFlipped[ entity.storageTableName ] = _.invert(states)
      }
    })

    const template = loadTemplate(templateFileName)
    const vars = {
      functionName,
      statesMap: formatJSON(statesMap),
      statesMapFlipped: formatJSON(statesMapFlipped),
    }

    return _.template(template)(vars)
  }


  generateGetStateIdFunctionName = () => 'get_state_id'

  generateGetStateIdFunction = (configuration) => {
    return this._generateGetStateFunction(
      configuration,
      'get_state_id.tpl.sql',
      this.generateGetStateIdFunctionName()
    )
  }


  generateGetStateIdsFunctionName = () => 'get_state_ids'

  generateGetStateIdsFunction = (configuration) => {
    return this._generateGetStateFunction(
      configuration,
      'get_state_ids.tpl.sql',
      this.generateGetStateIdsFunctionName()
    )
  }


  generateGetStateMapFunctionName = () => 'get_state_map'

  generateGetStateMapFunction = (configuration) => {
    return this._generateGetStateFunction(
      configuration,
      'get_state_map.tpl.sql',
      this.generateGetStateMapFunctionName()
    )
  }


  generateGetStateNameFunctionName = () => 'get_state_name'

  generateGetStateNameFunction = (configuration) => {
    return this._generateGetStateFunction(
      configuration,
      'get_state_name.tpl.sql',
      this.generateGetStateNameFunctionName()
    )
  }



  _generateGetAttributeTranslationFunction = (configuration, templateFileName, functionName) => {
    const languages = configuration.getLanguages()
    const languageNames = Object.keys(languages)
    if (languageNames.length < 2) {
      return '';
    }

    const template = loadTemplate(templateFileName)
    const vars = {
      functionName,
      languages: formatJSON(languages),
      languageNames,
    }

    return _.template(template)(vars)
  }


  generateGetAttributeTranslationFunctionName = () => 'get_attribute_translation'

  generateGetAttributeTranslationFunction = (configuration) => {
    return this._generateGetAttributeTranslationFunction(
      configuration,
      'get_attribute_translation.tpl.sql',
      this.generateGetAttributeTranslationFunctionName()
    )
  }


  generateGetAttributeTranslationsFunctionName = () => 'get_attribute_translations'

  generateGetAttributeTranslationsFunction = (configuration) => {
    return this._generateGetAttributeTranslationFunction(
      configuration,
      'get_attribute_translations.tpl.sql',
      this.generateGetAttributeTranslationsFunctionName()
    )
  }


  generateMergeTranslationsFunctionName = () => 'merge_translations'

  generateMergeTranslationsFunction = (configuration) => {
    return this._generateGetAttributeTranslationFunction(
      configuration,
      'merge_translations.tpl.sql',
      this.generateMergeTranslationsFunctionName()
    )
  }

}


export default StoragePostgresConfiguration


export const isStoragePostgresConfiguration = (obj) => {
  return (obj instanceof StoragePostgresConfiguration)
}
