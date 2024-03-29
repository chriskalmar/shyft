/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable @typescript-eslint/explicit-function-return-type */

import {
  Permission,
  isPermission,
  isPermissionsArray,
  findInvalidPermissionAttributes,
  findMissingPermissionAttributes,
  generatePermissionDescription,
  checkPermissionSimple,
  buildUserAttributesPermissionFilter,
  buildStatesPermissionFilter,
  buildValuesPermissionFilter,
  buildPermissionFilterSingle,
  buildPermissionFilter,
  buildLookupsPermissionFilter,
  processEntityPermissions,
  processActionPermissions, PermissionMap,
} from './Permission';
import { Entity } from '../entity/Entity';
import { Action } from '../action/Action';
import { DataTypeString } from '../datatype/dataTypes';
import { passOrThrow } from '../util';
import { Language } from '../models/Language';

describe('Permission', () => {
  it('should create permission objects', () => {
    new Permission().everyone();
    new Permission().authenticated();
    new Permission().role('manager');
    new Permission().lookup(Language, {
      createdBy: 'someAttribute',
    });
    new Permission().value('someAttribute', 123);

    expect(String(new Permission())).toBe('Permission Object');
  });

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
      .value('someAttribute', 987);

    expect(permission.roles).toEqual(['manager', 'admin']);
    expect(permission.lookups).toEqual([
      {
        entity: Language,
        lookupMap: {
          createdBy: 'someAttribute',
        },
      },
      {
        entity: Language,
        lookupMap: {
          country: 'any',
        },
      },
    ]);
    expect(permission.values).toEqual([
      {
        attributeName: 'someAttribute',
        value: 123,
      },
      {
        attributeName: 'someAttribute',
        value: 987,
      },
    ]);
  });

  it('should reject incompatible permission types', () => {
    function fn1() {
      new Permission().role('manager').everyone();
    }

    expect(fn1).toThrowErrorMatchingSnapshot();

    function fn2() {
      new Permission().userAttribute('author').everyone();
    }

    expect(fn2).toThrowErrorMatchingSnapshot();

    function fn3() {
      new Permission().everyone().authenticated();
    }

    expect(fn3).toThrowErrorMatchingSnapshot();
  });

  describe('role permissions', () => {
    it('should reject if role name is missing', () => {
      function fn1() {
        new Permission().role((undefined as unknown) as string);
      }

      expect(fn1).toThrowErrorMatchingSnapshot();
    });

    it('should reject if duplicate roles are provided', () => {
      function fn1() {
        new Permission().role('manager').role('manager');
      }

      expect(fn1).toThrowErrorMatchingSnapshot();
    });
  });

  describe('userAttribute permissions', () => {
    it('should reject if attribute name is missing', () => {
      function fn1() {
        new Permission().userAttribute((undefined as unknown) as string);
      }

      expect(fn1).toThrowErrorMatchingSnapshot();
    });

    it('should reject if duplicate attribute names are provided', () => {
      function fn1() {
        new Permission().userAttribute('profile').userAttribute('profile');
      }

      expect(fn1).toThrowErrorMatchingSnapshot();
    });
  });

  describe('lookup permissions', () => {
    it('should reject if entity is missing', () => {
      function fn1() {
        new Permission().lookup((undefined as unknown) as Entity, undefined);
      }

      expect(fn1).toThrowErrorMatchingSnapshot();
    });

    it('should reject if lookupMap is missing', () => {
      function fn1() {
        new Permission().lookup(Language, undefined);
      }

      expect(fn1).toThrowErrorMatchingSnapshot();
    });
  });

  describe('value permissions', () => {
    it('should reject if attribute name is missing', () => {
      function fn1() {
        new Permission().value((undefined as unknown) as string, undefined);
      }

      expect(fn1).toThrowErrorMatchingSnapshot();
    });

    it('should reject if value is missing', () => {
      function fn1() {
        new Permission().value('someAttribute', undefined);
      }

      expect(fn1).toThrowErrorMatchingSnapshot();
    });
  });

  describe('isPermission', () => {
    it('should recognize objects of type Permission', () => {
      const permission = new Permission();

      function fn() {
        passOrThrow(
          isPermission(permission),
          () => 'This error will never happen',
        );
      }

      expect(fn).not.toThrow();
    });

    it('should recognize non-Permission objects', () => {
      function fn() {
        passOrThrow(
          isPermission({}) ||
            isPermission(function test() {}) ||
            isPermission(Error),
          () => 'Not a Permission object',
        );
      }

      expect(fn).toThrowErrorMatchingSnapshot();
    });
  });

  describe('isPermissionsArray', () => {
    it('should recognize a list of objects of type Permission', () => {
      const permission = new Permission();

      function fn() {
        passOrThrow(
          isPermissionsArray([permission]) &&
            isPermissionsArray([permission, permission]) &&
            isPermissionsArray([permission, permission, permission]),
          () => 'This error will never happen',
        );
      }

      expect(fn).not.toThrow();
    });

    it('should recognize non-Permission objects', () => {
      const permission = new Permission();

      function fn() {
        passOrThrow(
          isPermissionsArray(undefined) ||
            isPermissionsArray(null) ||
            isPermissionsArray([]) ||
            isPermissionsArray(({} as unknown) as Permission) ||
            isPermissionsArray((function test() {} as unknown) as Permission[]) ||
            isPermissionsArray((Error as unknown) as Permission[]) ||
            isPermissionsArray(([{}] as unknown) as Permission[]) ||
            isPermissionsArray(([function test() {}] as unknown) as Permission[]) ||
            isPermissionsArray(([Error] as unknown) as Permission[]) ||
            isPermissionsArray([permission, null]) ||
            isPermissionsArray([permission, {} as Permission, permission]),
          () => 'Not a Permissions array',
        );
      }

      expect(fn).toThrowErrorMatchingSnapshot();
    });
  });

  describe('permission attributes', () => {
    const City = new Entity({
      name: 'City',
      description: 'A city',
      attributes: {
        cityName: {
          type: DataTypeString,
          description: 'City name',
        },
      },
    });

    const User = new Entity({
      name: 'User',
      description: 'A user',
      isUserEntity: true,
      attributes: {
        loginName: {
          type: DataTypeString,
          description: 'Login name',
        },
        city: {
          type: City,
          description: "User's city",
        },
      },
    });

    it('should reject if userAttribute is not a reference to the user entity', () => {
      function fn1() {
        const permission = new Permission().userAttribute('any');

        findInvalidPermissionAttributes(permission, City);
      }

      function fn2() {
        const permission = new Permission().userAttribute('cityName');

        findInvalidPermissionAttributes(permission, City);
      }

      function fn3() {
        const permission = new Permission().userAttribute('city');

        findInvalidPermissionAttributes(permission, User);
      }

      expect(fn1).toThrowErrorMatchingSnapshot();
      expect(fn2).toThrowErrorMatchingSnapshot();
      expect(fn3).toThrowErrorMatchingSnapshot();
    });

    it('should find missing permission attributes', () => {
      {
        const permission = new Permission().userAttribute('wrong');

        const missing = findMissingPermissionAttributes(permission, City);

        expect(missing).toEqual('wrong');
      }

      {
        const permission = new Permission().lookup(User, {
          wrong: 'id',
        });

        const missing = findMissingPermissionAttributes(permission, City);

        expect(missing).toEqual('User.wrong');
      }

      {
        const permission = new Permission().lookup(User, {
          city: 'hello',
        });

        const missing = findMissingPermissionAttributes(permission, City);

        expect(missing).toEqual('hello');
      }

      {
        const permission = new Permission().value('wrong', 123);

        const missing = findMissingPermissionAttributes(permission, City);

        expect(missing).toEqual('wrong');
      }
    });

    it('should accept correctly defined permission attributes', () => {
      const permission = new Permission()
        .userAttribute('id')
        .lookup(User, {
          city: 'id',
          id: (userId) => userId,
        })
        // https://en.wikipedia.org/wiki/Taumatawhakatangihangakoauauotamateaturipukakapikimaungahoronukupokaiwhenuakitanatahu
        .value(
          'cityName',
          'Taumatawhakatangihangakoauauotamateaturipukakapikimaungahoronukupokaiwhenuakitanatahu',
        );

      const missing = findMissingPermissionAttributes(permission, City);

      expect(missing).toBe(false);
    });

    it('should reject lookup mappings other than value functions when used with a create type mutation', () => {
      const permission = new Permission().userAttribute('id').lookup(User, {
        city: 'id',
        id: (userId) => userId,
      });

      const createMutation = User.getMutationByName('create');

      const fn = () =>
        findMissingPermissionAttributes(permission, City, createMutation);

      expect(fn).toThrowErrorMatchingSnapshot();
    });
  });

  describe('permissions description', () => {
    it('should reject if non-Permission object is provided', () => {
      function fn() {
        generatePermissionDescription(({ foo: 'bar' } as unknown) as Permission);
      }

      expect(fn).toThrowErrorMatchingSnapshot();
    });

    it('should generate a description based on defined permissions', () => {
      type Test = [Permission | Permission[], string];

      const tests: Test[] = [
        [new Permission().everyone(), 'everyone'],
        [new Permission().authenticated(), 'authenticated'],
        [new Permission().role('manager'), 'role manager'],
        [
          new Permission().userAttribute('publisher'),
          'userAttributes publisher',
        ],
        [
          new Permission().lookup(Language, { createdBy: 'someAttribute' }),
          'lookup Language someAttribute',
        ],
        [new Permission().value('someAttribute', 123), 'value someAttribute'],
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
          'mixed 1',
        ],
        [
          [
            new Permission().lookup(Language, { createdBy: 'someAttribute' }),
            new Permission().role('manager').userAttribute('publisher'),
            new Permission().value('someAttribute', 123),
          ],
          'permissions array',
        ],
      ];

      tests.map(([permission, testName]) => {
        expect(generatePermissionDescription(permission)).toMatchSnapshot(
          testName,
        );
      });
    });

    it('should return no description if permission object is empty', () => {
      const permission = new Permission();

      const result = generatePermissionDescription(permission);

      expect(result).toBe(false);
    });
  });

  describe('permissions check simple', () => {
    const userId = 123;
    const userRoles = ['manager', 'reviewer'];

    it('should reject if non-Permission object is provided', () => {
      function fn() {
        checkPermissionSimple({} as Permission);
      }

      expect(fn).toThrowErrorMatchingSnapshot();
    });

    it('should reject if user roles are not provided as an array', () => {
      function fn() {
        checkPermissionSimple(new Permission(), null, ({ bad: 'roles' } as unknown) as any[]);
      }

      expect(fn).toThrowErrorMatchingSnapshot();
    });

    it('should always give access if permission mode is `everyone`', () => {
      expect(checkPermissionSimple(new Permission().everyone())).toBe(true);
    });

    it('should give access to authenticated users if permission mode is `authenticated`', () => {
      expect(
        checkPermissionSimple(new Permission().authenticated(), userId),
      ).toBe(true);
    });

    it('should reject access for anonymous users if permission mode is `authenticated`', () => {
      expect(checkPermissionSimple(new Permission().authenticated())).toBe(
        false,
      );
    });

    it('should give access to users with corresponding user roles on permission mode `role`', () => {
      expect(
        checkPermissionSimple(
          new Permission().role('reviewer'),
          userId,
          userRoles,
        ),
      ).toBe(true);
    });

    it('should reject access for users with different roles on permission mode `role`', () => {
      expect(
        checkPermissionSimple(
          new Permission().role('admin'),
          userId,
          userRoles,
        ),
      ).toBe(false);

      expect(
        checkPermissionSimple(
          new Permission().authenticated().role('admin'),
          userId,
          userRoles,
        ),
      ).toBe(false);
    });

    it('should default to give access if neither `everyone`, `authenticated` or `role` is defined', () => {
      expect(checkPermissionSimple(new Permission(), userId, userRoles)).toBe(
        true,
      );
    });
  });

  describe('build permission filter', () => {
    const userId = 123;
    const userRoles = ['manager', 'reviewer'];

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
    });

    describe('userAttributes', () => {
      it('should reject if userId is not provided', () => {
        function fn() {
          const permission = new Permission().userAttribute('author');

          buildUserAttributesPermissionFilter({ permission, userId: undefined });
        }

        expect(fn).toThrowErrorMatchingSnapshot();
      });

      it('should return undefined filters if permission type is not used', () => {
        const permission = new Permission().state('completed');

        const filter = buildUserAttributesPermissionFilter({
          permission,
          userId,
        });

        expect(filter).toBeUndefined();
      });

      it('should generate filters for single entries', () => {
        const permission = new Permission().userAttribute('author');

        const filter = buildUserAttributesPermissionFilter({
          permission,
          userId,
        });

        expect(filter).toMatchSnapshot();
      });

      it('should generate filters for multiple entries', () => {
        const permission = new Permission()
          .authenticated()
          .userAttribute('author')
          .userAttribute('reviewer');

        const filter = buildUserAttributesPermissionFilter({
          permission,
          userId,
        });

        expect(filter).toMatchSnapshot();
      });
    });

    describe('states', () => {
      it('should reject if entity is not provided', () => {
        function fn() {
          const permission = new Permission().state('completed');

          buildStatesPermissionFilter({ permission, entity: undefined });
        }

        expect(fn).toThrowErrorMatchingSnapshot();
      });

      it('should reject if invalid state is used', () => {
        function fn() {
          const permission = new Permission().state('completed');

          buildStatesPermissionFilter({ permission, entity: someEntity });
        }

        expect(fn).toThrowErrorMatchingSnapshot();
      });

      it('should return undefined filters if permission type is not used', () => {
        const permission = new Permission().userAttribute('reviewer');

        const filter = buildStatesPermissionFilter({
          permission,
          entity: someEntity,
        });

        expect(filter).toBeUndefined();
      });

      it('should generate filters for single entries', () => {
        const permission = new Permission().state('open');

        const filter = buildStatesPermissionFilter({
          permission,
          entity: someEntity,
        });

        expect(filter).toMatchSnapshot();
      });

      it('should generate filters for multiple entries', () => {
        const permission = new Permission()
          .authenticated()
          .state('open')
          .state('inTransfer');

        const filter = buildStatesPermissionFilter({
          permission,
          entity: someEntity,
        });

        expect(filter).toMatchSnapshot();
      });
    });

    describe('values', () => {
      it('should return undefined filters if permission type is not used', () => {
        const permission = new Permission().userAttribute('reviewer');

        const filter = buildValuesPermissionFilter({ permission });

        expect(filter).toBeUndefined();
      });

      it('should generate filters for single entries', () => {
        const permission = new Permission().value('someAttribute', 'lorem');

        const filter = buildValuesPermissionFilter({ permission });

        expect(filter).toMatchSnapshot();
      });

      it('should generate filters for multiple entries', () => {
        const permission = new Permission()
          .authenticated()
          .value('someAttribute', 'lorem')
          .value('someAttribute', 'ipsum');

        const filter = buildValuesPermissionFilter({ permission });

        expect(filter).toMatchSnapshot();
      });
    });

    describe('lookups', () => {
      it('should return undefined filters if permission type is not used', async () => {
        const permission = new Permission().userAttribute('reviewer');

        const filter = await buildLookupsPermissionFilter({ permission });

        expect(filter).toBeUndefined();
      });

      it('should generate filters for single entries', async () => {
        const permission = new Permission().lookup(someEntity, {
          id: 'reference',
          district: 'district',
        });

        const filter = await buildLookupsPermissionFilter({ permission });

        expect(filter).toMatchSnapshot();
      });

      it('should generate filters for multiple entries', async () => {
        const permission = new Permission()
          .authenticated()
          .lookup(someEntity, {
            id: 'reference',
            district: 'district',
          })
          .lookup(someEntity, {
            id: 'reference',
            district: 'district',
            open: () => false,
          });

        const filter = await buildLookupsPermissionFilter({ permission });

        expect(filter).toMatchSnapshot();
      });

      it('should generate filter values from functions and provided mutation data', async () => {
        const permission = new Permission().lookup(someEntity, {
          id: 'reference',
          district: ({ input }) => input.district,
          open: () => true,
          owner: ({ userId }) => userId, // eslint-disable-line no-shadow
          state: () => ['defined', 'approved'],
        });

        const input = {
          name: 'lorem',
          district: 188,
        };

        const filter = await buildLookupsPermissionFilter({
          permission,
          userId: 123,
          input,
        });

        expect(filter).toMatchSnapshot();
      });
    });

    describe('all permission types', () => {
      it('should generate filters for single permission types', async () => {
        const permission = new Permission()
          .authenticated()
          .userAttribute('author')
          .value('something', 23);

        const filter = await buildPermissionFilterSingle(
          permission,
          userId,
          userRoles,
          someEntity,
        );

        expect(filter).toMatchSnapshot();
      });

      it('should generate filters for multiple permission types', async () => {
        const permission = new Permission()
          .authenticated()
          .userAttribute('author')
          .state('open')
          .state('inTransfer')
          .value('something', 23)
          .value('something', 80)
          .value('somethingElse', 4);

        const filter = await buildPermissionFilterSingle(
          permission,
          userId,
          userRoles,
          someEntity,
        );

        expect(filter).toMatchSnapshot();
      });
    });

    describe('combine multiple permissions', () => {
      it('should return undefined filters if request does not pass simple permission checks', async () => {
        const permission1 = new Permission()
          .authenticated()
          .state('open')
          .state('inTransfer');

        const filter1 = await buildPermissionFilter(
          permission1,
          null,
          null,
          someEntity,
        );

        expect(filter1).toBeUndefined();

        const permission2 = new Permission()
          .authenticated()
          .role('customer')
          .state('open')
          .state('inTransfer');

        const filter2 = await buildPermissionFilter(
          permission2,
          userId,
          userRoles,
          someEntity,
        );

        expect(filter2).toBeUndefined();

        const multiPermissions = [
          new Permission()
            .authenticated()
            .role('customer')
            .state('open')
            .state('inTransfer'),
          new Permission().role('agent').userAttribute('createdBy'),
        ];

        const filter3 = await buildPermissionFilter(
          multiPermissions,
          userId,
          userRoles,
          someEntity,
        );

        expect(filter3).toBeUndefined();
      });

      it('should generate filters for single permissions', async () => {
        const permission = new Permission()
          .authenticated()
          .userAttribute('author')
          .state('open');

        const filter = await buildPermissionFilter(
          permission,
          userId,
          userRoles,
          someEntity,
        );

        expect(filter).toMatchSnapshot();
      });

      it('should generate filters for multiple permissions', async () => {
        const multiPermissions = [
          new Permission()
            .authenticated()
            .userAttribute('author')
            .state('open')
            .state('inTransfer'),
          new Permission().role('reviewer').userAttribute('createdBy'),
        ];

        const filter = await buildPermissionFilter(
          multiPermissions,
          userId,
          userRoles,
          someEntity,
        );

        expect(filter).toMatchSnapshot();
      });

      it('should generate filters for eligible permissions only', async () => {
        const multiPermissions = [
          new Permission().authenticated().role('customer').state('open'),
          new Permission()
            .authenticated()
            .userAttribute('author')
            .state('open')
            .state('inTransfer'),
          new Permission().role('reviewer').userAttribute('createdBy'),
          new Permission().role('admin').userAttribute('author'),
        ];

        const filter = await buildPermissionFilter(
          multiPermissions,
          userId,
          userRoles,
          someEntity,
        );

        expect(filter).toMatchSnapshot();
      });

      it('should generate empty filter if a simple permission applies', async () => {
        const multiPermissions = [
          new Permission().authenticated().role('customer').state('open'),
          new Permission()
            .authenticated()
            .userAttribute('author')
            .state('open')
            .state('inTransfer'),
          new Permission().role('reviewer').userAttribute('createdBy'),
          new Permission().role('manager'),
        ];

        const filter = await buildPermissionFilter(
          multiPermissions,
          userId,
          userRoles,
          someEntity,
        );
        expect(filter).toMatchSnapshot();
      });
    });
  });

  describe('processEntityPermissions', () => {
    const entity = new Entity({
      name: 'SomeEntityName',
      description: 'Just some description',
      attributes: {
        someAttribute: {
          type: DataTypeString,
          description: 'Some description',
        },
      },
    });

    it('should accept a correct permissions setup', () => {
      const permissions = {
        read: new Permission().value('someAttribute', 123),
        mutations: {
          update: new Permission().role('manager'),
        },
        subscriptions: {
          onUpdate: new Permission().role('manager'),
        },
      };

      const permissionMap = processEntityPermissions(entity, permissions);
      expect(permissionMap).toMatchSnapshot();
    });

    it('should throw if provided with an invalid map of permissions', () => {
      const permissions = ['bad'];

      function fn() {
        processEntityPermissions(entity, (permissions as unknown) as PermissionMap);
      }

      expect(fn).toThrowErrorMatchingSnapshot();
    });

    it('should throw if provided with an invalid map of mutation permissions', () => {
      const permissions = {
        mutations: ['bad'],
      };

      function fn() {
        processEntityPermissions(entity, (permissions as unknown) as PermissionMap);
      }

      expect(fn).toThrowErrorMatchingSnapshot();
    });

    it('should throw if provided with an invalid map of subscription permissions', () => {
      const permissions = {
        subscriptions: ['bad'],
      };

      function fn() {
        processEntityPermissions(entity, (permissions as unknown) as PermissionMap);
      }

      expect(fn).toThrowErrorMatchingSnapshot();
    });

    it('should throw if provided with an invalid permissions', () => {
      const permissions1 = {
        read: ['bad'],
      };

      function fn1() {
        processEntityPermissions(entity, (permissions1 as unknown) as PermissionMap);
      }

      expect(fn1).toThrowErrorMatchingSnapshot();

      const permissions2 = {
        find: ['bad'],
      };

      function fn2() {
        processEntityPermissions(entity, (permissions2 as unknown) as PermissionMap);
      }

      expect(fn2).toThrowErrorMatchingSnapshot();

      const permissions3 = {
        mutations: {
          mutations: {
            create: ['bad'],
          },
        },
      };

      function fn3() {
        processEntityPermissions(entity, (permissions3 as unknown) as PermissionMap);
      }

      expect(fn3).toThrowErrorMatchingSnapshot();
    });

    it('should throw if permissions have unknown attributes defined', () => {
      const permissions1 = {
        read: new Permission().userAttribute('notHere'),
      };

      function fn1() {
        processEntityPermissions(entity, permissions1);
      }

      expect(fn1).toThrowErrorMatchingSnapshot();

      const permissions2 = {
        find: new Permission().value('notHere', 123),
      };

      function fn2() {
        processEntityPermissions(entity, permissions2);
      }

      expect(fn2).toThrowErrorMatchingSnapshot();

      const permissions3 = {
        mutations: {
          update: new Permission().userAttribute('notHere'),
        },
      };

      function fn3() {
        processEntityPermissions(entity, permissions3);
      }

      expect(fn3).toThrowErrorMatchingSnapshot();

      const permissions4 = {
        subscriptions: {
          onUpdate: new Permission().userAttribute('notHere'),
        },
      };

      function fn4() {
        processEntityPermissions(entity, permissions4);
      }

      expect(fn4).toThrowErrorMatchingSnapshot();
    });

    it('should throw if permissions have invalid attributes defined', () => {
      const permissions = {
        read: new Permission().userAttribute('someAttribute'),
      };

      function fn() {
        processEntityPermissions(entity, permissions);
      }

      expect(fn).toThrowErrorMatchingSnapshot();
    });

    it('should throw if permissions are assigned to unknown mutations', () => {
      const permissions = {
        mutations: {
          noSuchMutation: new Permission().userAttribute('someAttribute'),
        },
      };

      function fn() {
        processEntityPermissions(entity, permissions);
      }

      expect(fn).toThrowErrorMatchingSnapshot();
    });

    it('should throw if permissions are assigned to unknown subscriptions', () => {
      const permissions = {
        subscriptions: {
          noSuchSubscription: new Permission().userAttribute('someAttribute'),
        },
      };

      function fn() {
        processEntityPermissions(entity, permissions);
      }

      expect(fn).toThrowErrorMatchingSnapshot();
    });

    it('should throw if permission is used on a create type mutation and using data-bound permission types', () => {
      const permissions1 = {
        mutations: {
          create: new Permission().state('someState'),
        },
      };

      function fn1() {
        processEntityPermissions(entity, permissions1);
      }

      expect(fn1).toThrowErrorMatchingSnapshot();

      const permissions2 = {
        mutations: {
          create: new Permission().userAttribute('someAttribute'),
        },
      };

      function fn2() {
        processEntityPermissions(entity, permissions2);
      }

      expect(fn2).toThrowErrorMatchingSnapshot();

      const permissions3 = {
        mutations: {
          create: new Permission().value('someAttribute', 10),
        },
      };

      function fn3() {
        processEntityPermissions(entity, permissions3);
      }

      expect(fn3).toThrowErrorMatchingSnapshot();
    });
  });

  describe('processActionPermissions', () => {
    const action = new Action({
      name: 'SomeActionName',
      description: 'Just some description',
      resolve: () => {},
    });

    it('should accept a correct permissions setup', () => {
      const permissions = new Permission().role('manager');

      processActionPermissions(action, permissions);
    });

    it('should throw if provided with invalid permissions', () => {
      const permissions1 = ['bad'];

      function fn1() {
        processActionPermissions(action, (permissions1 as unknown) as Permission[]);
      }

      expect(fn1).toThrowErrorMatchingSnapshot();

      const permissions2 = {
        find: ['bad'],
      };

      function fn2() {
        processActionPermissions(action, (permissions2 as unknown) as Permission[]);
      }

      expect(fn2).toThrowErrorMatchingSnapshot();
    });

    it('should throw if provided with incompatible permissions', () => {
      const permissions1 = new Permission().userAttribute('anything');

      function fn1() {
        processActionPermissions(action, permissions1);
      }

      expect(fn1).toThrowErrorMatchingSnapshot();

      const permissions2 = new Permission().value('anything', 123);

      function fn2() {
        processActionPermissions(action, permissions2);
      }

      expect(fn2).toThrowErrorMatchingSnapshot();

      const permissions3 = new Permission().state('anything');

      function fn3() {
        processActionPermissions(action, permissions3);
      }

      expect(fn3).toThrowErrorMatchingSnapshot();
    });
  });
});
