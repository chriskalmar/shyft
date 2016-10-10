'use strict';


const registry = require('./registry')
const components = require('../core/components/')
const fs = require('fs')
const marko = require('marko')
const layoutTemplatePath = __dirname + '/../core/layouts/layout.marko'




require('marko/compiler').defaultOptions.writeToDisk = false;


module.exports = {
  loadTemplate
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



// load a marko template an return as function
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


