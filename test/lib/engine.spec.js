
'use strict';

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


  describe('should render a complete model into SQL code', () => {

    const sqlResult = fs.readFileSync('./test/fixtures/renders/full.sql').toString()

    it('via callback', () => {

      engine.generateDatabaseSql([model], (err, result) => {
        expect(result.trim()).to.equal(sqlResult)
      })

    })



    it('via return', () => {

      const result = engine.generateDatabaseSql([model]).trim()

      expect(result).to.equal(sqlResult)
    })

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

    expect(registry.components.models).to.have.deep.property('geo.country')
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

    expect(registry.components.models).to.have.deep.property('geo.country')
  })


})
