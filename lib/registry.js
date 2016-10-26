
'use strict';

const _ = require('lodash')
const fs = require('fs')
const validator = require('./validator')



// components registry
let components = {
  core: {},
  extensions: {},
  models: {}
}


module.exports = {
  components,
  getCoreComponent,
  setCoreComponent,
  getEntityModel,
  importEntityModels
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
    throw new Error(`getModel() unknown model: ${domainName}::${entityName}`)
  }

  return components.models[ domainName ][ entityName ]
}




// import entity models from a model definition
function importEntityModels(models) {

  // validate first
  let valid = validator.validateBaseModel(models)
  let domainName

  // on success register models
  if (valid) {

    domainName = models.domain

    // if domain doesn't exist yet, add it now
    if ( !components.models[ domainName ] ) {
      components.models[ domainName ] = {}
    }

    // register each entity
    _.map(models.entities, function(entity) {
      let entityName = entity.name
      let entityModel

      // if entity exists already in this domain, stop here
      if ( components.models[ domainName ][ entityName ] ) {
        throw new Error(`importEntityModels() duplicate entity model: ${domainName}::${entityName}`)
      }

      // clone the model
      entityModel = _.cloneDeep(entity)
      // and extend it with the domain name
      entityModel.domain = domainName

      // register entity
      components.models[ domainName ][ entityName ] = entityModel
    })

  }
  else {
    throw new Error(`importEntityModels() validation failed:\n` + JSON.stringify(validator.validateBaseModel.errors, null, 2))
  }

}

