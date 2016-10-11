
'use strict';

const engine = require('../../').engine
const registry = require('../../').registry

const model = require('../fixtures/models/geo.js')


function loadAndRenderCoreComponent(name, model) {
  let component = registry.getCoreComponent(name)
  let templateVars = component.processor(model)
  let template = engine.loadTemplate(component.templatePath)

  return template.renderSync(templateVars).trim()
}


describe('component', function() {

  describe('schema', function() {

    it('should render a DB schema definition', function() {

      let result = loadAndRenderCoreComponent('schema', model)

      expect(result).to.equal('CREATE SCHEMA IF NOT EXISTS geo;')
    })

  })
})
