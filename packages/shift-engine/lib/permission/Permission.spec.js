
import { assert } from 'chai';
import Permission, {
  isPermission,
} from './Permission';
import { passOrThrow } from '../util';
import { Language } from '../models/Language';


describe('Permission', () => {

  it('should create permission objects', () => {

    new Permission().everyone()
    new Permission().authenticated()
    new Permission().role('manager')
    new Permission().lookup(Language, {
      createdBy: 'someAttribute',
    })
    new Permission().value('someAttribute', 123)

  })


  it('should be combinable', () => {

    const permission = new Permission()
      .role('manager')
      .lookup(Language, {
        createdBy: 'someAttribute',
      })
      .value('someAttribute', 123)
      .role('admin')
      .lookup(Language, {
        country: 'any',
      })
      .value('someAttribute', 987)


    assert.deepEqual(permission.roles, [ 'manager', 'admin' ]);
    assert.deepEqual(permission.lookups, [
      {
        entity: Language,
        lookupMap: {
          createdBy: 'someAttribute',
        }
      },
      {
        entity: Language,
        lookupMap: {
          country: 'any',
        }
      }
    ]);
    assert.deepEqual(permission.values, [
      {
        attributeName: 'someAttribute',
        value: 123
      },
      {
        attributeName: 'someAttribute',
        value: 987
      }
    ]);

  })


  it('should reject incompatible permission types', () => {

    function fn1() {
      new Permission()
        .role('manager')
        .everyone()
    }

    assert.throws(fn1, /'everyone' is incompatible with other types/);


    function fn2() {
      new Permission()
        .value('someAttribute', 987)
        .authenticated()
    }

    assert.throws(fn2, /'authenticated' is incompatible with other types/);


    function fn3() {
      new Permission()
        .everyone()
        .authenticated()
    }

    assert.throws(fn3, /'authenticated' is incompatible with other types/);


  })



  describe('role permissions', () => {

    it('should reject if role name is missing', () => {

      function fn1() {
        new Permission()
          .role()
      }

      assert.throws(fn1, /'role' expects an role name/);

    })


    it('should reject if duplicate roles are provided', () => {

      function fn1() {
        new Permission()
          .role('manager')
          .role('manager')
      }

      assert.throws(fn1, /Duplicate role/);

    })

  })


  describe('lookup permissions', () => {

    it('should reject if entity is missing', () => {

      function fn1() {
        new Permission()
          .lookup()
      }

      assert.throws(fn1, /expects an entity/);

    })


    it('should reject if lookupMap is missing', () => {

      function fn1() {
        new Permission()
          .lookup(Language)
      }

      assert.throws(fn1, /expects a lookupMap/);

    })

  })


  describe('value permissions', () => {

    it('should reject if attributeName is missing', () => {

      function fn1() {
        new Permission()
          .value()
      }

      assert.throws(fn1, /expects an attributeName/);

    })


    it('should reject if value is missing', () => {

      function fn1() {
        new Permission()
          .value('someAttribute')
      }

      assert.throws(fn1, /expects a value/);

    })

  })



  describe('isPermission', () => {


    it('should recognize objects of type Permission', () => {

      const permission = new Permission()

      function fn() {
        passOrThrow(
          isPermission(permission),
          () => 'This error will never happen'
        )
      }

      assert.doesNotThrow(fn)

    })


    it('should recognize non-Permission objects', () => {

      function fn() {
        passOrThrow(
          isPermission({}) ||
          isPermission(function test() {}) ||
          isPermission(assert),
          () => 'Not a Permission object'
        )
      }


      assert.throws(fn, /Not a Permission object/);

    })

  })


})
