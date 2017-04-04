
import { engine, registry } from '../../';





function loadAndRenderCoreComponent(name, theModel) {
  const component = registry.getCoreComponent(name)
  return component.generateSql(theModel).trim()
}


describe.only('component', () => {

  engine.loadCoreDomainModels()
  engine.loadDomainModelsFromFilePath(__dirname + '/../fixtures/models/simple/')


  // const models = registry.getAllEntityModels()
  const schemaNames = engine.getSqlSchemaNames()
  // const result = engine.generateDatabaseSql(models)


  describe('schema', () => {

    it('should render a DB schema definition', () => {

      const result = loadAndRenderCoreComponent('schema', schemaNames)

      expect(result).to.have.string('CREATE SCHEMA IF NOT EXISTS shift__core;');
      expect(result).to.have.string('CREATE SCHEMA IF NOT EXISTS geo;');

    })

  })



})
