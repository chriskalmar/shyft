
import { assert } from 'chai';
import ObjectDataType, { isObjectDataType } from './ObjectDataType';

import {
  passOrThrow,
} from '../util';

import {
  DataTypeID,
  DataTypeString,
} from './dataTypes';


describe('ObjectDataType', () => {

  it('should have a name', () => {

    function fn() {
      new ObjectDataType() // eslint-disable-line no-new
    }

    assert.throws(fn, /Missing object data type name/);

  })


  it('should have a description', () => {

    function fn() {
      new ObjectDataType({ // eslint-disable-line no-new
        name: 'example'
      })
    }

    assert.throws(fn, /Missing description for object data type/);

  })


  it('should have a map of attributes', () => {

    function fn() {
      new ObjectDataType({ // eslint-disable-line no-new
        name: 'Example',
        description: 'Just some description',
      })
    }

    assert.throws(fn, /Missing attributes for object data type/);

  })


  it('should return it\'s name', () => {

    const objectDataType = new ObjectDataType({
      name: 'someObjectDataTypeName',
      description: 'Just some description',
      attributes: {},
    })

    assert.strictEqual(objectDataType.name, 'someObjectDataTypeName');
    assert.strictEqual(String(objectDataType), 'someObjectDataTypeName');

  })



  it('should accept only maps or functions as attributes definition', () => {

    function fn() {
      new ObjectDataType({ // eslint-disable-line no-new
        name: 'Example',
        description: 'Just some description',
        attributes: [ 2, 7, 13 ]
      })
    }

    assert.throws(fn, /attribute definition as a map or a function/);

  })


  it('should reject non-map results of attribute definition functions', () => {

    function fn() {
      const objectDataType = new ObjectDataType({ // eslint-disable-line no-new
        name: 'Example',
        description: 'Just some description',
        attributes: () => {
          return [ 2, 7, 13 ]
        }
      })

      objectDataType.getAttributes()
    }

    assert.throws(fn, /does not return a map/);

  })


  describe('should have a list of attributes', () => {

    it('as a map', () => {

      const objectDataType = new ObjectDataType({
        name: 'SomeName',
        description: 'Just some description',
        attributes: {
          id: {
            type: DataTypeID,
            description: 'ID of item',
            isPrimary: true,
          },
          name: {
            type: DataTypeString,
            description: 'Just another description'
          },
        }
      })

      const attributes = objectDataType.getAttributes()

      assert.strictEqual(attributes.id.type, DataTypeID);
      assert.strictEqual(attributes.name.type, DataTypeString);

    })


    it('as a function return a map', () => {

      const objectDataType = new ObjectDataType({
        name: 'SomeName',
        description: 'Just some description',
        attributes: () => {
          return {
            id: {
              type: DataTypeID,
              description: 'ID of item',
              isPrimary: true,
            },
            name: {
              type: DataTypeString,
              description: 'Just another description'
            },
          }
        }
      })

      const attributes = objectDataType.getAttributes()

      assert.strictEqual(attributes.id.type, DataTypeID);
      assert.strictEqual(attributes.name.type, DataTypeString);

    })

  })



  describe('isObjectDataType', () => {


    it('should recognize objects of type ObjectDataType', () => {

      const objectDataType = new ObjectDataType({
        name: 'someObjectDataTypeName',
        description: 'Just some description',
        attributes: {},
      })

      function fn() {
        passOrThrow(
          isObjectDataType(objectDataType),
          () => 'This error will never happen'
        )
      }

      assert.doesNotThrow(fn)

    })


    it('should recognize non-DataType objects', () => {

      function fn() {
        passOrThrow(
          isObjectDataType({}) ||
          isObjectDataType(function test() {}) ||
          isObjectDataType(assert),
          () => 'Not a DataType object'
        )
      }


      assert.throws(fn, /Not a DataType object/);

    })

  })


})
