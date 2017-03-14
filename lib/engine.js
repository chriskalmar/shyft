
import registry from './registry';
import reporter from './reporter';
import components from './components/';
import fs from 'fs';
import path from 'path';
import marko from 'marko';
import _ from 'lodash';
import crypto from 'crypto';
import glob from 'glob';

const SYSTEM_NAME_MAX_LENGTH = 63
const layoutTemplatePath = __dirname + '/layouts/layout.marko';

const SQL_NAME_SEPARATOR = '__'

const indexTypes = {
  PRIMARY: 1,
  UNIQUE: 2,
  EXCLUSION: 3,
  FOREIGN: 4,
  CHECK: 5,
  INDEX: 6
}



require('marko/compiler').defaultOptions.writeToDisk = false;


export default {
  indexTypes,
  loadTemplate,
  generateDatabaseSql,
  loadDomainModels,
  loadDomainModelsFromFilePath,
  loadCoreDomainModels,
  convertTargetToPath,
  convertPathToSql,
  generateIndexName,
  getSqlSchemaName,
  getSqlSchemaNames,
}



const indexTypesSuffix = {
  [ indexTypes.PRIMARY ]: 'pkey',
  [ indexTypes.UNIQUE ]: 'key',
  [ indexTypes.EXCLUSION ]: 'excl',
  [ indexTypes.FOREIGN ]: 'fkey',
  [ indexTypes.CHECK ]: 'check',
  [ indexTypes.INDEX ]: 'idx'
}



// bootstrap on load
bootstrap()



// bootstrap framework
function bootstrap() {

  // load all core components
  registry.setCoreComponent( ...expandComponent('schema') )


  // load all data types
  _.map([
    'string',
    'bigint',
    'integer',
    'boolean',
    'json',
    'date',
    'time',
    'timetz',
    'timestamp',
    'timestamptz',
    'email',
    'password',
    'reference'
  ], (dataTypeName) => {
    const klass = require(`./datatypes/${dataTypeName}`).default
    registry.addDataType( dataTypeName, new klass() )
  })


  function expandComponent(name) {
    return [
      name,
      components[ name ],
      `${__dirname}/components/${name}/${name}.marko`
    ]
  }
}



// load a marko template and return as function
function loadTemplate( templatePath ) {

  // read template file
  const templateSrc = fs.readFileSync( templatePath )

  // extend it with an empty layout and load it
  return marko.load(
    templatePath,
    `<layout-use("${layoutTemplatePath}") marko-preserve-whitespace>${templateSrc}</layout-use>`,
    { writeToDisk: false }
  )
}



// render the complete database SQL code
function generateDatabaseSql(models, callback) {

  // load the main template
  const mainTemplate = marko.load(`${__dirname}/components/main.marko`, {writeToDisk: false});

  // setup an ordered pipeline of components to be processed
  const processingPipeline = [
    'schema'
  ]

  // collect template vars from processers
  const templateVars = {
    core: {}
  }


  if (!_.isArray(models)) {
    throw new Error('generateDatabaseSql() models needs to be an array')
  }


  // walk through all processing steps
  _.map(processingPipeline, (step) => {

    const vars = []
    const component = registry.getCoreComponent(step)

    // run process of this step on each model
    _.map(models, (model) => {
      vars.push( component.processor(model) )
    })

    // set up template vars
    templateVars.core[ step ] = {
      template: loadTemplate( component.templatePath ),
      vars: vars
    }
  })


  // render
  if (callback) {
    mainTemplate.renderToString(templateVars, callback)
  }
  else {
    return mainTemplate.renderToString(templateVars)
  }

  return null
}



// load and validate domain models
function loadDomainModels(domainModels, providerName) {

  if (!_.isArray(domainModels)) {
    throw new Error('loadDomainModels() domainModels needs to be an array')
  }

  // import models
  _.map(domainModels, (domainModel) => {

    if (!_.isObject(domainModel) || !domainModel.model || !domainModel.filePath) {
      throw new Error('loadDomainModels() each domainModel needs to have a filePath and a model property')
    }

    reporter.printDimmed(`Importing '${domainModel.filePath}'`)

    registry.importDomainModel(domainModel.model, providerName)
  })

  reporter.printSuccess('Models imported successfully')

}



