
import { expect } from 'chai';
import Entity from './Entity';


describe('Entity', () => {

  it('should have a name', () => {

    function fn() {
      new Entity() // eslint-disable-line no-new
    }

    expect(fn).to.throw(/Missing entity name/);

  })


  it('should have a description', () => {

    function fn() {
      new Entity({ // eslint-disable-line no-new
        name: 'example'
      })
    }

    expect(fn).to.throw(/Missing description for entity/);

  })

  it('should return it\'s name', () => {

    const entity = new Entity({
      name: 'someEntityName',
      description: 'Just some description'
    })

    expect(entity.name).to.equal('someEntityName');
    expect(String(entity)).to.equal('someEntityName');

  })


  it.skip('should have a unique name-domain-provider combination', () => {
  })

})
