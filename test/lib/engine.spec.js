
import { engine, registry } from '../../';
import fs from 'fs';

import model from '../fixtures/models/simple/geo.js';

const domainModelsFilePath = __dirname + '/../fixtures/models/multiple/'

const domainModel = {
  filePath: 'geo.js',
  model
}
const domainModels = [ domainModel ]



describe('engine', () => {

  it('should render a complete model into SQL code', () => {

    // reset registry
    registry.clearAllDomainModel()

    // engine.loadCoreDomainModels()
    engine.loadDomainModelsFromFilePath(__dirname + '/../fixtures/models/simple/')

    const singleModel = registry.getEntityModel('geo', 'country')

    const sqlResult = fs.readFileSync('./test/fixtures/renders/full.sql').toString()
    const result = engine.generateDatabaseSql([ singleModel ])

    expect(result).to.equal(sqlResult)

  })



  it('reject code generation if "models" is not an array', () => {

    function fn() {
      engine.generateDatabaseSql(model)
    }

    expect(fn).to.throw(/models needs to be an array/);

  })



  it('should load domain models', () => {

    registry.clearAllDomainModel()
    engine.loadDomainModels(domainModels)

    expect(registry.components.models).to.have.deep.property('@.geo.country')
  })



  it('throw an error if domain models are provided in wrong format', () => {

    function fn1() {
      engine.loadDomainModels()
    }

    function fn2() {
      engine.loadDomainModels([{}])
    }

    expect(fn1).to.throw(/domainModels needs to be an array/);
    expect(fn2).to.throw(/each domainModel needs to have a filePath and a model property/);

  })



  it('should load domain models from a given path', () => {

    registry.clearAllDomainModel()
    engine.loadDomainModelsFromFilePath(domainModelsFilePath)

    expect(registry.components.models).to.have.deep.property('@.geo.country')
  })



  describe('should generate unique index names', () => {

    it('for no attributes', () => {

      const indexName = engine.generateIndexName('user')

      expect(indexName).to.equal('user__idx')
    })


    it('for single attributes', () => {

      const indexName = engine.generateIndexName('user', ['firstname'])

      expect(indexName).to.equal('user_firstname_idx')
    })


    it('for multiple attributes', () => {

      const indexName = engine.generateIndexName('user', ['firstname', 'lastname', 'email'])

      expect(indexName).to.equal('user_firstname_lastname_email_idx')
    })


    it('for too many attributes', () => {

      const indexName = engine.generateIndexName('user', ['firstname', 'lastname', 'email', 'birthday', 'city', 'color', 'location', 'about'])

      expect(indexName).to.equal('user_firstname_lastname_email_birthday_city_colo_2090776b35_idx')
    })

  })


})
