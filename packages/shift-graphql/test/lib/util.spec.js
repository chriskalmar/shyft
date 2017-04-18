
import util from '../../lib/util';


describe('util', () => {


  it('should generate an entity name from a model', () => {

    const result = util.generateEntityName({})

    expect(result).to.equal('tbd');

  })

})
