
'use strict';

const _ = require('lodash')
const fs = require('fs')



// components registry
let components = {
  core: {},
  extensions: {}
}


module.exports = {
  components,
  getCoreComponent,
  setCoreComponent
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



