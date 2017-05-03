
import { assert } from 'chai';
import DataType from './DataType';


describe('DataType', () => {

  it('should have a name', () => {

    function fn() {
      new DataType() // eslint-disable-line no-new
    }

    assert.throws(fn, /Missing data type name/);

  })


  it('should have a description', () => {

    function fn() {
      new DataType({ // eslint-disable-line no-new
        name: 'example'
      })
    }

    assert.throws(fn, /Missing description for data type/);

  })

  it('should return it\'s name', () => {

    const dataType = new DataType({
      name: 'someDataTypeName',
      description: 'Just some description'
    })

    assert.strictEqual(dataType.name, 'someDataTypeName');
    assert.strictEqual(String(dataType), 'someDataTypeName');

  })


  it.skip('should have a unique name', () => {
  })

})
