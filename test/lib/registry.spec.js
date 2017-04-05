
import { registry } from '../../';

import emptyEntitiesModel from '../fixtures/models/empty/empty-entities.js';
import model from '../fixtures/models/simple/geo.js';
import StringDataType from '../../lib/datatypes/string.js';
import Component from '../../lib/component';



describe('registry', () => {


  describe('components', () => {


    it('should store core components', () => {

      class ExampleComponent extends Component {
        constructor () {
          super('example')
        }
      }

      registry.setCoreComponent( new ExampleComponent() )

      expect(registry.components.core).to.have.property('example')
    })



    it('should reject core components without a name', () => {

      class NoNameComponent extends Component {
        constructor () {
          super()
        }
      }

      function fn() {
        registry.setCoreComponent( new NoNameComponent() )
      }

      expect(fn).to.throw(/Missing component name/);

    })



    it('should reject core components if it does not extend the Component class', () => {

      class NonComponent {
      }

      function fn() {
        registry.setCoreComponent( new NonComponent() )
      }

      expect(fn).to.throw(/requires component to extend Component class/);
    })



    it('should return core components upon request', () => {

      const component = registry.getCoreComponent('example')

      expect(component.name).to.equal('example')
    })



    it('should throw an error if unknown core component is being fetched', () => {

      function fn() {
        registry.getCoreComponent('this-does-not-exist')
      }

      expect(fn).to.throw(/unknown core component/);
    })


  })



  describe('data types', () => {


    it('should register data types', () => {

      registry.addDataType('lorem-ipsum', new StringDataType() )

      expect(registry.components.dataTypes).to.have.property('lorem-ipsum')
    })



    it('should reject data types without a name', () => {

      function fn() {
        registry.addDataType(null, new StringDataType() )
      }

      expect(fn).to.throw(/requires a name/);
    })



    it('should throw an error if duplicate data types are being imported', () => {

      function fn() {
        registry.addDataType('another-lorem-ipsum', new StringDataType() )
        registry.addDataType('another-lorem-ipsum', new StringDataType() )
      }

      expect(fn).to.throw(/duplicate data type/);
    })



    it('should reject data types that are not an instance of class DataType', () => {

      function fn() {
        registry.addDataType('some-lorem-ipsum', { lorem: 'ipsum' } )
      }

      expect(fn).to.throw(/instance of DataType class/);
    })



    it('should return data types upon request', () => {

      const dataType = registry.getDataType('lorem-ipsum')

      expect(dataType.name).to.equal('string')
    })



    it('should throw an error if unknown data type is being fetched', () => {

      function fn() {
        registry.getDataType('this-does-not-exist')
      }

      expect(fn).to.throw(/unknown data type/);
    })


  })



  describe('domain models importer', () => {


    it('should import domain models', () => {

      registry.clearAllDomainModel()
      registry.importDomainModel(model)

      expect(registry.components.models).to.have.deep.property('@.geo.country')
    })



    it('should return entity models upon request', () => {

      const entityModel = registry.getEntityModel('geo', 'country')

      expect(entityModel.domain).to.equal('geo')
      expect(entityModel.name).to.equal('country')
    })


    it('should throw an error if duplicate models are being imported', () => {

      function fn() {
        registry.importDomainModel(model)
      }

      expect(fn).to.throw(/duplicate entity model: @::geo::country/);

    })


    it('should throw an error if basic schema validation fails', () => {

      function fn() {
        registry.importDomainModel(emptyEntitiesModel)
      }

      expect(fn).to.throw(/validation failed/);

    })


    it('should throw an error if an unknown entity model is being fetched', () => {

      function fn1() {
        registry.getEntityModel('this-does-not-exist')
      }

      function fn2() {
        registry.getEntityModel('geo', 'this-does-not-exist')
      }

      expect(fn1).to.throw(/unknown model domain: this-does-not-exist/);
      expect(fn2).to.throw(/unknown entity model: geo::this-does-not-exist/);
    })


  })



  it('should allow for clearing domain models', () => {

    registry.clearAllDomainModel()
    registry.importDomainModel(model)

    expect(registry.components.models).to.have.deep.property('@.geo.country')

    registry.clearAllDomainModel()
    registry.importDomainModel(model)

    expect(registry.components.models).to.have.deep.property('@.geo.country')

    registry.clearDomainModel('geo')
    registry.importDomainModel(model)

    expect(registry.components.models).to.have.deep.property('@.geo.country')
  })



})
