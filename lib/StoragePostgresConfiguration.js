
import {
  StorageConfiguration,
} from 'shift-engine';

import fs from 'fs';
import _ from 'lodash';

const templatesPath = `${__dirname}/storageScripts`


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

    const template = fs.readFileSync(`${templatesPath}/${templateFileName}`, 'UTF8')
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

}


export default StoragePostgresConfiguration


export const isStoragePostgresConfiguration = (obj) => {
  return (obj instanceof StoragePostgresConfiguration)
}
