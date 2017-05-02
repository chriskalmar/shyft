
import { expect } from 'chai';
import Entity from './Entity';
import {
  DataTypeID,
  DataTypeString,
} from './datatypes';


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
        name: 'Example'
      })
    }

    expect(fn).to.throw(/Missing description for entity/);

  })

  it('should return it\'s name', () => {

    const entity = new Entity({
      name: 'SomeEntityName',
      description: 'Just some description',
      attributes: () => {}
    })

    expect(entity.name).to.equal('SomeEntityName');
    expect(String(entity)).to.equal('SomeEntityName');

  })


  it.skip('should have a unique name-domain-provider combination', () => {
  })


  describe('should have a list of attributes', () => {

    it('as a map', () => {

      const entity = new Entity({
        name: 'SomeEntityName',
        description: 'Just some description',
        attributes: {
          id: {
            type: DataTypeID,
            description: 'ID of item',
          },
          name: {
            type: DataTypeString,
            description: 'Just another description'
          },
        }
      })

      const attributes = entity.getAttributes()

      expect(attributes.id.type).to.equal(DataTypeID);
      expect(attributes.name.type).to.equal(DataTypeString);

    })


    it('as a function return a map', () => {

      const entity = new Entity({
        name: 'SomeEntityName',
        description: 'Just some description',
        attributes: () => {
          return {
            id: {
              type: DataTypeID,
              description: 'ID of item',
            },
            name: {
              type: DataTypeString,
              description: 'Just another description'
            },
          }
        }
      })

      const attributes = entity.getAttributes()

      expect(attributes.id.type).to.equal(DataTypeID);
      expect(attributes.name.type).to.equal(DataTypeString);

    })

  })


})