// load and validate domain models form a file path
function loadDomainModelsFromFilePath(domainModelsPath, providerName) {

  const domainModelFiles = glob.sync(domainModelsPath + './**/*.js');

  const domainModels = []

  reporter.printDimmed(`Importing from '${domainModelsPath}'`)

  // run on every file found
  _.map(domainModelFiles, (filePath) => {

    // resolve complete path
    const resolvedPath = path.resolve(filePath)

    // load model file
    const loaded = require( resolvedPath )

    // try to load the file and add it to the collection
    domainModels.push( {
      filePath: filePath,
      // allow for es6 module exports
      model: (loaded && loaded.default ? loaded.default : loaded)
    })

  })

  // finally load the domain models
  return loadDomainModels(domainModels, providerName)
}



function loadCoreDomainModels() {
  return loadDomainModelsFromFilePath(__dirname + '/models/', 'shift')
}



function convertTargetToPath(target, domainName, _providerName) {

  const parts = target.split('::')
  const providerName = _providerName === registry.localProviderName ? null : _providerName
  const ret = {}

  if (!parts.length) {
    throw new Error('convertTargetToPath() target needs to have the syntax "domain::entity"')
  }

  // get the entity name first
  ret.entity = parts.pop()

  if (parts.length) {
    // get the domain
    ret.domain = parts.pop()

    if (parts.length) {
      // get the provider
      ret.provider = parts.pop()
    }
    // fallback
    else {
      ret.provider = providerName
    }
  }
  // fallback
  else {
    ret.domain = domainName
    ret.provider = providerName
  }

  return ret
}



function convertPathToSql(structurePath) {
  let ret = ''

  const {
    provider,
    domain,
    entity,
    attribute
  } = structurePath

  if (provider) {
    ret = provider
  }

  if (domain) {
    ret += provider ? `${SQL_NAME_SEPARATOR}${domain}` : domain
  }

  if (entity) {
    ret += domain ? `.${entity}` : entity
  }

  if (attribute) {
    ret += entity ? `.${attribute}` : attribute
  }

  return ret
}



function generateIndexName(entityName, attributes, indexType = indexTypes.INDEX) {
  const suffix = indexTypesSuffix[ indexType]
  let ret = `${entityName}_${suffix}_`
  const attributesChain = (attributes || []).join('_')
  const attributesSortedChain = (attributes || []).sort().join('_')

  if (ret.length + attributesChain.length > SYSTEM_NAME_MAX_LENGTH) {
    const hashLength = 10
    const hash = crypto.createHash('sha256')
      .update(attributesSortedChain)
      .digest('hex')
      .substr(0, hashLength);

    const shortendAttributesChain = attributesChain.substr(0, SYSTEM_NAME_MAX_LENGTH - hashLength - ret.length - 1)

    ret = `${entityName}_${shortendAttributesChain}_${hash}_${suffix}`
  }
  else {
    ret = `${entityName}_${attributesChain}_${suffix}`
  }

  return ret;
}



function getSqlSchemaName(entityModel) {

  let schemaName = entityModel.domain

  // if it's not the local provider use it for the schema name
  if (registry.localProviderName !== entityModel.provider) {
    schemaName = `${entityModel.provider}${SQL_NAME_SEPARATOR}${schemaName}`
  }

  return schemaName
}


function getSqlSchemaNames() {

  const providers = registry.getDomainModels()

  return _.flatten(
    _.map(providers, (provider, providerName) => {
      return _.map(_.keys(provider), (domainName) => {

        let schemaName = domainName

        // if it's not the local provider use it for the schema name
        if (registry.localProviderName !== providerName) {
          schemaName = `${providerName}${SQL_NAME_SEPARATOR}${schemaName}`
        }

        return schemaName
      })
    })
  )
}
