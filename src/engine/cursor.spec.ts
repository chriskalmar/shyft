import { Entity } from './entity/Entity';
import { Index, INDEX_UNIQUE } from './index/Index';

import { processCursor, CursorType } from './cursor';

import { DataTypeString } from './datatype/dataTypes';

describe('cursor', () => {
  describe('processCursor', () => {
    const SomeEntity = new Entity({
      name: 'SomeEntity',
      description: 'Just some description',
      attributes: {
        loginName: {
          type: DataTypeString,
          description: 'Just some description',
          required: true,
        },
        firstName: {
          type: DataTypeString,
          description: 'Just some description',
          required: true,
        },
        lastName: {
          type: DataTypeString,
          description: 'Just some description',
          required: true,
        },
        email: {
          type: DataTypeString,
          description: 'Just some description',
          required: true,
        },
      },
      indexes: [
        new Index({
          type: INDEX_UNIQUE,
          attributes: ['loginName'],
        }),
        new Index({
          type: INDEX_UNIQUE,
          attributes: ['firstName', 'lastName'],
        }),
        new Index({
          type: INDEX_UNIQUE,
          attributes: ['email'],
        }),
      ],
    });

    SomeEntity.getIndexes();

    it('should return empty clause if no cursor provided', () => {
      const result = processCursor();

      expect(result).toEqual({});
    });

    it('should throw if incompatible cursor provided', () => {
      function fn() {
        processCursor({} as Entity, { a: 'b' as any });
      }

      expect(fn).toThrowErrorMatchingSnapshot();
    });

    it('should throw if cursor is malformed', () => {
      function fn1() {
        processCursor(SomeEntity, { SomeEntity: ['b' as any] }, []);
      }

      function fn2() {
        processCursor(SomeEntity, { SomeEntity: [[{}, {}, {}] as any] }, []);
      }

      function fn3() {
        processCursor(SomeEntity, { SomeEntity: [{} as any] }, []);
      }

      expect(fn1).toThrowErrorMatchingSnapshot();
      expect(fn2).toThrowErrorMatchingSnapshot();
      expect(fn3).toThrowErrorMatchingSnapshot();
    });

    it('should throw if unknown attribute is used', () => {
      function fn() {
        processCursor(
          SomeEntity,
          {
            SomeEntity: [['iDontKnow', 123]],
          },
          [],
        );
      }

      expect(fn).toThrowErrorMatchingSnapshot();
    });

    it('should throw if an attribute is used which the data set is not sorted by', () => {
      function fn1() {
        processCursor(SomeEntity, {
          SomeEntity: [['loginName', 123]],
        });
      }

      function fn2() {
        processCursor(
          SomeEntity,
          {
            SomeEntity: [['loginName', 123]],
          },
          [
            {
              attribute: 'a',
              direction: 'ASC',
            },
          ],
        );
      }

      function fn3() {
        processCursor(
          SomeEntity,
          {
            SomeEntity: [
              ['loginName', 123],
              ['email', 123],
            ],
          },
          [
            {
              attribute: 'loginName',
              direction: 'ASC',
            },
          ],
        );
      }

      expect(fn1).toThrowErrorMatchingSnapshot();
      expect(fn2).toThrowErrorMatchingSnapshot();
      expect(fn3).toThrowErrorMatchingSnapshot();
    });

    it('should throw if none of the attributes are defined as unique', () => {
      function fn1() {
        processCursor(
          SomeEntity,
          {
            SomeEntity: [['firstName', 'John']],
          },
          [
            {
              attribute: 'firstName',
              direction: 'ASC',
            },
          ],
        );
      }

      function fn2() {
        processCursor(
          SomeEntity,
          {
            SomeEntity: [
              ['firstName', 'John'],
              ['lastName', 'Snow'],
            ],
          },
          [
            {
              attribute: 'firstName',
              direction: 'ASC',
            },
            {
              attribute: 'lastName',
              direction: 'ASC',
            },
          ],
        );
      }

      expect(fn1).toThrowErrorMatchingSnapshot();
      expect(fn2).toThrowErrorMatchingSnapshot();
    });

    describe('should return a filter clause based on the provided cursor', () => {
      it('when using attributes that are defined as unique', () => {
        const cursor1 = processCursor(
          SomeEntity,
          {
            SomeEntity: [['loginName', 'user1']],
          },
          [
            {
              attribute: 'loginName',
              direction: 'ASC',
            },
          ],
        );

        const result1 = {
          loginName: {
            $gt: 'user1',
          },
        };

        const cursor2 = processCursor(
          SomeEntity,
          {
            SomeEntity: [['loginName', 123]],
          },
          [
            {
              attribute: 'loginName',
              direction: 'DESC',
            },
          ],
        );

        const result2 = {
          loginName: {
            $lt: 123,
          },
        };

        const cursor3 = processCursor(
          SomeEntity,
          {
            SomeEntity: [
              ['loginName', 'user1'],
              ['email', 'user1@example.com'],
            ],
          },
          [
            {
              attribute: 'email',
              direction: 'ASC',
            },
            {
              attribute: 'loginName',
              direction: 'DESC',
            },
          ],
        );

        const result3 = {
          loginName: {
            $lt: 'user1',
          },
        };

        expect(cursor1).toEqual(result1);
        expect(cursor2).toEqual(result2);
        expect(cursor3).toEqual(result3);
      });

      it('when using attributes that are not all defined as unique', () => {
        const row1: CursorType = {
          SomeEntity: [
            ['firstName', 'John'],
            ['id', 1123],
          ],
        };

        const cursor1 = processCursor(SomeEntity, row1, [
          {
            attribute: 'firstName',
            direction: 'ASC',
          },
          {
            attribute: 'id',
            direction: 'ASC',
          },
        ]);

        const result1 = {
          firstName: {
            $gte: 'John',
          },
          $not: {
            id: {
              $lte: 1123,
            },
            firstName: 'John',
          },
        };

        const cursor2 = processCursor(SomeEntity, row1, [
          {
            attribute: 'firstName',
            direction: 'ASC',
          },
          {
            attribute: 'id',
            direction: 'DESC',
          },
        ]);

        const result2 = {
          firstName: {
            $gte: 'John',
          },
          $not: {
            id: {
              $gte: 1123,
            },
            firstName: 'John',
          },
        };

        const cursor3 = processCursor(SomeEntity, row1, [
          {
            attribute: 'firstName',
            direction: 'DESC',
          },
          {
            attribute: 'id',
            direction: 'DESC',
          },
        ]);

        const result3 = {
          firstName: {
            $lte: 'John',
          },
          $not: {
            id: {
              $gte: 1123,
            },
            firstName: 'John',
          },
        };

        const cursor4 = processCursor(SomeEntity, row1, [
          {
            attribute: 'firstName',
            direction: 'DESC',
          },
          {
            attribute: 'id',
            direction: 'ASC',
          },
        ]);

        const result4 = {
          firstName: {
            $lte: 'John',
          },
          $not: {
            id: {
              $lte: 1123,
            },
            firstName: 'John',
          },
        };

        const row2: CursorType = {
          SomeEntity: [
            ['firstName', 'John'],
            ['lastName', 'Snow'],
            ['id', 1123],
          ],
        };

        const cursor5 = processCursor(SomeEntity, row2, [
          {
            attribute: 'firstName',
            direction: 'ASC',
          },
          {
            attribute: 'lastName',
            direction: 'ASC',
          },
          {
            attribute: 'id',
            direction: 'ASC',
          },
        ]);

        const result5 = {
          firstName: {
            $gte: 'John',
          },
          $not: {
            id: {
              $lte: 1123,
            },
            firstName: 'John',
          },
        };

        const cursor6 = processCursor(SomeEntity, row2, [
          {
            attribute: 'firstName',
            direction: 'ASC',
          },
          {
            attribute: 'lastName',
            direction: 'DESC',
          },
          {
            attribute: 'id',
            direction: 'DESC',
          },
        ]);

        const result6 = {
          firstName: {
            $gte: 'John',
          },
          $not: {
            id: {
              $gte: 1123,
            },
            firstName: 'John',
          },
        };

        const row3: CursorType = {
          SomeEntity: [
            ['firstName', 'John'],
            ['email', 'john@example.com'],
            ['lastName', 'Snow'],
            ['id', 1123],
          ],
        };

        const cursor7 = processCursor(SomeEntity, row3, [
          {
            attribute: 'firstName',
            direction: 'ASC',
          },
          {
            attribute: 'email',
            direction: 'DESC',
          },
          {
            attribute: 'lastName',
            direction: 'DESC',
          },
          {
            attribute: 'id',
            direction: 'DESC',
          },
        ]);

        const result7 = {
          firstName: {
            $gte: 'John',
          },
          $not: {
            email: {
              $gte: 'john@example.com',
            },
            firstName: 'John',
          },
        };

        expect(cursor1).toEqual(result1);
        expect(cursor2).toEqual(result2);
        expect(cursor3).toEqual(result3);
        expect(cursor4).toEqual(result4);
        expect(cursor5).toEqual(result5);
        expect(cursor6).toEqual(result6);
        expect(cursor7).toEqual(result7);
      });

      it('when using in reverse mode', () => {
        const cursor0 = processCursor(
          SomeEntity,
          {
            SomeEntity: [['loginName', 123]],
          },
          [
            {
              attribute: 'loginName',
              direction: 'DESC',
            },
          ],
          true,
        );

        const result0 = {
          loginName: {
            $gt: 123,
          },
        };

        const row1: CursorType = {
          SomeEntity: [
            ['firstName', 'John'],
            ['id', 1123],
          ],
        };

        const cursor1 = processCursor(
          SomeEntity,
          row1,
          [
            {
              attribute: 'firstName',
              direction: 'ASC',
            },
            {
              attribute: 'id',
              direction: 'ASC',
            },
          ],
          true,
        );

        const result1 = {
          firstName: {
            $lte: 'John',
          },
          $not: {
            id: {
              $gte: 1123,
            },
            firstName: 'John',
          },
        };

        const cursor2 = processCursor(
          SomeEntity,
          row1,
          [
            {
              attribute: 'firstName',
              direction: 'ASC',
            },
            {
              attribute: 'id',
              direction: 'DESC',
            },
          ],
          true,
        );

        const result2 = {
          firstName: {
            $lte: 'John',
          },
          $not: {
            id: {
              $lte: 1123,
            },
            firstName: 'John',
          },
        };

        const cursor3 = processCursor(
          SomeEntity,
          row1,
          [
            {
              attribute: 'firstName',
              direction: 'DESC',
            },
            {
              attribute: 'id',
              direction: 'DESC',
            },
          ],
          true,
        );

        const result3 = {
          firstName: {
            $gte: 'John',
          },
          $not: {
            id: {
              $lte: 1123,
            },
            firstName: 'John',
          },
        };

        const cursor4 = processCursor(
          SomeEntity,
          row1,
          [
            {
              attribute: 'firstName',
              direction: 'DESC',
            },
            {
              attribute: 'id',
              direction: 'ASC',
            },
          ],
          true,
        );

        const result4 = {
          firstName: {
            $gte: 'John',
          },
          $not: {
            id: {
              $gte: 1123,
            },
            firstName: 'John',
          },
        };

        const row2: CursorType = {
          SomeEntity: [
            ['firstName', 'John'],
            ['lastName', 'Snow'],
            ['id', 1123],
          ],
        };

        const cursor5 = processCursor(
          SomeEntity,
          row2,
          [
            {
              attribute: 'firstName',
              direction: 'ASC',
            },
            {
              attribute: 'lastName',
              direction: 'ASC',
            },
            {
              attribute: 'id',
              direction: 'ASC',
            },
          ],
          true,
        );

        const result5 = {
          firstName: {
            $lte: 'John',
          },
          $not: {
            id: {
              $gte: 1123,
            },
            firstName: 'John',
          },
        };

        const cursor6 = processCursor(
          SomeEntity,
          row2,
          [
            {
              attribute: 'firstName',
              direction: 'ASC',
            },
            {
              attribute: 'lastName',
              direction: 'DESC',
            },
            {
              attribute: 'id',
              direction: 'DESC',
            },
          ],
          true,
        );

        const result6 = {
          firstName: {
            $lte: 'John',
          },
          $not: {
            id: {
              $lte: 1123,
            },
            firstName: 'John',
          },
        };

        const row3: CursorType = {
          SomeEntity: [
            ['firstName', 'John'],
            ['email', 'john@example.com'],
            ['lastName', 'Snow'],
            ['id', 1123],
          ],
        };

        const cursor7 = processCursor(
          SomeEntity,
          row3,
          [
            {
              attribute: 'firstName',
              direction: 'ASC',
            },
            {
              attribute: 'email',
              direction: 'DESC',
            },
            {
              attribute: 'lastName',
              direction: 'DESC',
            },
            {
              attribute: 'id',
              direction: 'DESC',
            },
          ],
          true,
        );

        const result7 = {
          firstName: {
            $lte: 'John',
          },
          $not: {
            email: {
              $lte: 'john@example.com',
            },
            firstName: 'John',
          },
        };

        expect(cursor0).toEqual(result0);
        expect(cursor1).toEqual(result1);
        expect(cursor2).toEqual(result2);
        expect(cursor3).toEqual(result3);
        expect(cursor4).toEqual(result4);
        expect(cursor5).toEqual(result5);
        expect(cursor6).toEqual(result6);
        expect(cursor7).toEqual(result7);
      });
    });
  });
});
