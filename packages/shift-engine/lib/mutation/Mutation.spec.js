
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



  it('should reject invalid fromState settings', () => {

    function fn() {
      new Mutation({ // eslint-disable-line no-new
        name: 'example',
        type: MUTATION_TYPE_UPDATE,
        description: 'mutate the world',
        attributes: [
          'anything',
        ],
        fromState: { foo: 'bar' }
      })
    }

    assert.throws(fn, /needs to be the name of a state or a list of state names as a precondition to the mutation/);

  })


  it('should reject invalid toState settings', () => {

    function fn() {
      new Mutation({ // eslint-disable-line no-new
        name: 'example',
        type: MUTATION_TYPE_UPDATE,
        description: 'mutate the world',
        attributes: [
          'anything',
        ],
        toState: 123
      })
    }

    assert.throws(fn, /needs to be the name of a state or a list of state names the mutation can transition to/);

  })


  it('should prevent fromState settings for create type mutations', () => {

    function fn() {
      new Mutation({ // eslint-disable-line no-new
        name: 'example',
        type: MUTATION_TYPE_CREATE,
        description: 'mutate the world',
        attributes: [
          'anything',
        ],
        fromState: 'open'
      })
    }

    assert.throws(fn, /cannot define fromState as it is a 'create' type mutation/);

  })


  it('should prevent toState settings for delete type mutations', () => {

    function fn() {
      new Mutation({ // eslint-disable-line no-new
        name: 'example',
        type: MUTATION_TYPE_DELETE,
        description: 'mutate the world',
        attributes: [
          'anything',
        ],
        toState: 'closed'
      })
    }

    assert.throws(fn, /cannot define toState as it is a 'delete' type mutation/);

  })


  it('should reject fromState without toState on update type mutations', () => {

    function fn() {
      new Mutation({ // eslint-disable-line no-new
        name: 'example',
        type: MUTATION_TYPE_UPDATE,
        description: 'mutate the world',
        attributes: [
          'anything',
        ],
        fromState: 'open'
      })
    }

    assert.throws(fn, /fromState defined but misses a toState definition/);

  })


  it('should reject toState without fromState on update type mutations', () => {

    function fn() {
      new Mutation({ // eslint-disable-line no-new
        name: 'example',
        type: MUTATION_TYPE_UPDATE,
        description: 'mutate the world',
        attributes: [
          'anything',
        ],
        toState: 'close'
      })
    }

    assert.throws(fn, /toState defined but misses a fromState definition/);

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
