
import util from '../../lib/util';
import { engine, registry } from 'shift-engine';

const domainModelsFilePath = __dirname + '/../fixtures/models/multiple/'

describe('util', () => {

  it('should generate a type name from a model', () => {

    registry.clearAllDomainModel()
    engine.loadDomainModelsFromFilePath(domainModelsFilePath)

    const entityModel = registry.getEntityModel('geo', 'country')
    const result = util.generateTypeName(entityModel)

    expect(result).to.equal('geoCountry');

  })

})
