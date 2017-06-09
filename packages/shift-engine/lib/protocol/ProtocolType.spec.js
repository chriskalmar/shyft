
import { assert } from 'chai';
import ProtocolType, { isProtocolType } from './ProtocolType';


describe.only('ProtocolType', () => {

  const ProtocolTypeREST = new ProtocolType({
    name: 'ProtocolTypeREST',
    description: 'REST API protocol',
    isProtocolDataType(protocolDataType) {
      return (typeof protocolDataType  === 'object' && protocolDataType.name)
    }
  })


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


  it('should implement isProtocolDataType', () => {

    function fn() {
      new ProtocolType({ // eslint-disable-line no-new
        name: 'REST',
        description: 'REST protocol type'
      })
    }

    assert.throws(fn, /needs to implement isProtocolDataType/);

  })


  it('should recognize object of type ProtocolType', () => {

    const result = isProtocolType(ProtocolTypeREST)
    assert.isTrue(result)
  })


  it('should recognize non-ProtocolType objects', () => {

    const result1 = isProtocolType({})
    const result2 = isProtocolType(123)
    const result3 = isProtocolType('test')

    assert.isFalse(result1)
    assert.isFalse(result2)
    assert.isFalse(result3)
  })

})
