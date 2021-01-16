import { Entity } from './Entity';
import { ViewEntity, isViewEntity } from './ViewEntity';
import { Permission, isPermission } from '../permission/Permission';
import { passOrThrow } from '../util';
import { DataTypeID, DataTypeString } from '../datatype/dataTypes';

describe('ViewEntity', () => {
  it('should have a name', () => {
    function fn() {
      // eslint-disable-next-line no-new
      new ViewEntity({} as any);
    }

    expect(fn).toThrowErrorMatchingSnapshot();
  });

  it('should have a description', () => {
    function fn() {
      // eslint-disable-next-line no-new
      new ViewEntity({
        name: 'Example',
        viewExpression: 'SELECT 1 as "someName"',
      } as any);
    }

    expect(fn).toThrowErrorMatchingSnapshot();
  });

  it('should have a map of attributes', () => {
    function fn() {
      // eslint-disable-next-line no-new
      new ViewEntity({
        name: 'Example',
        description: 'Just some description',
        viewExpression: 'SELECT 1 as "someName"',
      });
    }

    expect(fn).toThrowErrorMatchingSnapshot();
  });

  it("should return it's name", () => {
    const viewEntity = new ViewEntity({
      name: 'SomeViewEntityName',
      description: 'Just some description',
      viewExpression: 'SELECT 1 as "someName"',
      attributes: () => ({} as any),
    });

    expect(viewEntity.name).toBe('SomeViewEntityName');
    expect(String(viewEntity)).toBe('SomeViewEntityName');
  });

  it('should have a view expression', () => {
    function fn() {
      // eslint-disable-next-line no-new
      new ViewEntity({
        name: 'Example',
        description: 'Just some description',
        attributes: () => ({} as any),
      } as any);
    }

    expect(fn).toThrowErrorMatchingSnapshot();
  });

  it('should accept only maps or functions as attributes definition', () => {
    function fn() {
      // eslint-disable-next-line no-new
      new ViewEntity({
        name: 'Example',
        description: 'Just some description',
        attributes: [2, 7, 13] as any,
        viewExpression: 'SELECT 1 as "someName"',
      });
    }

    expect(fn).toThrowErrorMatchingSnapshot();
  });

  it('should reject non-map results of attribute definition functions', () => {
    function fn() {
      // eslint-disable-next-line no-new
      const viewEntity = new ViewEntity({
        name: 'Example',
        description: 'Just some description',
        viewExpression: 'SELECT 1 as "someName"',
        attributes: () => {
          return [2, 7, 13] as any;
        },
      });

      viewEntity.getAttributes();
    }

    expect(fn).toThrowErrorMatchingSnapshot();
  });

  describe('should have a list of attributes', () => {
    it('as a map', () => {
      const viewEntity = new ViewEntity({
        name: 'SomeViewEntityName',
        description: 'Just some description',
        viewExpression: 'SELECT 1 as "someName"',
        attributes: {
          id: {
            type: DataTypeID,
            description: 'ID of item',
          },
          name: {
            type: DataTypeString,
            description: 'Just another description',
          },
        },
      });

      const attributes = viewEntity.getAttributes();

      expect(attributes.id.type).toBe(DataTypeID);
      expect(attributes.name.type).toBe(DataTypeString);
    });

    it('as a function return a map', () => {
      const viewEntity = new ViewEntity({
        name: 'SomeViewEntityName',
        description: 'Just some description',
        viewExpression: 'SELECT 1 as "someName"',
        attributes: () => {
          return {
            id: {
              type: DataTypeID,
              description: 'ID of item',
            },
            name: {
              type: DataTypeString,
              description: 'Just another description',
            },
          };
        },
      });

      const attributes = viewEntity.getAttributes();

      expect(attributes.id.type).toBe(DataTypeID);
      expect(attributes.name.type).toBe(DataTypeString);
    });
  });

  it('should throw if invalid storage type was provided', () => {
    function fn() {
      // eslint-disable-next-line no-new
      new ViewEntity({
        name: 'Example',
        description: 'Just some description',
        viewExpression: 'SELECT 1 as "someName"',
        attributes: {
          id: {
            type: DataTypeID,
            description: 'ID of item',
          },
        },
        storageType: {},
      });
    }

    expect(fn).toThrowErrorMatchingSnapshot();
  });

  describe('isViewEntity', () => {
    it('should recognize objects of type ViewEntity', () => {
      const viewEntity = new ViewEntity({
        name: 'SomeViewEntityName',
        description: 'Just some description',
        viewExpression: 'SELECT 1 as "someName"',
        attributes() {
          return null;
        },
      });

      function fn() {
        passOrThrow(
          isViewEntity(viewEntity),
          () => 'This error will never happen',
        );
      }

      expect(fn).not.toThrow();
    });

    it('should recognize non-ViewEntity objects', () => {
      function fn() {
        passOrThrow(
          isViewEntity({}) ||
            isViewEntity(function test() {
              /**/
            } as any) ||
            isViewEntity(Error),
          () => 'Not a ViewEntity object',
        );
      }

      expect(fn).toThrowErrorMatchingSnapshot();
    });
  });

  describe('attributes', () => {
    it('should catch invalid attribute names', () => {
      const viewEntity = new ViewEntity({
        name: 'SomeViewEntityName',
        description: 'Just some description',
        viewExpression: 'SELECT 1 as "someName"',
        attributes: {
          ['wrong-named-attribute']: {
            type: DataTypeID,
            description: 'Something',
          },
        },
      });

      function fn() {
        viewEntity.getAttributes();
      }

      expect(fn).toThrowErrorMatchingSnapshot();
    });

    it('should reject an empty attributes map', () => {
      const viewEntity = new ViewEntity({
        name: 'SomeViewEntityName',
        description: 'Just some description',
        viewExpression: 'SELECT 1 as "someName"',
        attributes: {},
      });

      function fn() {
        viewEntity.getAttributes();
      }

      expect(fn).toThrowErrorMatchingSnapshot();
    });

    it('should reject attributes without a description', () => {
      const viewEntity = new ViewEntity({
        name: 'SomeViewEntityName',
        description: 'Just some description',
        viewExpression: 'SELECT 1 as "someName"',
        attributes: {
          someAttribute: {} as any,
        },
      });

      function fn() {
        viewEntity.getAttributes();
      }

      expect(fn).toThrowErrorMatchingSnapshot();
    });

    it('should reject attributes with missing or invalid data type', () => {
      const viewEntity = new ViewEntity({
        name: 'SomeViewEntityName',
        description: 'Just some description',
        viewExpression: 'SELECT 1 as "someName"',
        attributes: {
          someAttribute: {
            description: 'Just some description',
          } as any,
        },
      });

      function fn() {
        viewEntity.getAttributes();
      }

      expect(fn).toThrowErrorMatchingSnapshot();
    });

    it('should accept attributes with valid data types or references to other entities', () => {
      const Country = new Entity({
        name: 'Country',
        description: 'A country',
        attributes: {
          name: {
            type: DataTypeString,
            description: 'Country name',
          },
        },
      });

      const City = new ViewEntity({
        name: 'City',
        description: 'A city in a country',
        viewExpression: 'SELECT 1 as "someName"',
        attributes: {
          name: {
            type: DataTypeString,
            description: 'City name',
          },
          country: {
            type: Country,
            description: 'Belongs to a country',
          },
        },
      });

      const attributes = City.getAttributes();

      expect(String(attributes.name.type)).toBe('DataTypeString');
      expect(String(attributes.country.type)).toBe('Country');
    });

    it('should throw if provided with an invalid resolve function', () => {
      const viewEntity = new ViewEntity({
        name: 'SomeViewEntityName',
        description: 'Just some description',
        viewExpression: 'SELECT 1 as "someName"',
        attributes: {
          someAttribute: {
            type: DataTypeString,
            description: 'Just some description',
            resolve: {} as any,
          },
        },
      });

      function fn() {
        viewEntity.getAttributes();
      }

      expect(fn).toThrowErrorMatchingSnapshot();
    });
  });

  describe('references', () => {
    const Country = new ViewEntity({
      name: 'Country',
      description: 'A country',
      viewExpression: 'SELECT 1 as "someName"',
      attributes: {
        name: {
          type: DataTypeString,
          description: 'Country name',
        },
      },
    });

    it('should return a request attribute when used as reference', () => {
      const countryName = Country.referenceAttribute('name');

      expect(String(countryName.type)).toBe('DataTypeString');
    });

    it('should throw if invalid attribute is to be referenced', () => {
      function fn() {
        Country.referenceAttribute('notHere');
      }

      expect(fn).toThrowErrorMatchingSnapshot();
    });
  });

  describe('permissions', () => {
    it('should return a list of permissions', () => {
      const viewEntity = new ViewEntity({
        name: 'SomeViewEntityName',
        description: 'Just some description',
        viewExpression: 'SELECT 1 as "someName"',
        attributes: {
          someAttribute: {
            type: DataTypeString,
            description: 'Some description',
          },
        },
        permissions: {
          read: new Permission().authenticated(),
        },
      });

      const permissions = viewEntity.getPermissions();

      expect(isPermission(permissions.read)).toBe(true);
    });

    it('should throw if empty permissions are provided', () => {
      const viewEntity = new ViewEntity({
        name: 'SomeViewEntityName',
        description: 'Just some description',
        viewExpression: 'SELECT 1 as "someName"',
        attributes: {
          someAttribute: {
            type: DataTypeString,
            description: 'Some description',
          },
        },
        permissions: {
          read: new Permission(),
          find: [new Permission().authenticated(), new Permission()],
          mutations: {
            delete: new Permission(),
          },
        },
      });

      function fn() {
        viewEntity.getPermissions();
      }

      expect(fn).toThrowErrorMatchingSnapshot();
    });
  });
});
