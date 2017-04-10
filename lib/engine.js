
import constants from './constants';
import registry from './registry';
import reporter from './reporter';
import fs from 'fs';
import path from 'path';
import _ from 'lodash';
import crypto from 'crypto';
import glob from 'glob';


const localProviderName = constants.localProviderName
const SYSTEM_NAME_MAX_LENGTH = constants.SYSTEM_NAME_MAX_LENGTH
const SQL_NAME_SEPARATOR = constants.SQL_NAME_SEPARATOR
const PATH_SIGN = constants.PATH_SIGN


const indexTypes = {
  PRIMARY: 1,
  UNIQUE: 2,
  EXCLUSION: 3,
  FOREIGN: 4,
  CHECK: 5,
  INDEX: 6
}



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
  [
    'schema',
    'table',
    'reference',
    'sequence/timebased',
  ].map( (componentName) => {
    const klass = require(`./components/${componentName}`).default
    registry.setCoreComponent( new klass() )
  })


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

}



// load a template and return as function
function loadTemplate( templatePath ) {

  // read template file
  const templateSrc = fs.readFileSync( templatePath )

  // return compiled template
  return _.template(templateSrc)
}



// render the complete database SQL code
function generateDatabaseSql(models) {

  const sql = []
  const compSchema = registry.getCoreComponent('schema')
  const compTable = registry.getCoreComponent('table')
  const compReference = registry.getCoreComponent('reference')
  const compSequence = {
    timebased: registry.getCoreComponent('sequence/timebased')
  }


  if (!_.isArray(models)) {
    throw new Error('generateDatabaseSql() models needs to be an array')
  }

  // generate schemas
  const schemaNames = getSqlSchemaNames()
  sql.push( compSchema.generateSql(schemaNames) )


  // for each entity model
  models.map( (model) => {

    // generate table
    sql.push( compTable.generateSql(model) )

    // use a custom sequence if defined
    if (model.sequenceGenerator) {
      sql.push( compSequence[ model.sequenceGenerator ].generateSql(model) )
    }
  })


  // generate references for each entity model
  models.map( (model) => {
    sql.push( compReference.generateSql(model) )
  })


  // load the main template
  const mainTemplate = loadTemplate(`${__dirname}/components/main.tpl.sql`);

  // render
  return mainTemplate({
    sql: sql.join(';\n')
  })
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
function loadDomainModelsFromFilePath(_domainModelsPath, providerName) {

  const domainModelsPath = path.resolve(_domainModelsPath)

  if (!fs.existsSync(domainModelsPath)) {
    throw new Error('loadDomainModelsFromFilePath() path does not exist')
  }

  const domainModelFiles = glob.sync(domainModelsPath + '/**/*.js');
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


  if (domainModels.length < 1) {
    throw new Error('loadDomainModelsFromFilePath() no models found')
  }


  // finally load the domain models
  return loadDomainModels(domainModels, providerName)
}



function loadCoreDomainModels() {
  return loadDomainModelsFromFilePath(__dirname + '/models/', 'shift')
}



function convertTargetToPath(target, domainName, _providerName) {

  if (!target) {
    throw new Error('convertTargetToPath() target needs to be defined')
  }

  const parts = target.split(PATH_SIGN)
  const providerName = _providerName === localProviderName ? null : _providerName
  const ret = {}

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
  if (localProviderName !== entityModel.provider) {
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
        if (localProviderName !== providerName) {
          schemaName = `${providerName}${SQL_NAME_SEPARATOR}${schemaName}`
        }

        return schemaName
      })
    })
  )
}
