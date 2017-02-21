
'use strict';

import _ from 'lodash';
import fs from 'fs';
import validator from './validator';
import DataType from './data-type';



// components registry
let components = {
  core: {},
  extensions: {},
  models: {},
  dataTypes: {}
}


export default {
  components,
  getCoreComponent,
  setCoreComponent,
  getEntityModel,
  importDomainModel,
  clearDomainModel,
  clearAllDomainModel,
  addDataType,
  getDataType
}



// get core component
function getCoreComponent(name) {

  if ( !components.core[ name ] ) {
    throw new Error(`getCoreComponent() unknown core component: ${name}`)
  }

  return components.core[ name ]
}




// set core components via name
function setCoreComponent(name, processor, templatePath) {

  if ( !name ) {
    throw new Error('setCoreComponent() requires a name for the component')
  }

  if ( !_.isFunction(processor) ) {
    throw new Error('setCoreComponent() requires processor to be a function')
  }

  if ( !fs.existsSync(templatePath) || !fs.statSync(templatePath).isFile() ) {
    throw new Error(`setCoreComponent() could not find template at: ${templatePath}`)
  }

  // register component
  components.core[ name ] = {
    name,
    processor,
    templatePath
  }
}




// get an entity model from a specific domain
function getEntityModel(domainName, entityName) {

  if ( !components.models[ domainName ] ) {
    throw new Error(`getModel() unknown model domain: ${domainName}`)
  }

  if ( !components.models[ domainName ][ entityName ] ) {
    throw new Error(`getModel() unknown entity model: ${domainName}::${entityName}`)
  }

  return components.models[ domainName ][ entityName ]
}




// import domain model from a model definition
function importDomainModel(domainModel) {

  // validate first
  let valid = validator.validateBaseModel(domainModel)
  let domainName

  // on success register entity models
  if (valid) {

    domainName = domainModel.domain

    // if domain doesn't exist yet, add it now
    if ( !components.models[ domainName ] ) {
      components.models[ domainName ] = {}
    }

    // register each entity
    _.map(domainModel.entities, function(entity) {
      let entityName = entity.name
      let entityModel

      // if entity exists already in this domain, stop here
      if ( components.models[ domainName ][ entityName ] ) {
        throw new Error(`importDomainModel() duplicate entity model: ${domainName}::${entityName}`)
      }

      // validate each attribute
      _.map(entity.attributes, function(attribute) {

        // load corresponding data type
        let dataType = getDataType(attribute.type)
        let definitionValidator = dataType.getDefinitionValidator()

        // validate attribute based on the given data type
        valid = definitionValidator( attribute )

        if (!valid) {
          throw new Error(`importDomainModel() validation failed for attribute: ${attribute.name}\n` + JSON.stringify(definitionValidator.errors, null, 2))
        }
      })

      // clone the model
      entityModel = _.cloneDeep(entity)
      // and extend it with the domain name
      entityModel.domain = domainName

      // register entity
      components.models[ domainName ][ entityName ] = entityModel
    })

  }
  else {
    throw new Error('importDomainModel() validation failed:\n' + JSON.stringify(validator.validateBaseModel.errors, null, 2))
  }

}




function clearDomainModel(domainName) {
  components.models[ domainName ] = undefined
}


function clearAllDomainModel() {
  components.models = {}
}




// add a new data type
function addDataType(name, dataType) {

  if ( !name ) {
    throw new Error('addDataType() requires a name for the data type')
  }

  // if data type name has already been use
  if ( components.dataTypes[ name ] ) {
    throw new Error(`addDataType() duplicate data type: ${name}`)
  }

  // check if it inherits from the DataType class
  if ( !(dataType instanceof DataType) ) {
    throw new Error('addDataType() dataType needs to be an instance of DataType class')
  }

  // register data type
  components.dataTypes[ name ] = dataType
}



// get data type
function getDataType(name) {

  if ( !components.dataTypes[ name ] ) {
    throw new Error(`getDataType() unknown data type: ${name}`)
  }

  return components.dataTypes[ name ]
}


