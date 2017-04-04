
import { registry } from '../../';

// import model from '../fixtures/models/simple/geo.js';


function loadAndRenderCoreComponent(name, theModel) {
  const component = registry.getCoreComponent(name)
  return component.generateSql(theModel).trim()
}


describe.only('component', () => {

  describe('schema', () => {

    it('should render a DB schema definition', () => {

      const schemaNames = [ 'geo' ]
      const result = loadAndRenderCoreComponent('schema', schemaNames)

      expect(result).to.equal('CREATE SCHEMA IF NOT EXISTS geo;')
    })

  })
})
