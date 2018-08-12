import Entity from '../entity/Entity';
import Schema from './Schema';

import { DataTypeID, DataTypeString } from '../datatype/dataTypes';

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
        description: 'Just another description',
      },
    },
  });

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
        description: 'Just another description',
      },
      first: {
        type: FirstEntity,
        description: 'Relationship with FirstEntity',
      },
    },
  });

  it('should accept a list of (empty) entities', () => {
    // eslint-disable-next-line no-new
    new Schema({});

    // eslint-disable-next-line no-new
    new Schema({
      entities: [ FirstEntity, SecondEntity ],
    });
  });

  it('should reject invalid entities', () => {
    const schema = new Schema({});

    function fn1() {
      schema.addEntity();
    }

    function fn2() {
      schema.addEntity({});
    }

    function fn3() {
      schema.addEntity('so-wrong');
    }

    expect(fn1).toThrowErrorMatchingSnapshot();
    expect(fn2).toThrowErrorMatchingSnapshot();
    expect(fn3).toThrowErrorMatchingSnapshot();
  });

  it('should accept new entities', () => {
    const schema = new Schema();

    schema.addEntity(FirstEntity);
    schema.addEntity(SecondEntity);
  });

  it('should reject an invalid entities list', () => {
    function fn1() {
      // eslint-disable-next-line no-new
      new Schema({
        entities: [],
      });
    }

    function fn2() {
      // eslint-disable-next-line no-new
      new Schema({
        entities: {},
      });
    }

    function fn3() {
      // eslint-disable-next-line no-new
      new Schema({
        entities: 'so-wrong',
      });
    }

    function fn4() {
      // eslint-disable-next-line no-new
      new Schema({
        entities: [ 'so-wrong' ],
      });
    }

    expect(fn1).toThrowErrorMatchingSnapshot();
    expect(fn2).toThrowErrorMatchingSnapshot();
    expect(fn3).toThrowErrorMatchingSnapshot();
    expect(fn4).toThrowErrorMatchingSnapshot();
  });

  it('should throw on duplicate entities', () => {
    const schema = new Schema({});

    schema.addEntity(FirstEntity);
    schema.addEntity(SecondEntity);

    function fn() {
      schema.addEntity(FirstEntity);
    }

    expect(fn).toThrowErrorMatchingSnapshot();
  });
});
