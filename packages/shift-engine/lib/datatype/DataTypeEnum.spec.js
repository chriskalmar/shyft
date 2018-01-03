
import DataTypeEnum, { isDataTypeEnum } from './DataTypeEnum';

import {
  passOrThrow,
} from '../util';



describe('DataTypeEnum', () => {

  it('should have a set of values', () => {

    let fn

    fn = () => {
      new DataTypeEnum() // eslint-disable-line no-new
    }

    expect(fn).toThrow();


    fn = () => {
      new DataTypeEnum({ // eslint-disable-line no-new
        values: [],
      })
    }

    expect(fn).toThrow();

  })


  it('should have a set of valid values', () => {

    let fn

    fn = () => {
      new DataTypeEnum({ // eslint-disable-line no-new
        values: [ '8' ],
      })
    }

    expect(fn).toThrow();

    fn = () => {
      new DataTypeEnum({ // eslint-disable-line no-new
        values: [ ' abc ' ],
        name: 'test'
      })
    }

    expect(fn).toThrow();

    fn = () => {
      new DataTypeEnum({ // eslint-disable-line no-new
        values: [ 'abc', 'def', 'hello-there' ],
        name: 'another'
      })
    }

    expect(fn).toThrow();

  })


  it('should have a name', () => {

    function fn() {
      new DataTypeEnum({ // eslint-disable-line no-new
        values: [ 'item' ],
      })
    }

    expect(fn).toThrow();

  })


  it('should return it\'s name', () => {

    const dataType = new DataTypeEnum({
      name: 'someDataTypeName',
      description: 'Just some description',
      values: [ 'item' ],
    })

    expect(dataType.name).toBe('someDataTypeName');
    expect(String(dataType)).toBe('someDataTypeName');

  })


  it('should have a fallback description', () => {

    const dataType = new DataTypeEnum({
      name: 'example',
      values: [ 'ACTION', 'COMEDY', 'DRAMA' ],
    })

    expect(dataType.description).toBe('Enumeration set: ACTION, COMEDY, DRAMA');
  })


  it('should have a generated mock function', () => {

    const values = [ 'ACTION', 'COMEDY', 'DRAMA' ]
    const dataType = new DataTypeEnum({
      name: 'example',
      values,
    })

    expect(values.includes(dataType.mock())).toBe(true)
  })


  describe('isDataTypeEnum', () => {


    it('should recognize objects of type DataTypeEnum', () => {

      const enum1 = new DataTypeEnum({
        name: 'enum1',
        values: [ 'ACTION', 'COMEDY', 'DRAMA' ],
      })

      const enum2 = new DataTypeEnum({
        name: 'enum2',
        values: [ 'APPLE', 'PEAR', 'CHERRY' ],
      })

      function fn() {
        passOrThrow(
          isDataTypeEnum(enum1) &&
          isDataTypeEnum(enum2),
          () => 'This error will never happen'
        )
      }

      expect(fn).not.toThrow()

    })


    it('should recognize non-DataTypeEnum objects', () => {

      function fn() {
        passOrThrow(
          isDataTypeEnum({}) ||
          isDataTypeEnum(function test() {}) ||
          isDataTypeEnum(Error),
          () => 'Not a DataTypeEnum object'
        )
      }


      expect(fn).toThrow();

    })

  })


})
