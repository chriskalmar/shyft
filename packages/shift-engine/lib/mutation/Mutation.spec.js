
import { assert } from 'chai';
import Mutation, {
  isMutation,
  MUTATION_TYPE_CREATE,
  MUTATION_TYPE_UPDATE,
  MUTATION_TYPE_DELETE,
} from './Mutation';

import {
  passOrThrow,
} from '../util';



describe('Mutation', () => {

  it('should have a name', () => {

    function fn() {
      new Mutation() // eslint-disable-line no-new
    }

    assert.throws(fn, /Missing mutation name/);

  })


  it('should have a type', () => {

    function fn() {
      new Mutation({ // eslint-disable-line no-new
        name: 'example'
      })
    }

    assert.throws(fn, /Missing type for mutation/);

  })


  it('should have a valid type', () => {

    function fn() {
      new Mutation({ // eslint-disable-line no-new
        name: 'example',
        type: 12346
      })
    }

    assert.throws(fn, /Unknown mutation type/);

  })


  it('should have a description', () => {

    function fn() {
      new Mutation({ // eslint-disable-line no-new
        name: 'example',
        type: MUTATION_TYPE_CREATE,
      })
    }

    assert.throws(fn, /Missing description for mutation/);

  })


  it('should have a list of attributes', () => {

    function fn() {
      new Mutation({ // eslint-disable-line no-new
        name: 'example',
        type: MUTATION_TYPE_CREATE,
        description: 'mutate the world',
      })
    }

    assert.throws(fn, /needs to have a list of attributes/);

  })


  it('should have a list of valid attribute names', () => {

    function fn() {
      new Mutation({ // eslint-disable-line no-new
        name: 'example',
        type: MUTATION_TYPE_CREATE,
        description: 'mutate the world',
        attributes: [
          'anything',
          { foo: 'bar' },
        ]
      })
    }

    assert.throws(fn, /needs to have a list of attribute names/);

  })


  it('should allow an empty attributes list for DELETE type mutations', () => {

    new Mutation({ // eslint-disable-line no-new
      name: 'example',
      type: MUTATION_TYPE_DELETE,
      description: 'mutate the world',
    })

  })


  it('should have a list of unique attribute names', () => {

    function fn() {
      new Mutation({ // eslint-disable-line no-new
        name: 'example',
        type: MUTATION_TYPE_CREATE,
        description: 'mutate the world',
        attributes: [
          'anything',
          'anything',
        ]
      })
    }

    assert.throws(fn, /needs to have a list of unique attribute names/);

  })


  it('should return it\'s name', () => {

    const mutation = new Mutation({
      name: 'example',
      type: MUTATION_TYPE_UPDATE,
      description: 'mutate the world',
      attributes: [ 'anything' ]
    })

    assert.strictEqual(mutation.name, 'example');
    assert.strictEqual(String(mutation), 'example');

  })



  it('should have a valid preProcessor function', () => {

    function fn() {
      new Mutation({ // eslint-disable-line no-new
        name: 'example',
        type: MUTATION_TYPE_CREATE,
        description: 'mutate the world',
        attributes: [
          'anything',
        ],
        preProcessor: 'not-a-function'
      })
    }

    assert.throws(fn, /needs to be a valid function/);

  })



  describe('isMutation', () => {

    const mutation = new Mutation({
      name: 'example',
      type: MUTATION_TYPE_UPDATE,
      description: 'mutate the world',
      attributes: [ 'anything' ],
      preProcessor() {}
    })

    it('should recognize objects of type Mutation', () => {

      function fn() {
        passOrThrow(
          isMutation(mutation),
          () => 'This error will never happen'
        )
      }

      assert.doesNotThrow(fn)

    })


    it('should recognize non-Mutation objects', () => {

      function fn() {
        passOrThrow(
          isMutation({}) ||
          isMutation(function test() {}) ||
          isMutation(assert),
          () => 'Not a Mutation object'
        )
      }

      assert.throws(fn, /Not a Mutation object/);

    })

  })

})
