
'use strict';


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
  components.core[ name ] = {
    processor,
    templatePath
  }
}



