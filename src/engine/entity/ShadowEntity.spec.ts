import { Entity } from './Entity';
import { ShadowEntity, isShadowEntity } from './ShadowEntity';
import { passOrThrow } from '../util';
import { DataTypeID, DataTypeString } from '../datatype/dataTypes';

describe('ShadowEntity', () => {
  it('should have a name', () => {
    function fn() {
      // eslint-disable-next-line no-new
      new ShadowEntity({} as any);
    }

    expect(fn).toThrowErrorMatchingSnapshot();
  });

  it("should return it's name", () => {
    const shadowEntity = new ShadowEntity({
      name: 'ShadowViewEntityName',
      attributesGenerator: () => ({} as any),
    });

    expect(shadowEntity.name).toBe('ShadowViewEntityName');
    expect(String(shadowEntity)).toBe('ShadowViewEntityName');
  });

  it('should accept only maps or functions as attributes definition', () => {
    function fn() {
      // eslint-disable-next-line no-new
      new ShadowEntity({
        name: 'Example',
        attributes: [2, 7, 13] as any,
      });
    }

    expect(fn).toThrowErrorMatchingSnapshot();
  });

  it('should reject non-map results of attribute definition functions', () => {
    function fn() {
      // eslint-disable-next-line no-new
      const shadowEntity = new ShadowEntity({
        name: 'Example',
        attributesGenerator: () => {
          return [2, 7, 13] as any;
        },
      });

      shadowEntity.getAttributes();
    }

    expect(fn).toThrowErrorMatchingSnapshot();
  });

  describe('should have a list of attributes', () => {
    it('as a map', () => {
      const shadowEntity = new ShadowEntity({
        name: 'ShadowViewEntityName',
        attributes: {
          id: {
            type: DataTypeID,
            description: 'ID of item',
            primary: true,
          },
          name: {
            type: DataTypeString,
            description: 'Just another description',
          },
        },
      });

      const attributes = shadowEntity.getAttributes();

      expect(attributes.id.type).toBe(DataTypeID);
      expect(attributes.name.type).toBe(DataTypeString);
    });

    it('as a function return a map', () => {
      const shadowEntity = new ShadowEntity({
        name: 'ShadowViewEntityName',
        attributesGenerator: () => {
          return {
            id: {
              type: DataTypeID,
              description: 'ID of item',
              primary: true,
            },
            name: {
              type: DataTypeString,
              description: 'Just another description',
            },
          };
        },
      });

      const attributes = shadowEntity.getAttributes();

      expect(attributes.id.type).toBe(DataTypeID);
      expect(attributes.name.type).toBe(DataTypeString);
    });
  });

  it('should throw if invalid storage type was provided', () => {
    function fn() {
      // eslint-disable-next-line no-new
      new ShadowEntity({
        name: 'Example',
        attributes: {
          id: {
            type: DataTypeID,
            description: 'ID of item',
            primary: true,
          },
        },
        storageType: {},
      });
    }

    expect(fn).toThrowErrorMatchingSnapshot();
  });

  describe('isShadowEntity', () => {
    it('should recognize objects of type ShadowEntity', () => {
      const shadowEntity = new ShadowEntity({
        name: 'ShadowViewEntityName',
        attributesGenerator() {
          return null;
        },
      });

      function fn() {
        passOrThrow(
          isShadowEntity(shadowEntity),
          () => 'This error will never happen',
        );
      }

      expect(fn).not.toThrow();
    });

    it('should recognize non-ShadowEntity objects', () => {
      function fn() {
        passOrThrow(
          isShadowEntity({}) ||
            isShadowEntity(function test() {
              /**/
            } as any) ||
            isShadowEntity(Error),
          () => 'Not a ShadowEntity object',
        );
      }

      expect(fn).toThrowErrorMatchingSnapshot();
    });
  });

  describe('attributes', () => {
    it('should catch invalid attribute names', () => {
      const shadowEntity = new ShadowEntity({
        name: 'ShadowViewEntityName',
        attributes: {
          ['wrong-named-attribute']: {
            type: DataTypeID,
            description: 'Something',
          },
        },
      });

      function fn() {
        shadowEntity.getAttributes();
      }

      expect(fn).toThrowErrorMatchingSnapshot();
    });

    it('should accept an empty attributes map', () => {
      const shadowEntity = new ShadowEntity({
        name: 'ShadowViewEntityName',
        attributes: {},
      });

      function fn() {
        shadowEntity.getAttributes();
      }

      expect(fn).not.toThrow();
    });

    it('should reject attributes with missing or invalid data type', () => {
      const shadowEntity = new ShadowEntity({
        name: 'ShadowViewEntityName',
        attributes: {
          someAttribute: {} as any,
        },
      });

      function fn() {
        shadowEntity.getAttributes();
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

      const City = new ShadowEntity({
        name: 'City',
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
  });

  describe('references', () => {
    const Country = new ShadowEntity({
      name: 'Country',
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
});
