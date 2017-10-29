
import { assert } from 'chai';
import Permission, {
  isPermission,
  findInvalidPermissionAttributes,
  findMissingPermissionAttributes,
  generatePermissionDescription,
  checkPermissionSimple,
} from './Permission';
import Entity from '../entity/Entity';
import { DataTypeString } from '../datatype/dataTypes';
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


  describe('permissions description', () => {

    it('should reject if non-Permission object is provided', () => {

      function fn() {
        generatePermissionDescription({foo: 'bar'})
      }

      assert.throws(fn, /generatePermissionDescription needs a valid permission object/);

    })


    it('should generate a description based on defined permissions', () => {

      const tests = [
        [
          new Permission().everyone(),
          '\n***\nPermissions:\n\n- everyone'
        ],
        [
          new Permission().authenticated(),
          '\n***\nPermissions:\n\n- authenticated'
        ],
        [
          new Permission().role('manager'),
          '\n***\nPermissions:\n\n- roles: manager'
        ],
        [
          new Permission().ownerAttribute('publisher'),
          '\n***\nPermissions:\n\n- ownerAttributes: publisher'
        ],
        [
          new Permission().lookup(Language, { createdBy: 'someAttribute' }),
          '\n***\nPermissions:\n\n- lookups: \n  - Entity: Language \n    - createdBy -> someAttribute'
        ],
        [
          new Permission().value('someAttribute', 123),
          '\n***\nPermissions:\n\n- values: \n  - someAttribute = 123'
        ],
        [
          new Permission()
            .role('manager')
            .role('admin')
            .ownerAttribute('publisher')
            .ownerAttribute('organizer')
            .lookup(Language, { createdBy: 'someAttribute' })
            .lookup(Language, { updatedAt: 'anotherAttribute' })
            .lookup(Language, { source: 'lorem', mainContinent: 'ipsum' })
            .value('someAttribute', 123)
            .value('anotherAttribute', 'hello'),
          '\n***\nPermissions:\n\n' +
            '- roles: manager, admin\n' +
            '- ownerAttributes: publisher, organizer\n' +
            '- lookups: \n' +
            '  - Entity: Language \n' +
            '    - createdBy -> someAttribute\n' +
            '  - Entity: Language \n' +
            '    - updatedAt -> anotherAttribute\n' +
            '  - Entity: Language \n' +
            '    - source -> lorem\n' +
            '    - mainContinent -> ipsum\n' +
            '- values: \n' +
            '  - someAttribute = 123\n' +
            '  - anotherAttribute = hello'
        ],
      ]


      tests.map(([ permission, resultText ]) => {
        assert.strictEqual(
          generatePermissionDescription(permission),
          resultText
        )
      })

    })


    it('should return no description if permission object is empty', () => {

      const permission = new Permission()

      const result = generatePermissionDescription(permission)

      assert.isFalse(result)
    })

  })


  describe('permissions check simple', () => {

    const userId = 123
    const userRoles = [ 'manager', 'reviewer' ]

    it('should reject if non-Permission object is provided', () => {

      function fn() {
        checkPermissionSimple({})
      }

      assert.throws(fn, /checkPermissionSimple needs a valid permission object/);

    })


    it('should reject if user roles are not provided as an array', () => {

      function fn() {
        checkPermissionSimple(new Permission(), null, {bad: 'roles'})
      }

      assert.throws(fn, /checkPermissionSimple needs a valid list of assigned user roles/);

    })


    it('should always give access if permission mode is `everyone`', () => {

      assert.isTrue(
        checkPermissionSimple(
          new Permission().everyone()
        )
      )
    })


    it('should give access to authenticated users if permission mode is `authenticated`', () => {

      assert.isTrue(
        checkPermissionSimple(
          new Permission().authenticated(),
          userId,
        )
      )
    })


    it('should reject access for anonymous users if permission mode is `authenticated`', () => {

      assert.isFalse(
        checkPermissionSimple(
          new Permission().authenticated(),
        )
      )
    })


    it('should give access to users with corresponding user roles on permission mode `role`', () => {

      assert.isTrue(
        checkPermissionSimple(
          new Permission().role('reviewer'),
          userId,
          userRoles,
        )
      )
    })


    it('should reject access for users with different roles on permission mode `role`', () => {

      assert.isFalse(
        checkPermissionSimple(
          new Permission().role('admin'),
          userId,
          userRoles,
        )
      )
    })

  })

})
