
import util from '../../lib/util';
import { engine, registry } from 'shift-engine';

const domainModelsFilePath = __dirname + '/../fixtures/models/multiple/'

describe('util', () => {

  describe('type name', () => {


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

      registry.clearAllDomainModel()
      engine.loadDomainModelsFromFilePath(domainModelsFilePath)

      const entityModel = registry.getEntityModel('geo', 'country')
      const result = util.generateTypeName(entityModel)

      expect(result).to.equal('geoCountry');

    })

  })

})
