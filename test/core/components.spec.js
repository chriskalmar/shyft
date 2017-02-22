
'use strict';

import { engine, registry } from '../../';

import model from '../fixtures/models/simple/geo.js';


function loadAndRenderCoreComponent(name, model) {
  const component = registry.getCoreComponent(name)
  const templateVars = component.processor(model)
  const template = engine.loadTemplate(component.templatePath)

  return template.renderToString(templateVars).trim()
}


describe('component', function() {

  describe('schema', function() {

    it('should render a DB schema definition', function() {

      const result = loadAndRenderCoreComponent('schema', model)

      expect(result).to.equal('CREATE SCHEMA IF NOT EXISTS geo;')
    })

  })
})
