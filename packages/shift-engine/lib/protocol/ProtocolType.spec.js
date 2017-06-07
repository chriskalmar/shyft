
import { assert } from 'chai';
import ProtocolType from './ProtocolType';


describe.only('ProtocolType', () => {



  it('should reject invalid protocol type definitions', () => {

    function fn1() {
      new ProtocolType({}) // eslint-disable-line no-new
    }

    function fn2() {
      new ProtocolType({ // eslint-disable-line no-new
        name: 'REST',
      })
    }

    assert.throws(fn1, /Missing protocol type name/);
    assert.throws(fn2, /Missing description/);

  })

})
