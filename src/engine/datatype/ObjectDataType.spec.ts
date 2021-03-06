/* eslint-disable @typescript-eslint/no-empty-function */

import {
  ObjectDataType,
  ObjectDataTypeSetupType,
  isObjectDataType,
} from './ObjectDataType';
import { passOrThrow } from '../util';
import { DataTypeID, DataTypeString } from './dataTypes';
import { Entity } from '../entity/Entity';

describe('ObjectDataType', () => {
  it('should have a name', () => {
    function fn() {
      // eslint-disable-next-line no-new
      new ObjectDataType();
    }

    expect(fn).toThrowErrorMatchingSnapshot();
  });

  it('should have a description', () => {
    function fn() {
      // eslint-disable-next-line no-new
      new ObjectDataType({
        name: 'example',
      } as ObjectDataTypeSetupType);
    }

    expect(fn).toThrowErrorMatchingSnapshot();
  });

  it('should have a map of attributes', () => {
    function fn() {
      // eslint-disable-next-line no-new
      new ObjectDataType({
        name: 'Example',
        description: 'Just some description',
      } as ObjectDataTypeSetupType);
    }

    expect(fn).toThrowErrorMatchingSnapshot();
  });

  it("should return it's name", () => {
    const objectDataType = new ObjectDataType({
      name: 'someObjectDataTypeName',
      description: 'Just some description',
      attributes: {},
    } as ObjectDataTypeSetupType);

    expect(objectDataType.name).toBe('someObjectDataTypeName');
    expect(String(objectDataType)).toBe('someObjectDataTypeName');
  });

  it('should accept only maps or functions as attributes definition', () => {
    function fn() {
      // eslint-disable-next-line no-new
      new ObjectDataType({
        name: 'Example',
        description: 'Just some description',
        attributes: [2, 7, 13],
      } as any);
    }

    expect(fn).toThrowErrorMatchingSnapshot();
  });

  it('should reject non-map results of attribute definition functions', () => {
    function fn() {
      const objectDataType = new ObjectDataType({
        name: 'Example',
        description: 'Just some description',
        attributes: () => {
          return [2, 7, 13] as any;
        },
      } as ObjectDataTypeSetupType);

      objectDataType.getAttributes();
    }

    expect(fn).toThrowErrorMatchingSnapshot();
  });

  it('should reject empty attribute maps', () => {
    function fn() {
      const objectDataType = new ObjectDataType({
        name: 'Example',
        description: 'Just some description',
        attributes: {},
      } as ObjectDataTypeSetupType);

      objectDataType.getAttributes();
    }

    expect(fn).toThrowErrorMatchingSnapshot();
  });

  it('should reject attributes with missing descriptions', () => {
    function fn() {
      const objectDataType = new ObjectDataType({
        name: 'Example',
        description: 'Just some description',
        attributes: {
          name: {
            type: DataTypeString,
          } as any,
        },
      });

      objectDataType.getAttributes();
    }

    expect(fn).toThrowErrorMatchingSnapshot();
  });

  it('should reject attributes with invalid data types', () => {
    function fn() {
      const objectDataType = new ObjectDataType({
        name: 'Example',
        description: 'Just some description',
        attributes: {
          name: {
            type: {} as any,
            description: 'Just some description',
          },
        } as any,
      });

      objectDataType.getAttributes();
    }

    expect(fn).toThrowErrorMatchingSnapshot();
  });

  it('should reject attributes with invalid resolve functions', () => {
    function fn() {
      const objectDataType = new ObjectDataType({
        name: 'Example',
        description: 'Just some description',
        attributes: {
          name: {
            type: DataTypeString,
            description: 'Just some description',
            resolve: 123456 as any,
          } as any,
        },
      });

      objectDataType.getAttributes();
    }

    expect(fn).toThrowErrorMatchingSnapshot();
  });

  it('should reject attributes with invalid defaultValue functions', () => {
    function fn() {
      const objectDataType = new ObjectDataType({
        name: 'Example',
        description: 'Just some description',
        attributes: {
          name: {
            type: DataTypeString,
            description: 'Just some description',
            defaultValue: 123456 as any,
          } as any,
        },
      });

      objectDataType.getAttributes();
    }

    expect(fn).toThrowErrorMatchingSnapshot();
  });

  it('should cache the attributes map after initial processing', () => {
    const objectDataType = new ObjectDataType({
      name: 'SomeName',
      description: 'Just some description',
      attributes: {
        id: {
          type: DataTypeID,
          description: 'ID of item',
        },
      },
    });

    const attributes = objectDataType.getAttributes();
    const attributesAgain = objectDataType.getAttributes();

    expect(attributes).toEqual(attributesAgain);
  });

  it('should handle nested object data types', () => {
    const objectDataType = new ObjectDataType({
      name: 'SomeName',
      description: 'Just some description',
      attributes: {
        id: {
          type: DataTypeID,
          description: 'ID of item',
        },
        name: {
          type: DataTypeString,
          description: 'Just another description',
        },
        nested: {
          description: 'Just some description',
          type: new ObjectDataType({
            name: 'SomeNestedName',
            description: 'Just some description',
            attributes: {
              randomInput: {
                type: DataTypeString,
                description: 'One more description',
              },
            },
          }),
        },
      },
    });

    const attributes = objectDataType.getAttributes();
    const attributesAgain = objectDataType.getAttributes();

    expect(attributes).toEqual(attributesAgain);

    expect(attributes.id.type).toBe(DataTypeID);
    expect(attributes.name.type).toBe(DataTypeString);

    const attributesNested = (attributes.nested.type as Entity).getAttributes();

    expect(attributesNested.randomInput.type).toBe(DataTypeString);
  });

  describe('should have a list of attributes', () => {
    it('as a map', () => {
      const objectDataType = new ObjectDataType({
        name: 'SomeName',
        description: 'Just some description',
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

      const attributes = objectDataType.getAttributes();

      expect(attributes.id.type).toBe(DataTypeID);
      expect(attributes.name.type).toBe(DataTypeString);
    });

    it('as a function returning a map', () => {
      const objectDataType = new ObjectDataType({
        name: 'SomeName',
        description: 'Just some description',
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

      const attributes = objectDataType.getAttributes();

      expect(attributes.id.type).toBe(DataTypeID);
      expect(attributes.name.type).toBe(DataTypeString);
    });
  });

  describe('isObjectDataType', () => {
    it('should recognize objects of type ObjectDataType', () => {
      const objectDataType = new ObjectDataType({
        name: 'someObjectDataTypeName',
        description: 'Just some description',
        attributes: {},
      });

      function fn() {
        passOrThrow(
          isObjectDataType(objectDataType),
          () => 'This error will never happen',
        );
      }

      expect(fn).not.toThrow();
    });

    it('should recognize non-DataType objects', () => {
      function fn() {
        passOrThrow(
          isObjectDataType({}) ||
            isObjectDataType(function test() {}) ||
            isObjectDataType(Error),
          () => 'Not a DataType object',
        );
      }

      expect(fn).toThrowErrorMatchingSnapshot();
    });
  });
});
