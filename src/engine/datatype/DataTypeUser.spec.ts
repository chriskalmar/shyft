import { DataTypeUser, isDataTypeUser } from './DataTypeUser';

import { passOrThrow } from '../util';

describe('DataTypeUser', () => {
  describe('isDataTypeUser', () => {
    it('should recognize objects of type DataTypeUser', () => {
      const dataTypeUser = new DataTypeUser({
        name: 'user',
        description: 'some description',
        mock() {},
      });

      function fn() {
        passOrThrow(
          isDataTypeUser(dataTypeUser),
          () => 'This error will never happen',
        );
      }

      expect(fn).not.toThrow();
    });

    it('should recognize non-DataTypeUser objects', () => {
      function fn() {
        passOrThrow(
          isDataTypeUser({}) ||
            isDataTypeUser(function test() {}) ||
            isDataTypeUser(Error),
          () => 'Not a DataType object',
        );
      }

      expect(fn).toThrowErrorMatchingSnapshot();
    });
  });
});
