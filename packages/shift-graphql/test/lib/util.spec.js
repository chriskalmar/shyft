
import util from '../../lib/util';
import { engine, registry } from 'shift-engine';

const domainModelsFilePath = __dirname + '/../fixtures/models/multiple/'

describe('util', () => {

  describe('type name', () => {

    registry.clearAllDomainModel()
    engine.loadCoreDomainModels()
    engine.loadDomainModelsFromFilePath(domainModelsFilePath)

    const entityModel = registry.getEntityModel('geo', 'country')


    it('should fail on missing or incomplete models', () => {

      function fn1() {
        util.generateTypeName()
      }

      function fn2() {
        util.generateTypeName({})
      }

      expect(fn1).to.throw(/entityModel needs to be defined/);
      expect(fn2).to.throw(/entityModel needs a name and a domain/);

    })


    it('should generate a type name from a model', () => {

      const result1 = util.generateTypeName(entityModel)

      expect(result1).to.equal('geoCountry');


      const coreEntityModel = registry.getProviderEntityModel('shift', 'core', 'language')
      const result2 = util.generateTypeName(coreEntityModel)

      expect(result2).to.equal('shiftCoreLanguage');

    })


    it('should generate upper case type names from a model', () => {

      const result1 = util.generateTypeNameUpperCase(entityModel)

      expect(result1).to.equal('GeoCountry');


      const coreEntityModel = registry.getProviderEntityModel('shift', 'core', 'language')
      const result2 = util.generateTypeNameUpperCase(coreEntityModel)

      expect(result2).to.equal('ShiftCoreLanguage');

    })



    it('should generate pluralized type names from a model', () => {

      const result1 = util.generateTypeNamePlural(entityModel)

      expect(result1).to.equal('geoCountries');


      const coreEntityModel = registry.getProviderEntityModel('shift', 'core', 'language')
      const result2 = util.generateTypeNamePlural(coreEntityModel)

      expect(result2).to.equal('shiftCoreLanguages');

    })


    it('should generate upper case and pluralized type names from a model', () => {

      const result1 = util.generateTypeNamePluralUpperCase(entityModel)

      expect(result1).to.equal('GeoCountries');


      const coreEntityModel = registry.getProviderEntityModel('shift', 'core', 'language')
      const result2 = util.generateTypeNamePluralUpperCase(coreEntityModel)

      expect(result2).to.equal('ShiftCoreLanguages');

    })

  })

})
