
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
  setCoreComponent
}




// set core components via name
function setCoreComponent(name, processor, templatePath) {

  if ( !_.isFunction(processor) ) {
    throw new Error('setCoreComponent() requires processor to be a function')
  }

  if ( !fs.existsSync( templatePath ) ) {
    throw new Error(`setCoreComponent() could not find template at: ${templatePath}`)
  }

  // register component
  components.core[ name ] = {
    processor,
    templatePath
  }
}



