
import Entity from '../entity/Entity';
import Schema from './Schema';

import {
  DataTypeID,
  DataTypeString,
} from '../datatype/dataTypes';


describe('Schema', () => {

  const FirstEntity = new Entity({
    name: 'FirstEntity',
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

  const SecondEntity = new Entity({
    name: 'SecondEntity',
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
      first: {
        type: FirstEntity,
        description: 'Relationship with FirstEntity'
      }
    }
  })


  it('should accept a list of (empty) entities', () => {

    new Schema({}) // eslint-disable-line no-new

    new Schema({ // eslint-disable-line no-new
      entities: [ FirstEntity, SecondEntity ]
    })
  })


  it('should reject invalid entities', () => {

    const schema = new Schema({})

    function fn1() {
      schema.addEntity()
    }

    function fn2() {
      schema.addEntity({})
    }

    function fn3() {
      schema.addEntity('so-wrong')
    }

    expect(fn1).toThrow();
    expect(fn2).toThrow();
    expect(fn3).toThrow();

  })


  it('should accept new entities', () => {

    const schema = new Schema()

    schema.addEntity(FirstEntity)
    schema.addEntity(SecondEntity)

  })


  it('should reject an invalid entities list', () => {

    function fn1() {
      new Schema({ // eslint-disable-line no-new
        entities: []
      })
    }

    function fn2() {
      new Schema({ // eslint-disable-line no-new
        entities: {}
      })
    }

    function fn3() {
      new Schema({ // eslint-disable-line no-new
        entities: 'so-wrong'
      })
    }

    function fn4() {
      new Schema({ // eslint-disable-line no-new
        entities: [ 'so-wrong' ]
      })
    }

    expect(fn1).toThrow();
    expect(fn2).toThrow();
    expect(fn3).toThrow();
    expect(fn4).toThrow();

  })


  it('should throw on duplicate entities', () => {

    const schema = new Schema({})

    schema.addEntity(FirstEntity)
    schema.addEntity(SecondEntity)

    function fn() {
      schema.addEntity(FirstEntity)
    }

    expect(fn).toThrow();

  })


})
