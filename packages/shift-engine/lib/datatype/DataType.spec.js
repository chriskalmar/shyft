
import DataType, { isDataType } from './DataType';

import {
  passOrThrow,
} from '../util';

import {
  DataTypeBoolean,
  DataTypeString,
} from './dataTypes';


describe('DataType', () => {

  it('should have a name', () => {

    function fn() {
      new DataType() // eslint-disable-line no-new
    }

    expect(fn).toThrowErrorMatchingSnapshot();

  })


  it('should have a description', () => {

    function fn() {
      new DataType({ // eslint-disable-line no-new
        name: 'example'
      })
    }

    expect(fn).toThrowErrorMatchingSnapshot();

  })


  it('should provide a mock function', () => {

    function fn() {
      new DataType({ // eslint-disable-line no-new
        name: 'example',
        description: 'Just some description',
      })
    }

    expect(fn).toThrowErrorMatchingSnapshot();

  })


  it('should return it\'s name', () => {

    const dataType = new DataType({
      name: 'someDataTypeName',
      description: 'Just some description',
      mock () {},
    })

    expect(dataType.name).toBe('someDataTypeName');
    expect(String(dataType)).toBe('someDataTypeName');

  })


  it.skip('should have a unique name', () => {
  })


  describe('isDataType', () => {


    it('should recognize objects of type DataType', () => {

      function fn() {
        passOrThrow(
          isDataType(DataTypeBoolean) &&
          isDataType(DataTypeString),
          () => 'This error will never happen'
        )
      }

      expect(fn).not.toThrow()

    })


    it('should recognize non-DataType objects', () => {

      function fn() {
        passOrThrow(
          isDataType({}) ||
          isDataType(function test() {}) ||
          isDataType(Error),
          () => 'Not a DataType object'
        )
      }


      expect(fn).toThrowErrorMatchingSnapshot();

    })

  })


})
