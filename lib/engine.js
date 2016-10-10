'use strict';


const registry = require('./registry')
const components = require('../core/components/')


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

