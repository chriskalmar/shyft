import { passOrThrow, isArray } from './util';
import { Entity } from './entity/Entity';

export type FilterType = [string, any];

export type OrderType = {
  attribute: string;
  direction: 'ASC' | 'DESC';
};

export type CursorType = {
  [key: string]: FilterType[];
};

export const processCursor = (
  entity?: Entity,
  cursor?: CursorType,
  orderBy?: OrderType[],
  reverse?: boolean,
) => {
  const $LT = reverse ? '$gt' : '$lt';
  const $GT = reverse ? '$lt' : '$gt';
  const $LTE = reverse ? '$gte' : '$lte';
  const $GTE = reverse ? '$lte' : '$gte';

  const where: any = {};

  if (entity && cursor) {
    passOrThrow(
      isArray(cursor[entity.name]),
      () => 'Incompatible cursor for this entity',
    );

    passOrThrow(
      isArray(orderBy),
      () => 'orderBy needs to be an array of order definitions',
    );

    const orderList = [];

    const orderMap = {};
    orderBy.map(({ attribute, direction }) => {
      passOrThrow(
        attribute && direction,
        () =>
          'orderBy needs to be an array of attributes and respective sort order',
      );

      orderMap[attribute] = direction;
    });

    const primaryAttribute = entity.getPrimaryAttribute();
    const attributes = entity.getAttributes();

    let foundUniqueAttribute = false;

    cursor[entity.name].map(filter => {
      if (filter.length !== 2) {
        throw new Error('Cursor malformed');
      }

      const attributeName = filter[0];

      passOrThrow(
        attributes[attributeName],
        () => `Unknown attribute '${attributeName}' used in cursor`,
      );

      if (attributeName !== primaryAttribute.name) {
        passOrThrow(
          orderMap[attributeName],
          () =>
            `Cursor works only on sorted attributes (check: '${attributeName}')`,
        );
      }

      const attribute = attributes[attributeName];

      // limit where clause to the first attribute which is defined as unique
      if (!foundUniqueAttribute) {
        orderList.push(attributeName);
      }

      if (attribute.unique || attributeName === primaryAttribute.name) {
        foundUniqueAttribute = true;
      }
    });

    passOrThrow(
      foundUniqueAttribute,
      () => 'Cursor needs to have at least one attribute defined as unique',
    );

    // if more than 2 attributes are used for the cursor take only the first and the last (primary key)
    if (orderList.length > 2) {
      orderList.splice(1, orderList.length - 2);
    }

    // simple filter for single attributes
    if (orderList.length === 1) {
      const attributeName = orderList[0];
      const value = cursor[entity.name][0][1];

      if (orderMap[attributeName] === 'DESC') {
        where[attributeName] = {
          [$LT]: value,
        };
      } else {
        where[attributeName] = {
          [$GT]: value,
        };
      }
    } else {
      where.$not = {};

      cursor[entity.name].map(filter => {
        const attributeName = filter[0];
        const value = filter[1];

        // ignore attributes that obsolete due to prior unique attribute
        if (orderList.indexOf(attributeName) === -1) {
          return;
        }

        const attribute = attributes[attributeName];

        if (attribute.unique) {
          if (orderMap[attributeName] === 'DESC') {
            where.$not[attributeName] = {
              [$GTE]: value,
            };
          } else {
            where.$not[attributeName] = {
              [$LTE]: value,
            };
          }
        } else {
          where.$not[attributeName] = value;

          if (orderMap[attributeName] === 'DESC') {
            where[attributeName] = {
              [$LTE]: value,
            };
          } else {
            where[attributeName] = {
              [$GTE]: value,
            };
          }
        }
      });
    }
  }

  return where;
};

export const processCursors = (entity?: Entity, args?: any) => {
  const { after, before } = args;

  const where = {
    $and: [
      processCursor(entity, after, args.orderBy),
      processCursor(entity, before, args.orderBy, true),
    ],
  };

  return where;
};
