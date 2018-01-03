
import ListDataType, { isListDataType } from './ListDataType';

import {
  passOrThrow,
} from '../util';

import {
  DataTypeID,
  DataTypeString,
} from './dataTypes';

import {
  Language,
} from '../models/Language'


describe('ListDataType', () => {

  it('should have a name', () => {

    function fn() {
      new ListDataType() // eslint-disable-line no-new
    }

    expect(fn).toThrowErrorMatchingSnapshot();

  })


  it('should have a description', () => {

    function fn() {
      new ListDataType({ // eslint-disable-line no-new
        name: 'example'
      })
    }

    expect(fn).toThrowErrorMatchingSnapshot();

  })


  it('should have an item type', () => {

    function fn() {
      new ListDataType({ // eslint-disable-line no-new
        name: 'Example',
        description: 'Just some description',
      })
    }

    expect(fn).toThrowErrorMatchingSnapshot();

  })


  it('should return it\'s name', () => {

    const list = new ListDataType({
      name: 'someListDataTypeName',
      description: 'Just some description',
      itemType: DataTypeString,
    })

    expect(list.name).toBe('someListDataTypeName');
    expect(String(list)).toBe('someListDataTypeName');

  })



  it('should accept only valid item types', () => {

    new ListDataType({ // eslint-disable-line no-new
      name: 'Example',
      description: 'Just some description',
      itemType: DataTypeString,
    })

    new ListDataType({ // eslint-disable-line no-new
      name: 'Example',
      description: 'Just some description',
      itemType: Language,
    })

    new ListDataType({ // eslint-disable-line no-new
      name: 'Example',
      description: 'Just some description',
      itemType: new ListDataType({
        name: 'Another',
        description: 'Just some description',
        itemType: DataTypeString,
      })
    })

    new ListDataType({ // eslint-disable-line no-new
      name: 'Example',
      description: 'Just some description',
      itemType: () => DataTypeString,
    })


    function fn() {
      new ListDataType({ // eslint-disable-line no-new
        name: 'Example',
        description: 'Just some description',
        itemType: [ 2, 7, 13 ]
      })
    }

    expect(fn).toThrowErrorMatchingSnapshot();

  })



  it('should accept valid dynamic item types', () => {

    const list1 = new ListDataType({ // eslint-disable-line no-new
      name: 'Example',
      description: 'Just some description',
      itemType: () => DataTypeString,
    })

    const list2 = new ListDataType({ // eslint-disable-line no-new
      name: 'Example',
      description: 'Just some description',
      itemType: () => Language,
    })

    const list3 = new ListDataType({ // eslint-disable-line no-new
      name: 'Example',
      description: 'Just some description',
      itemType: () => {
        return new ListDataType({
          name: 'Another',
          description: 'Just some description',
          itemType: DataTypeString,
        })
      }
    })

    list1.getItemType()
    list2.getItemType()
    list3.getItemType()

  })


  it('should reject invalid dynamic item types', () => {

    function fn() {
      const list = new ListDataType({
        name: 'Example',
        description: 'Just some description',
        itemType: () => 'test',
      })

      list.getItemType()
    }

    expect(fn).toThrowErrorMatchingSnapshot();
  })


  it('should cache the dynamic item type after initial processing', () => {

    const list = new ListDataType({
      name: 'SomeName',
      description: 'Just some description',
      itemType: () => DataTypeString,
    })

    const itemType = list.getItemType()
    const itemTypeAgain = list.getItemType()

    expect(itemType).toEqual(itemTypeAgain)

  })


  describe('isListDataType', () => {


    it('should recognize objects of type ListDataType', () => {

      const list = new ListDataType({
        name: 'someListDataTypeName',
        description: 'Just some description',
        itemType: DataTypeID,
      })

      function fn() {
        passOrThrow(
          isListDataType(list),
          () => 'This error will never happen'
        )
      }

      expect(fn).not.toThrow()

    })


    it('should recognize non-ListDataType objects', () => {

      function fn() {
        passOrThrow(
          isListDataType({}) ||
          isListDataType(function test() {}) ||
          isListDataType(Error),
          () => 'Not a ListDataType object'
        )
      }


      expect(fn).toThrowErrorMatchingSnapshot();

    })

  })


})
