
import { assert } from 'chai';
import Permission, {
  isPermission,
  findInvalidPermissionAttributes,
  findMissingPermissionAttributes,
} from './Permission';
import Entity from '../entity/Entity';
import { DataTypeString } from '../datatype/dataTypes';
import { passOrThrow } from '../util';
import { Language } from '../models/Language';


describe.only('Permission', () => {

  it('should create permission objects', () => {

    new Permission().everyone()
    new Permission().authenticated()
    new Permission().role('manager')
    new Permission().lookup(Language, {
      createdBy: 'someAttribute',
    })
    new Permission().value('someAttribute', 123)

    assert.strictEqual(String(new Permission()), 'Permission Object')
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


  describe('ownerAttribute permissions', () => {

    it('should reject if attribute name is missing', () => {

      function fn1() {
        new Permission()
          .ownerAttribute()
      }

      assert.throws(fn1, /expects an attribute name/);

    })

    it('should reject if duplicate attribute names are provided', () => {

      function fn1() {
        new Permission()
          .ownerAttribute('profile')
          .ownerAttribute('profile')
      }

      assert.throws(fn1, /Duplicate attribute name/);

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

    it('should reject if attribute name is missing', () => {

      function fn1() {
        new Permission()
          .value()
      }

      assert.throws(fn1, /expects an attribute name/);

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


  describe('permission attributes', () => {

    const City = new Entity({
      name: 'City',
      description: 'A city',
      attributes: {
        cityName: {
          type: DataTypeString,
          description: 'City name'
        },
      }
    })

    const User = new Entity({
      name: 'User',
      description: 'A user',
      isUserEntity: true,
      attributes: {
        loginName: {
          type: DataTypeString,
          description: 'Login name'
        },
        city: {
          type: City,
          description: 'User\'s city'
        }
      }
    })


    it('should reject if ownerAttribute is not a reference to the user entity', () => {

      function fn1() {
        const permission = new Permission()
          .ownerAttribute('any')

        findInvalidPermissionAttributes(permission, City)
      }

      function fn2() {
        const permission = new Permission()
          .ownerAttribute('cityName')

        findInvalidPermissionAttributes(permission, City)
      }

      function fn3() {
        const permission = new Permission()
          .ownerAttribute('city')

        findInvalidPermissionAttributes(permission, User)
      }

      assert.throws(fn1, /as it is not a reference to the User entity/);
      assert.throws(fn2, /as it is not a reference to the User entity/);
      assert.throws(fn3, /as it is not a reference to the User entity/);

    })


    it('should find missing permission attributes', () => {

      {
        const permission = new Permission()
          .ownerAttribute('wrong')

        const missing = findMissingPermissionAttributes(permission, City)

        assert.deepEqual(missing, 'wrong')
      }

      {
        const permission = new Permission()
          .lookup(User, {
            id: 'wrong'
          })

        const missing = findMissingPermissionAttributes(permission, City)

        assert.deepEqual(missing, 'User.wrong')
      }

      {
        const permission = new Permission()
          .lookup(User, {
            hello: 'city'
          })

        const missing = findMissingPermissionAttributes(permission, City)

        assert.deepEqual(missing, 'hello')
      }

      {
        const permission = new Permission()
          .value('wrong', 123)

        const missing = findMissingPermissionAttributes(permission, City)

        assert.deepEqual(missing, 'wrong')
      }

    })


    it('should accept correctly defined permission attributes', () => {

      const permission = new Permission()
        .ownerAttribute('id')
        .lookup(User, {
          id: 'city'
        })
        // https://en.wikipedia.org/wiki/Taumatawhakatangihangakoauauotamateaturipukakapikimaungahoronukupokaiwhenuakitanatahu
        .value('cityName', 'Taumatawhakatangihangakoauauotamateaturipukakapikimaungahoronukupokaiwhenuakitanatahu')

      const missing = findMissingPermissionAttributes(permission, City)

      assert.isFalse(missing)
    })


  })

})
