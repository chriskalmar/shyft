
import { assert } from 'chai';
import Index, {
  isIndex,
  INDEX_UNIQUE,
} from './Index';
import { passOrThrow } from '../util';



describe('Index', () => {

  it('should have a type', () => {

    function fn() {
      new Index() // eslint-disable-line no-new
    }

    assert.throws(fn, /Missing index type/);

  })


  it('should have a valid type', () => {

    function fn() {
      new Index({ // eslint-disable-line no-new
        type: 'something'
      })
    }

    assert.throws(fn, /Unknown index type/);

  })


  it('should have a list of attributes', () => {

    function fn1() {
      new Index({ // eslint-disable-line no-new
        type: INDEX_UNIQUE
      })
    }

    assert.throws(fn1, /needs to have a list of attributes/);

    function fn2() {
      new Index({ // eslint-disable-line no-new
        type: INDEX_UNIQUE,
        attributes: [ ]
      })
    }

    assert.throws(fn2, /needs to have a list of attributes/);

  })



  it('should accept attribute names only', () => {

    function fn1() {
      new Index({ // eslint-disable-line no-new
        type: INDEX_UNIQUE,
        attributes: [ null ]
      })
    }

    assert.throws(fn1, /needs to have a list of attribute names/);

    function fn2() {
      new Index({ // eslint-disable-line no-new
        type: INDEX_UNIQUE,
        attributes: [ 123 ]
      })
    }

    assert.throws(fn2, /needs to have a list of attribute names/);

  })


  it('should accept unique attribute names only', () => {

    function fn() {
      new Index({ // eslint-disable-line no-new
        type: INDEX_UNIQUE,
        attributes: [ 'a', 'b', 'a' ]
      })
    }

    assert.throws(fn, /needs to have a unique list of attribute names/);

  })


  it('should accept a correct definition', () => {

    const index1 = new Index({
      type: INDEX_UNIQUE,
      attributes: [ 'a' ]
    })

    const index2 = new Index({
      type: INDEX_UNIQUE,
      attributes: [ 'a', 'b', 'c' ]
    })

    assert.deepEqual(index1.attributes, [ 'a' ]);
    assert.deepEqual(index2.attributes, [ 'a', 'b', 'c' ]);

  })



  describe('isIndex', () => {


    it('should recognize objects of type Index', () => {

      const index = new Index({
        type: INDEX_UNIQUE,
        attributes: [ 'a' ]
      })

      function fn() {
        passOrThrow(
          isIndex(index),
          () => 'This error will never happen'
        )
      }

      assert.doesNotThrow(fn)

    })


    it('should recognize non-Index objects', () => {

      function fn() {
        passOrThrow(
          isIndex({}) ||
          isIndex(function test() {}) ||
          isIndex(assert),
          () => 'Not an Index object'
        )
      }


      assert.throws(fn, /Not an Index object/);

    })

  })


})
