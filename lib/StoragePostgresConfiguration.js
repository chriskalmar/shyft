
import {
  StorageConfiguration,
} from 'shift-engine';

import fs from 'fs';
import _ from 'lodash';

const templatesPath = `${__dirname}/storageScripts`

const loadTemplate = (templateFileName) => fs.readFileSync(`${templatesPath}/${templateFileName}`, 'UTF8')

class StoragePostgresConfiguration extends StorageConfiguration {

  constructor(setup = {}) {
    super(setup)
  }


  _generateGetStateIdFunction = (configuration, templateFileName, functionName) => {
    const schema = configuration.getSchema()
    const statesMap = {}

    _.forEach(schema.getEntities(), entity => {
      const states = entity.getStates()

      if (states) {
        statesMap[ entity.storageTableName ] = states
      }
    })

    const template = loadTemplate(templateFileName)
    const vars = {
      functionName,
      statesMap,
    }

    return _.template(template)(vars)
  }


  generateGetStateIdFunctionName = () => 'get_state_id'

  generateGetStateIdFunction = (configuration) => {
    return this._generateGetStateIdFunction(
      configuration,
      'get_state_id.tpl.sql',
      this.generateGetStateIdFunctionName()
    )
  }


  generateGetStateIdsFunctionName = () => 'get_state_ids'

  generateGetStateIdsFunction = (configuration) => {
    return this._generateGetStateIdFunction(
      configuration,
      'get_state_ids.tpl.sql',
      this.generateGetStateIdsFunctionName()
    )
  }


  generateGetStateMapFunctionName = () => 'get_state_map'

  generateGetStateMapFunction = (configuration) => {
    return this._generateGetStateIdFunction(
      configuration,
      'get_state_map.tpl.sql',
      this.generateGetStateMapFunctionName()
    )
  }


  _generateGetAttributeTranslationFunction = (configuration, templateFileName, functionName) => {
    const languages = configuration.getLanguages()
    if (Object.keys(languages).length < 2) {
      return '';
    }

    const template = loadTemplate(templateFileName)
    const vars = {
      functionName,
      languages,
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

}


export default StoragePostgresConfiguration


export const isStoragePostgresConfiguration = (obj) => {
  return (obj instanceof StoragePostgresConfiguration)
}
