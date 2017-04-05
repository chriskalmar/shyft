
import { engine, registry } from '../../';


function loadAndRenderCoreComponent(name, theModel) {
  const component = registry.getCoreComponent(name)
  return component.generateSql(theModel).trim()
}


describe('component', () => {

  engine.loadCoreDomainModels()
  engine.loadDomainModelsFromFilePath(__dirname + '/../fixtures/models/simple/')

  describe('schema', () => {

    it('should render a DB schema definition', () => {

      const schemaNames = engine.getSqlSchemaNames()
      const result = loadAndRenderCoreComponent('schema', schemaNames)

      expect(result).to.have.string('CREATE SCHEMA IF NOT EXISTS shift__core;');
      expect(result).to.have.string('CREATE SCHEMA IF NOT EXISTS geo;');

    })

  })


  describe('table', () => {

    it('should render a DB table definition', () => {

      const model = registry.getEntityModel('geo', 'country')

      const result = loadAndRenderCoreComponent('table', model)

      // todo: add more detailed checks
      expect(result).to.have.string('create table "geo"."country"');
      expect(result).to.have.string('comment on column "geo"."country"."iso_code"');
      expect(result).to.have.string('alter table "geo"."country" add constraint "country_name_key" unique ("name")');

    })

  })

})
