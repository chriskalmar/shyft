
import Permission, {
  isPermission,
  isPermissionsArray,
  findInvalidPermissionAttributes,
  findMissingPermissionAttributes,
  generatePermissionDescription,
  checkPermissionSimple,
  buildUserAttributesPermissionFilter,
  buildStatesPermissionFilter,
  buildPermissionFilterSingle,
  buildPermissionFilter,
  processEntityPermissions,
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

    expect(String(new Permission())).toBe('Permission Object')
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


    expect(permission.roles).toEqual([ 'manager', 'admin' ]);
    expect(permission.lookups).toEqual([
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
    expect(permission.values).toEqual([
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

    expect(fn1).toThrowErrorMatchingSnapshot();


    function fn2() {
      new Permission()
        .userAttribute('author')
        .everyone()
    }

    expect(fn2).toThrowErrorMatchingSnapshot();


    function fn3() {
      new Permission()
        .everyone()
        .authenticated()
    }

    expect(fn3).toThrowErrorMatchingSnapshot();


  })



  describe('role permissions', () => {

    it('should reject if role name is missing', () => {

      function fn1() {
        new Permission()
          .role()
      }

      expect(fn1).toThrowErrorMatchingSnapshot();

    })


    it('should reject if duplicate roles are provided', () => {

      function fn1() {
        new Permission()
          .role('manager')
          .role('manager')
      }

      expect(fn1).toThrowErrorMatchingSnapshot();

    })

  })


  describe('userAttribute permissions', () => {

    it('should reject if attribute name is missing', () => {

      function fn1() {
        new Permission()
          .userAttribute()
      }

      expect(fn1).toThrowErrorMatchingSnapshot();

    })

    it('should reject if duplicate attribute names are provided', () => {

      function fn1() {
        new Permission()
          .userAttribute('profile')
          .userAttribute('profile')
      }

      expect(fn1).toThrowErrorMatchingSnapshot();

    })

  })


  describe('lookup permissions', () => {

    it('should reject if entity is missing', () => {

      function fn1() {
        new Permission()
          .lookup()
      }

      expect(fn1).toThrowErrorMatchingSnapshot();

    })


    it('should reject if lookupMap is missing', () => {

      function fn1() {
        new Permission()
          .lookup(Language)
      }

      expect(fn1).toThrowErrorMatchingSnapshot();

    })

  })


  describe('value permissions', () => {

    it('should reject if attribute name is missing', () => {

      function fn1() {
        new Permission()
          .value()
      }

      expect(fn1).toThrowErrorMatchingSnapshot();

    })


    it('should reject if value is missing', () => {

      function fn1() {
        new Permission()
          .value('someAttribute')
      }

      expect(fn1).toThrowErrorMatchingSnapshot();

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

      expect(fn).not.toThrow()

    })


    it('should recognize non-Permission objects', () => {

      function fn() {
        passOrThrow(
          isPermission({}) ||
          isPermission(function test() {}) ||
          isPermission(Error),
          () => 'Not a Permission object'
        )
      }


      expect(fn).toThrowErrorMatchingSnapshot();

    })

  })

  describe('isPermissionsArray', () => {


    it('should recognize a list of objects of type Permission', () => {

      const permission = new Permission()

      function fn() {
        passOrThrow(
          isPermissionsArray([permission]) &&
          isPermissionsArray([permission, permission]) &&
          isPermissionsArray([permission, permission, permission]),
          () => 'This error will never happen'
        )
      }

      expect(fn).not.toThrow()

    })


    it('should recognize non-Permission objects', () => {

      const permission = new Permission()

      function fn() {
        passOrThrow(
          isPermissionsArray() ||
          isPermissionsArray(null) ||
          isPermissionsArray([]) ||
          isPermissionsArray({}) ||
          isPermissionsArray(function test() {}) ||
          isPermissionsArray(Error) ||
          isPermissionsArray([{}]) ||
          isPermissionsArray([function test() {}]) ||
          isPermissionsArray([Error]) ||
          isPermissionsArray([permission, null]) ||
          isPermissionsArray([permission, {}, permission]),
          () => 'Not a Permissions array'
        )
      }

      expect(fn).toThrowErrorMatchingSnapshot();

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


    it('should reject if userAttribute is not a reference to the user entity', () => {

      function fn1() {
        const permission = new Permission()
          .userAttribute('any')

        findInvalidPermissionAttributes(permission, City)
      }

      function fn2() {
        const permission = new Permission()
          .userAttribute('cityName')

        findInvalidPermissionAttributes(permission, City)
      }

      function fn3() {
        const permission = new Permission()
          .userAttribute('city')

        findInvalidPermissionAttributes(permission, User)
      }

      expect(fn1).toThrowErrorMatchingSnapshot();
      expect(fn2).toThrowErrorMatchingSnapshot();
      expect(fn3).toThrowErrorMatchingSnapshot();

    })


    it('should find missing permission attributes', () => {

      {
        const permission = new Permission()
          .userAttribute('wrong')

        const missing = findMissingPermissionAttributes(permission, City)

        expect(missing).toEqual('wrong')
      }

      {
        const permission = new Permission()
          .lookup(User, {
            id: 'wrong'
          })

        const missing = findMissingPermissionAttributes(permission, City)

        expect(missing).toEqual('User.wrong')
      }

      {
        const permission = new Permission()
          .lookup(User, {
            hello: 'city'
          })

        const missing = findMissingPermissionAttributes(permission, City)

        expect(missing).toEqual('hello')
      }

      {
        const permission = new Permission()
          .value('wrong', 123)

        const missing = findMissingPermissionAttributes(permission, City)

        expect(missing).toEqual('wrong')
      }

    })


    it('should accept correctly defined permission attributes', () => {

      const permission = new Permission()
        .userAttribute('id')
        .lookup(User, {
          id: 'city'
        })
        // https://en.wikipedia.org/wiki/Taumatawhakatangihangakoauauotamateaturipukakapikimaungahoronukupokaiwhenuakitanatahu
        .value('cityName', 'Taumatawhakatangihangakoauauotamateaturipukakapikimaungahoronukupokaiwhenuakitanatahu')

      const missing = findMissingPermissionAttributes(permission, City)

      expect(missing).toBe(false)
    })


  })


  describe('permissions description', () => {

    it('should reject if non-Permission object is provided', () => {

      function fn() {
        generatePermissionDescription({foo: 'bar'})
      }

      expect(fn).toThrowErrorMatchingSnapshot();

    })


    it('should generate a description based on defined permissions', () => {

      const tests = [
        [
          new Permission().everyone(),
          'everyone'
        ],
        [
          new Permission().authenticated(),
          'authenticated'
        ],
        [
          new Permission().role('manager'),
          'role manager'
        ],
        [
          new Permission().userAttribute('publisher'),
          'userAttributes publisher'
        ],
        [
          new Permission().lookup(Language, { createdBy: 'someAttribute' }),
          'lookup Language someAttribute'
        ],
        [
          new Permission().value('someAttribute', 123),
          'value someAttribute'
        ],
        [
          new Permission()
            .role('manager')
            .role('admin')
            .userAttribute('publisher')
            .userAttribute('organizer')
            .lookup(Language, { createdBy: 'someAttribute' })
            .lookup(Language, { updatedAt: 'anotherAttribute' })
            .lookup(Language, { source: 'lorem', mainContinent: 'ipsum' })
            .value('someAttribute', 123)
            .value('anotherAttribute', 'hello'),
          'mixed 1'
        ],
      ]

      tests.map(([ permission, testName ]) => {
        expect(generatePermissionDescription(permission)).toMatchSnapshot(testName)
      })

    })


    it('should return no description if permission object is empty', () => {

      const permission = new Permission()

      const result = generatePermissionDescription(permission)

      expect(result).toBe(false)
    })

  })


  describe('permissions check simple', () => {

    const userId = 123
    const userRoles = [ 'manager', 'reviewer' ]

    it('should reject if non-Permission object is provided', () => {

      function fn() {
        checkPermissionSimple({})
      }

      expect(fn).toThrowErrorMatchingSnapshot();

    })


    it('should reject if user roles are not provided as an array', () => {

      function fn() {
        checkPermissionSimple(new Permission(), null, {bad: 'roles'})
      }

      expect(fn).toThrowErrorMatchingSnapshot();

    })


    it('should always give access if permission mode is `everyone`', () => {

      expect(checkPermissionSimple(
        new Permission().everyone()
      )).toBe(true)
    })


    it('should give access to authenticated users if permission mode is `authenticated`', () => {

      expect(checkPermissionSimple(
        new Permission().authenticated(),
        userId,
      )).toBe(true)
    })


    it('should reject access for anonymous users if permission mode is `authenticated`', () => {

      expect(checkPermissionSimple(
        new Permission().authenticated(),
      )).toBe(false)
    })


    it('should give access to users with corresponding user roles on permission mode `role`', () => {

      expect(checkPermissionSimple(
        new Permission().role('reviewer'),
        userId,
        userRoles,
      )).toBe(true)
    })


    it('should reject access for users with different roles on permission mode `role`', () => {

      expect(checkPermissionSimple(
        new Permission().role('admin'),
        userId,
        userRoles,
      )).toBe(false)

      expect(checkPermissionSimple(
        new Permission().authenticated().role('admin'),
        userId,
        userRoles,
      )).toBe(false)
    })


    it('should default to give access if neither `everyone`, `authenticated` or `role` is defined', () => {

      expect(checkPermissionSimple(
        new Permission(),
        userId,
        userRoles,
      )).toBe(true)
    })

  })


  describe('build permission filter', () => {

    const userId = 123
    const userRoles = ['manager', 'reviewer']

    const someEntity = new Entity({
      name: 'SomeEntityName',
      description: 'Just some description',
      attributes: {
        someAttribute: {
          type: DataTypeString,
          description: 'Just some description',
        },
      },
      states: {
        open: 10,
        closed: 20,
        inTransfer: 40,
        onHold: 50,
      },
    })


    describe('userAttributes', () => {

      it('should reject if userId is not provided', () => {

        function fn() {
          const permission = new Permission()
            .userAttribute('author')
          buildUserAttributesPermissionFilter(permission)
        }

        expect(fn).toThrowErrorMatchingSnapshot();
      })


      it('should return undefined filters if permission type is not used', () => {

        const permission = new Permission()
          .state('completed')

        const filter = buildUserAttributesPermissionFilter(permission, userId)

        expect(filter).toBeUndefined()
      })


      it('should generate filters for single entries', () => {

        const permission = new Permission()
          .userAttribute('author')

        const filter = buildUserAttributesPermissionFilter(permission, userId)

        expect(filter).toMatchSnapshot();
      })


      it('should generate filters for multiple entries', () => {

        const permission = new Permission()
          .authenticated()
          .userAttribute('author')
          .userAttribute('reviewer')

        const filter = buildUserAttributesPermissionFilter(permission, userId)

        expect(filter).toMatchSnapshot();
      })

    })


    describe('states', () => {

      it('should reject if entity is not provided', () => {

        function fn() {
          const permission = new Permission()
            .state('completed')
          buildStatesPermissionFilter(permission)
        }

        expect(fn).toThrowErrorMatchingSnapshot();
      })


      it('should reject if invalid state is used', () => {

        function fn() {
          const permission = new Permission()
            .state('completed')
          buildStatesPermissionFilter(permission, someEntity)
        }

        expect(fn).toThrowErrorMatchingSnapshot();
      })


      it('should return undefined filters if permission type is not used', () => {

        const permission = new Permission()
          .userAttribute('reviewer')

        const filter = buildStatesPermissionFilter(permission, someEntity)

        expect(filter).toBeUndefined()
      })


      it('should generate filters for single entries', () => {

        const permission = new Permission()
          .state('open')

        const filter = buildStatesPermissionFilter(permission, someEntity)

        expect(filter).toMatchSnapshot();
      })


      it('should generate filters for multiple entries', () => {

        const permission = new Permission()
          .authenticated()
          .state('open')
          .state('inTransfer')

        const filter = buildStatesPermissionFilter(permission, someEntity)

        expect(filter).toMatchSnapshot();
      })

    })


    describe('all permission types', () => {

      it('should return undefined filters if no permission type is used', () => {

        const permission = new Permission()

        const filter = buildPermissionFilterSingle(permission, userId, userRoles, someEntity)

        expect(filter).toBeUndefined()
      })


      it('should generate filters for single permission types', () => {

        const permission = new Permission()
          .authenticated()
          .userAttribute('author')

        const filter = buildPermissionFilterSingle(permission, userId, userRoles, someEntity)

        expect(filter).toMatchSnapshot();
      })


      it('should generate filters for multiple permission types', () => {

        const permission = new Permission()
          .authenticated()
          .userAttribute('author')
          .state('open')
          .state('inTransfer')

        const filter = buildPermissionFilterSingle(permission, userId, userRoles, someEntity)

        expect(filter).toMatchSnapshot();
      })

    })


    describe('combine multiple permissions', () => {

      it('should return undefined filters if no permission type is used', () => {

        const permission = new Permission()

        const filter = buildPermissionFilter(permission, userId, userRoles, someEntity)

        expect(filter).toBeUndefined()
      })


      it('should return undefined filters if request does not pass simple permission checks', () => {

        const permission1 = new Permission()
          .authenticated()
          .state('open')
          .state('inTransfer')

        const filter1 = buildPermissionFilter(permission1, null, null, someEntity)

        expect(filter1).toBeUndefined()


        const permission2 = new Permission()
          .authenticated()
          .role('customer')
          .state('open')
          .state('inTransfer')

        const filter2 = buildPermissionFilter(permission2, userId, userRoles, someEntity)

        expect(filter2).toBeUndefined()


        const multiPermissions = [
          new Permission()
            .authenticated()
            .role('customer')
            .state('open')
            .state('inTransfer'),
          new Permission()
            .role('agent')
            .userAttribute('createdBy')
        ]

        const filter3 = buildPermissionFilter(multiPermissions, userId, userRoles, someEntity)

        expect(filter3).toBeUndefined()
      })


      it('should generate filters for single permissions', () => {

        const permission = new Permission()
          .authenticated()
          .userAttribute('author')
          .state('open')

        const filter = buildPermissionFilter(permission, userId, userRoles, someEntity)

        expect(filter).toMatchSnapshot();
      })


      it('should generate filters for multiple permissions', () => {

        const multiPermissions = [
          new Permission()
            .authenticated()
            .userAttribute('author')
            .state('open')
            .state('inTransfer'),
          new Permission()
            .role('reviewer')
            .userAttribute('createdBy')
        ]

        const filter = buildPermissionFilter(multiPermissions, userId, userRoles, someEntity)

        expect(filter).toMatchSnapshot();
      })


      it('should generate filters for eligible permissions only', () => {

        const multiPermissions = [
          new Permission()
            .authenticated()
            .role('customer')
            .state('open'),
          new Permission()
            .authenticated()
            .userAttribute('author')
            .state('open')
            .state('inTransfer'),
          new Permission()
            .role('reviewer')
            .userAttribute('createdBy'),
          new Permission()
            .role('admin')
            .userAttribute('author')
        ]

        const filter = buildPermissionFilter(multiPermissions, userId, userRoles, someEntity)

        expect(filter).toMatchSnapshot();
      })

    })

  })


  describe('processEntityPermissions', () => {

    const entity = new Entity({
      name: 'SomeEntityName',
      description: 'Just some description',
      attributes: {
        someAttribute: {
          type: DataTypeString,
          description: 'Some description',
        }
      }
    })


    it('should accept a correct permissions setup', () => {

      const permissions = {
        read: new Permission().value('someAttribute', 123),
        mutations: {
          update: new Permission().role('manager'),
        }
      }

      processEntityPermissions(entity, permissions)
    })


    it('should throw if provided with an invalid map of permissions', () => {

      const permissions = [ 'bad' ]

      function fn() {
        processEntityPermissions(entity, permissions)
      }

      expect(fn).toThrowErrorMatchingSnapshot();

    })


    it('should throw if provided with an invalid map of mutation permissions', () => {

      const permissions = {
        mutations: [ 'bad' ]
      }

      function fn() {
        processEntityPermissions(entity, permissions)
      }

      expect(fn).toThrowErrorMatchingSnapshot();

    })


    it('should throw if provided with an invalid permissions', () => {

      const permissions1 = {
        read: [ 'bad' ]
      }

      function fn1() {
        processEntityPermissions(entity, permissions1)
      }

      expect(fn1).toThrowErrorMatchingSnapshot();


      const permissions2 = {
        find: [ 'bad' ]
      }

      function fn2() {
        processEntityPermissions(entity, permissions2)
      }

      expect(fn2).toThrowErrorMatchingSnapshot();


      const permissions3 = {
        mutations: {
          mutations: {
            create: [ 'bad' ]
          }
        }
      }

      function fn3() {
        processEntityPermissions(entity, permissions3)
      }

      expect(fn3).toThrowErrorMatchingSnapshot();

    })


    it('should throw if permissions have unknown attributes defined', () => {

      const permissions1 = {
        read: new Permission().userAttribute('notHere')
      }

      function fn1() {
        processEntityPermissions(entity, permissions1)
      }

      expect(fn1).toThrowErrorMatchingSnapshot();


      const permissions2 = {
        find: new Permission().value('notHere', 123)
      }

      function fn2() {
        processEntityPermissions(entity, permissions2)
      }


      expect(fn2).toThrowErrorMatchingSnapshot();


      const permissions3 = {
        mutations: {
          update: new Permission().userAttribute('notHere')
        }
      }

      function fn3() {
        processEntityPermissions(entity, permissions3)
      }

      expect(fn3).toThrowErrorMatchingSnapshot();

    })


    it('should throw if permissions have invalid attributes defined', () => {

      const permissions = {
        read: new Permission().userAttribute('someAttribute')
      }

      function fn() {
        processEntityPermissions(entity, permissions)
      }

      expect(fn).toThrowErrorMatchingSnapshot();

    })


    it('should throw if permissions are assigned to unknown mutations', () => {

      const permissions = {
        mutations: {
          noSuchMutation: new Permission().userAttribute('someAttribute')
        }
      }

      function fn() {
        processEntityPermissions(entity, permissions)
      }

      expect(fn).toThrowErrorMatchingSnapshot();

    })

  })

})
