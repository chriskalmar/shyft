
'use strict';

const engine = require('../../').engine
const registry = require('../../').registry

const model = require('../fixtures/models/geo.js')


describe('component', function() {

  describe('schema', function() {

    it('should render a DB schema definition', function() {

      let component = registry.getCoreComponent('schema')
      let templateVars = component.processor(model)
      let template = engine.loadTemplate(component.templatePath)
      let result = template.renderSync(templateVars).trim()

      expect(result).to.equal('CREATE SCHEMA IF NOT EXISTS geo;')
    })

  })
})