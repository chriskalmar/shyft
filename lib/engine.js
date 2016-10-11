'use strict';


const registry = require('./registry')
const components = require('../core/components/')
const fs = require('fs')
const marko = require('marko')
const layoutTemplatePath = __dirname + '/../core/layouts/layout.marko'
const _ = require('lodash')



require('marko/compiler').defaultOptions.writeToDisk = false;


module.exports = {
  loadTemplate,
  generateDatabaseSql
}



// bootstrap on load
bootstrap()



// bootstrap framework
function bootstrap() {

  // load all core components
  registry.setCoreComponent( ...expandComponent('schema') )

  function expandComponent(name) {
    return [
      name,
      components[ name ],
      `./core/components/${name}/${name}.marko`
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
  const mainTemplate = marko.load('./core/components/main.marko', {writeToDisk: false});

  // setup an ordered pipeline of components to be processed
  const processingPipeline = [
    'schema'
  ]

  // collect template vars from processers
  let templateVars = {
    core: {}
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
  mainTemplate.render(templateVars, callback)

}