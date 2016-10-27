
'use strict';

const registry = require('../../').registry

const model = require('../fixtures/models/geo.js')


describe('registry', function() {


  describe('components', function() {


    it('should store core components', function() {

      registry.setCoreComponent('example', function() {}, './test/fixtures/templates/empty.marko')

      expect(registry.components.core).to.have.property('example')
    })



    it('should reject core components with missing or non-function processors', function() {

      function fn() {
        registry.setCoreComponent('example', null, './test/fixtures/templates/empty.marko')
      }

      expect(fn).to.throw(/requires processor to be a function/);
    })



    it('should reject core components where the template path does not exist', function() {

      function fn() {
        registry.setCoreComponent('example', function() {}, '/tmp/-no-file-here.marko')
      }

      expect(fn).to.throw(/could not find template/);
    })




    it('should return core components upon request', function() {

      let component = registry.getCoreComponent('example')

      expect(component.name).to.equal('example')
    })




    it('should throw an error if unknown core component is being fetched', function() {

      function fn() {
        registry.getCoreComponent('this-does-not-exist')
      }

      expect(fn).to.throw(/unknown core component/);
    })


  })




  describe('models', function() {


    it('should import entity models', function() {

      registry.importEntityModels(model)

      expect(registry.components.models).to.have.deep.property('geo.country')
    })



    it('should return entity models upon request', function() {

      let entityModel = registry.getEntityModel('geo', 'country')

      expect(entityModel.domain).to.equal('geo')
      expect(entityModel.name).to.equal('country')
    })





  })




})
