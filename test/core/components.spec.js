
'use strict';

import { engine, registry } from '../../';

import model from '../fixtures/models/simple/geo.js';


function loadAndRenderCoreComponent(name, model) {
  let component = registry.getCoreComponent(name)
  let templateVars = component.processor(model)
  let template = engine.loadTemplate(component.templatePath)

  return template.renderToString(templateVars).trim()
}


describe('component', function() {

  describe('schema', function() {

    it('should render a DB schema definition', function() {

      let result = loadAndRenderCoreComponent('schema', model)

      expect(result).to.equal('CREATE SCHEMA IF NOT EXISTS geo;')
    })

  })
})
