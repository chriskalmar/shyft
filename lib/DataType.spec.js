
import { expect } from 'chai';
import DataType from './DataType';


describe('DataType', () => {

  it('should have a name', () => {

    function fn() {
      new DataType() // eslint-disable-line no-new
    }

    expect(fn).to.throw(/Missing data type name/);

  })


  it('should have a description', () => {

    function fn() {
      new DataType({ // eslint-disable-line no-new
        name: 'example'
      })
    }

    expect(fn).to.throw(/Missing description/);

  })

  it('should return it\'s name', () => {

    const dataType = new DataType({
      name: 'someDataTypeName',
      description: 'Just some description'
    })

    expect(dataType.name).to.equal('someDataTypeName');
    expect(String(dataType)).to.equal('someDataTypeName');

  })


  it.skip('should have a unique name', () => {
  })

})
