
import { engine, registry } from '../../';

import model from '../fixtures/models/simple/geo.js';


function loadAndRenderCoreComponent(name, theModel) {
  const component = registry.getCoreComponent(name)
  const templateVars = component.processor(theModel)
  const template = engine.loadTemplate(component.templatePath)

  return template.renderToString(templateVars).trim()
}


describe('component', () => {

  describe('schema', () => {

    it('should render a DB schema definition', () => {

      const result = loadAndRenderCoreComponent('schema', model)

      expect(result).to.equal('CREATE SCHEMA IF NOT EXISTS geo;')
    })

  })
})
