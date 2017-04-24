
import constants from './constants';
import _ from 'lodash';
import validator from './validator';
import DataType from './data-type';
import Component from './component';


// name a provider for local entities
const localProviderName = constants.localProviderName

// components registry
const components = {
  core: {},
  extensions: {},
  models: {},
  dataTypes: {}
}


export default {
  localProviderName,
  components,
  getCoreComponent,
  setCoreComponent,
  getEntityModel,
  getProviderEntityModel,
  getProviderEntityModelFromPath,
  getAllEntityModels,
  getDomainModels,
  importDomainModel,
  clearDomainModel,
  clearProviderDomainModel,
  clearAllDomainModel,
  addDataType,
  getDataType
}


const systemAttributes = {
  id: {
    isSystemAttribute: true,
    name: 'id',
    description: 'Unique row identifier',
    type: 'bigint',
    required: true,
    isPrimary: true,
  },
  createdAt: {
    isSystemAttribute: true,
    name: 'created_at',
    description: 'Record was created at this time',
    type: 'timestamptz',
    required: true,
    sqlDefault: 'CURRENT_TIMESTAMP',
  },
  updatedAt: {
    isSystemAttribute: true,
    name: 'updated_at',
    description: 'Record was updated at this time',
    type: 'timestamptz',
    required: true,
    sqlDefault: 'CURRENT_TIMESTAMP',
  },
}


// get core component
function getCoreComponent(name) {

  if ( !components.core[ name ] ) {
    throw new Error(`getCoreComponent() unknown core component: ${name}`)
  }

  return components.core[ name ]
}



// set core components via name
function setCoreComponent(component) {

  if ( !component || !(component instanceof Component) ) {
    throw new Error('setCoreComponent() requires component to extend Component class')
  }

  // register component
  components.core[ component.getName() ] = component
}



// get an entity model from a specific domain
function getEntityModel(domainName, entityName) {

  if ( !components.models[ localProviderName ][ domainName ] ) {
    throw new Error(`getEntityModel() unknown model domain: ${domainName}`)
  }

  if ( !components.models[ localProviderName ][ domainName ][ entityName ] ) {
    throw new Error(`getEntityModel() unknown entity model: ${domainName}::${entityName}`)
  }

  return components.models[ localProviderName] [ domainName ][ entityName ]
}



// get an entity model from a specific domain of a provider
function getProviderEntityModel(_providerName, domainName, entityName) {

  const providerName = _providerName || localProviderName

  if ( !components.models[ providerName ] ) {
    throw new Error(`getProviderEntityModel() unknown provider: ${providerName}`)
  }

  if ( !components.models[ providerName ][ domainName ] ) {
    throw new Error(`getProviderEntityModel() unknown model domain: ${providerName}::${domainName}`)
  }

  if ( !components.models[ providerName ][ domainName ][ entityName ] ) {
    throw new Error(`getProviderEntityModel() unknown entity model: ${providerName}::${domainName}::${entityName}`)
  }

  return components.models[ providerName ][ domainName ][ entityName ]
}


function getProviderEntityModelFromPath(structurePath) {
  return getProviderEntityModel(structurePath.provider, structurePath.domain, structurePath.entity)
}



// get all loaded entity models
function getAllEntityModels() {
  return _.flatten(
    _.map(components.models, (provider) => {
      // console.log(provider)
      return _.flatten(
        _.map(provider, (domain) => {
          return _.map(domain)
        })
      )
    })
  )
}


// get all loaded entity models
function getDomainModels() {
  return _.cloneDeep(components.models)
}



// import domain model from a model definition
function importDomainModel(_domainModel, _providerName) {

  const domainModel = _.cloneDeep(_domainModel)

  // define provider
  const providerName = _providerName || localProviderName

  // validate first
  let valid = validator.validateBaseModel(domainModel)
  let domainName

  // on success register entity models
  if (valid) {

    domainName = domainModel.domain

    // if provider doesn't exist yet, add it now
    if ( !components.models[ providerName ] ) {
      components.models[ providerName ] = {}
    }

    // if domain doesn't exist yet, add it now
    if ( !components.models[ providerName ][ domainName ] ) {
      components.models[ providerName ][ domainName ] = {}
    }

    // register each entity
    _.map(domainModel.entities, (entity) => {
      const entityName = entity.name

      // clone the model
      const entityModel = _.cloneDeep(entity)

      // if entity exists already in this domain, stop here
      if ( components.models[ providerName ][ domainName ][ entityName ] ) {
        throw new Error(`importDomainModel() duplicate entity model: ${providerName}::${domainName}::${entityName}`)
      }

      // validate each attribute
      _.map(entityModel.attributes, (attribute) => {

        // load corresponding data type
        const dataType = getDataType(attribute.type)
        const definitionValidator = dataType.getDefinitionValidator()

        // validate attribute based on the given data type
        valid = definitionValidator( attribute )

        if (!valid) {
          throw new Error(`importDomainModel() validation failed for attribute: ${attribute.name}\n` + JSON.stringify(definitionValidator.errors, null, 2))
        }
      })


      // build system attributes
      const addedSystemAttributes = []

      // add id attribute
      addedSystemAttributes.push(systemAttributes.id)

      // add created_at attribute
      addedSystemAttributes.push(systemAttributes.createdAt)

      // add updated_at attribute
      addedSystemAttributes.push(systemAttributes.updatedAt)

      // merge with system attributes
      entityModel.attributes = _.concat(addedSystemAttributes, entityModel.attributes)


      // and extend it with the domain name
      entityModel.domain = domainName

      // and extend it with the provider name
      entityModel.provider = providerName

      // register entity
      components.models[ providerName ][ domainName ][ entityName ] = entityModel
    })

  }
  else {
    throw new Error('importDomainModel() validation failed:\n' + JSON.stringify(validator.validateBaseModel.errors, null, 2))
  }

}



function clearDomainModel(domainName) {
  components.models[ localProviderName ][ domainName ] = undefined
}


function clearProviderDomainModel(providerName, domainName) {
  if (components.models[ providerName ] ) {
    components.models[ providerName ][ domainName ] = undefined
  }
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


