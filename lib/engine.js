'use strict';


const registry = require('./registry')
const reporter = require('./reporter')
const components = require('./components/')
const fs = require('fs')
const path = require('path')
const marko = require('marko')
const layoutTemplatePath = __dirname + '/layouts/layout.marko'
const _ = require('lodash')



require('marko/compiler').defaultOptions.writeToDisk = false;


module.exports = {
  loadTemplate,
  generateDatabaseSql,
  loadDomainModels,
  loadDomainModelsFromFilePath
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
    'reference'
  ], function(dataTypeName) {
    let klass = require(`./datatypes/${dataTypeName}`)
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
  let templateSrc = fs.readFileSync( templatePath )

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
  let templateVars = {
    core: {}
  }


  if (!_.isArray(models)) {
    throw new Error('generateDatabaseSql() models needs to be an array')
  }


  // walk through all processing steps
  _.map(processingPipeline, function(step) {

    let vars = []
    let component = registry.getCoreComponent(step)

    // run process of this step on each model
    _.map(models, function(model) {
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
    mainTemplate.render(templateVars, callback)
  }
  else {
    return mainTemplate.renderSync(templateVars)
  }

}




// load and validate domain models
function loadDomainModels(domainModels) {

  if (!_.isArray(domainModels)) {
    throw new Error('loadDomainModels() domainModels needs to be an array')
  }

  // import models
  _.map(domainModels, function(domainModel) {

    if (!_.isObject(domainModel) || !domainModel.model || !domainModel.filePath) {
      throw new Error('loadDomainModels() each domainModel needs to have a filePath and a model property')
    }

    reporter.printDimmed(`Importing '${domainModel.filePath}'`)

    registry.importDomainModel(domainModel.model)
  })

  reporter.printSuccess('Models imported successfully')

}



// load and validate domain models form a file path
function loadDomainModelsFromFilePath(domainModelsPath) {

  let domainModelFiles = fs.readdirSync(domainModelsPath);
  let domainModels = []
  let resolvedPath

  reporter.printDimmed(`Importing from '${domainModelsPath}'`)

  // run on every file found
  _.map(domainModelFiles, function(filePath) {

    // take only .js files
    if ( _.endsWith(filePath, '.js') ) {

      // resolve complete path
      resolvedPath = path.resolve(domainModelsPath, filePath)

      // try to load the file and add it to the collection
      domainModels.push( {
        filePath: filePath,
        model: require( resolvedPath )
      })
    }
  })

  // finally load the domain models
  return loadDomainModels(domainModels)
}
