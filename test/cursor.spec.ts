import './setupAndTearDown';
import { find, testGraphql } from './db';

import { asAdmin, removeListDynamicData } from './testUtils';

import { Profile } from './models/Profile';
import { Message } from './models/Message';
import { gql } from '../src/graphqlProtocol/util';

const orderByUsernameAsc = {
  orderBy: [
    {
      attribute: 'username',
      direction: 'ASC',
    },
  ],
};

const orderByUsernameDesc = {
  orderBy: [
    {
      attribute: 'username',
      direction: 'DESC',
    },
  ],
};

const orderByWrittenAtAsc = {
  orderBy: [
    {
      attribute: 'writtenAt',
      direction: 'ASC',
    },
  ],
};

const orderByWrittenAtDesc = {
  orderBy: [
    {
      attribute: 'writtenAt',
      direction: 'DESC',
    },
  ],
};

describe('cursor', () => {
  describe('via connector', () => {
    it('after', async () => {
      const cursor = {
        after: {
          Profile: [
            ['username', 'amalia943'],
            ['id', 65],
          ],
        },
      };

      const result = await find(
        Profile,
        { ...orderByUsernameAsc, ...cursor },
        asAdmin(),
      );
      result.data = removeListDynamicData(Profile, result.data);

      expect(result).toMatchSnapshot();
    });

    it('before', async () => {
      const cursor = {
        before: {
          Profile: [
            ['username', 'amalia943'],
            ['id', 65],
          ],
        },
      };

      const result = await find(
        Profile,
        { ...orderByUsernameAsc, ...cursor },
        asAdmin(),
      );
      result.data = removeListDynamicData(Profile, result.data);

      expect(result).toMatchSnapshot();
    });

    it('after + filter', async () => {
      const cursor = {
        after: {
          Profile: [
            ['username', 'ella377'],
            ['id', 103],
          ],
        },
      };

      const filter = {
        username: {
          $starts_with: 'e',
          $not_ends_with: '3',
        },
      };

      const result = await find(
        Profile,
        { ...orderByUsernameAsc, ...cursor, filter, first: 4 },
        asAdmin(),
      );
      result.data = removeListDynamicData(Profile, result.data);

      expect(result).toMatchSnapshot();
    });

    it('before + filter', async () => {
      const cursor = {
        before: {
          Profile: [
            ['username', 'emilia189'],
            ['id', 90],
          ],
        },
      };

      const filter = {
        username: {
          $starts_with: 'e',
          $not_ends_with: '3',
        },
      };

      const result = await find(
        Profile,
        { ...orderByUsernameAsc, ...cursor, filter, first: 4 },
        asAdmin(),
      );
      result.data = removeListDynamicData(Profile, result.data);

      expect(result).toMatchSnapshot();
    });

    it('after + before + filter + offset', async () => {
      const cursor = {
        after: {
          Profile: [
            ['username', 'estell684'],
            ['id', 70],
          ],
        },
        before: {
          Profile: [
            ['username', 'edward969'],
            ['id', 8],
          ],
        },
      };

      const filter = {
        username: {
          $starts_with: 'e',
          $not_ends_with: '3',
        },
      };

      let result;

      result = await find(
        Profile,
        { ...orderByUsernameDesc, ...cursor, filter, offset: 3, first: 2 },
        asAdmin(),
      );
      result.data = removeListDynamicData(Profile, result.data);
      expect(result).toMatchSnapshot();

      result = await find(
        Profile,
        { ...orderByUsernameDesc, ...cursor, filter, offset: 3, last: 2 },
        asAdmin(),
      );
      result.data = removeListDynamicData(Profile, result.data);
      expect(result).toMatchSnapshot();
    });

    it('mutli-key after + before', async () => {
      const orderByNames = {
        orderBy: [
          {
            attribute: 'firstname',
            direction: 'ASC',
          },
          {
            attribute: 'lastname',
            direction: 'DESC',
          },
          {
            attribute: 'id',
            direction: 'ASC',
          },
        ],
      };

      const cursor = {
        after: {
          Profile: [
            ['firstname', 'Joe'],
            ['lastname', 'Ratke'],
            ['id', 104],
          ],
        },
        before: {
          Profile: [
            ['firstname', 'Jose'],
            ['lastname', 'Leffler'],
            ['id', 71],
          ],
        },
      };

      const filter = {
        username: {
          $starts_with: 'jo',
        },
      };

      const result = await find(
        Profile,
        { ...orderByNames, ...cursor, filter },
        asAdmin(),
      );
      result.data = removeListDynamicData(Profile, result.data);
      expect(result).toMatchSnapshot();
    });

    it('time-based after + first', async () => {
      const differentiatorId = [7, 40, 20];

      await Promise.all(
        differentiatorId.map(async (id) => {
          const cursor = {
            after: {
              Message: [
                ['writtenAt', '2018-03-26 20:47:46.578Z'],
                ['id', id],
              ],
            },
          };

          const result = await find(
            Message,
            { ...orderByWrittenAtDesc, ...cursor, first: 6 },
            asAdmin(),
          );
          result.data = removeListDynamicData(Message, result.data);
          expect(result).toMatchSnapshot(`id: ${id}`);
        }),
      );
    });

    it('time-based before + last', async () => {
      const differentiatorId = [7, 40, 20];

      await Promise.all(
        differentiatorId.map(async (id) => {
          const cursor = {
            before: {
              Message: [
                ['writtenAt', '2018-03-26 20:47:46.578Z'],
                ['id', id],
              ],
            },
          };

          const result = await find(
            Message,
            { ...orderByWrittenAtAsc, ...cursor, last: 6 },
            asAdmin(),
          );
          result.data = removeListDynamicData(Message, result.data);
          expect(result).toMatchSnapshot(`id: ${id}`);
        }),
      );
    });
  });

  describe('via GrahpQL', () => {
    const findProfilesQuery = gql`
      query allProfiles(
        $profileFilter: ProfileFilter
        $after: Cursor
        $before: Cursor
        $first: Int
        $last: Int
        $offset: Int
        $orderBy: [ProfileOrderBy]
      ) {
        allProfiles(
          filter: $profileFilter
          after: $after
          before: $before
          first: $first
          last: $last
          offset: $offset
          orderBy: $orderBy
        ) {
          totalCount
          resultCount
          edges {
            cursor
            node {
              id
              username
              firstname
              lastname
            }
          }
        }
      }
    `;

    it('after', async () => {
      const foundProfile = await testGraphql(findProfilesQuery, asAdmin(), {
        orderBy: ['USERNAME_ASC'],
        profileFilter: {
          username: 'amalia943',
        },
      });

      expect(foundProfile).toMatchSnapshot('found');

      const cursor = foundProfile.data.allProfiles.edges[0].cursor;

      const result = await testGraphql(findProfilesQuery, asAdmin(), {
        orderBy: ['USERNAME_ASC'],
        after: cursor,
      });

      expect(result).toMatchSnapshot('result');
    });

    it('before', async () => {
      const foundProfile = await testGraphql(findProfilesQuery, asAdmin(), {
        orderBy: ['USERNAME_ASC'],
        profileFilter: {
          username: 'amalia943',
        },
      });

      expect(foundProfile).toMatchSnapshot('found');

      const cursor = foundProfile.data.allProfiles.edges[0].cursor;

      const result = await testGraphql(findProfilesQuery, asAdmin(), {
        orderBy: ['USERNAME_ASC'],
        before: cursor,
      });

      expect(result).toMatchSnapshot('result');
    });

    it('after + filter', async () => {
      const foundProfile = await testGraphql(findProfilesQuery, asAdmin(), {
        orderBy: ['USERNAME_ASC'],
        profileFilter: {
          username: 'ella377',
        },
      });

      expect(foundProfile).toMatchSnapshot('found');

      const cursor = foundProfile.data.allProfiles.edges[0].cursor;

      const result = await testGraphql(findProfilesQuery, asAdmin(), {
        orderBy: ['USERNAME_ASC'],
        after: cursor,
        first: 4,
        profileFilter: {
          username__starts_with: 'e',
          username__not_ends_with: '3',
        },
      });

      expect(result).toMatchSnapshot('result');
    });

    it('before + filter', async () => {
      const foundProfile = await testGraphql(findProfilesQuery, asAdmin(), {
        orderBy: ['USERNAME_ASC'],
        profileFilter: {
          username: 'emilia189',
        },
      });

      expect(foundProfile).toMatchSnapshot('found');

      const cursor = foundProfile.data.allProfiles.edges[0].cursor;

      const result = await testGraphql(findProfilesQuery, asAdmin(), {
        orderBy: ['USERNAME_ASC'],
        before: cursor,
        first: 4,
        profileFilter: {
          username__starts_with: 'e',
          username__not_ends_with: '3',
        },
      });

      expect(result).toMatchSnapshot('result');
    });

    it('after + before + filter + offset', async () => {
      const foundProfileAfter = await testGraphql(
        findProfilesQuery,
        asAdmin(),
        {
          orderBy: ['USERNAME_DESC'],
          profileFilter: {
            username: 'estell684',
          },
        },
      );

      expect(foundProfileAfter).toMatchSnapshot('found after');

      const cursorAfter = foundProfileAfter.data.allProfiles.edges[0].cursor;

      const foundProfileBefore = await testGraphql(
        findProfilesQuery,
        asAdmin(),
        {
          orderBy: ['USERNAME_DESC'],
          profileFilter: {
            username: 'edward969',
          },
        },
      );

      expect(foundProfileBefore).toMatchSnapshot('found before');

      const cursorBefore = foundProfileBefore.data.allProfiles.edges[0].cursor;

      const result1 = await testGraphql(findProfilesQuery, asAdmin(), {
        orderBy: ['USERNAME_DESC'],
        after: cursorAfter,
        before: cursorBefore,
        first: 2,
        offset: 3,
        profileFilter: {
          username__starts_with: 'e',
          username__not_ends_with: '3',
        },
      });

      expect(result1).toMatchSnapshot('first');

      const result2 = await testGraphql(findProfilesQuery, asAdmin(), {
        orderBy: ['USERNAME_DESC'],
        after: cursorAfter,
        before: cursorBefore,
        last: 2,
        offset: 3,
        profileFilter: {
          username__starts_with: 'e',
          username__not_ends_with: '3',
        },
      });

      expect(result2).toMatchSnapshot('last');
    });

    it('mutli-key after + before', async () => {
      const foundProfileAfter = await testGraphql(
        findProfilesQuery,
        asAdmin(),
        {
          orderBy: ['FIRSTNAME_ASC', 'LASTNAME_DESC', 'ID_ASC'],
          profileFilter: {
            firstname: 'Joe',
            lastname: 'Ratke',
          },
        },
      );

      expect(foundProfileAfter).toMatchSnapshot('found after');

      const cursorAfter = foundProfileAfter.data.allProfiles.edges[0].cursor;

      const foundProfileBefore = await testGraphql(
        findProfilesQuery,
        asAdmin(),
        {
          orderBy: ['FIRSTNAME_ASC', 'LASTNAME_DESC', 'ID_ASC'],
          profileFilter: {
            firstname: 'Jose',
            lastname: 'Leffler',
          },
        },
      );

      expect(foundProfileBefore).toMatchSnapshot('found before');

      const cursorBefore = foundProfileBefore.data.allProfiles.edges[0].cursor;

      const result = await testGraphql(findProfilesQuery, asAdmin(), {
        orderBy: ['FIRSTNAME_ASC', 'LASTNAME_DESC', 'ID_ASC'],
        after: cursorAfter,
        before: cursorBefore,
        profileFilter: {
          username__starts_with: 'jo',
        },
      });

      expect(result).toMatchSnapshot('result');
    });

    const findMessagesQuery = gql`
      query allMessages(
        $messageFilter: MessageFilter
        $after: Cursor
        $before: Cursor
        $first: Int
        $last: Int
        $offset: Int
        $orderBy: [MessageOrderBy]
      ) {
        allMessages(
          filter: $messageFilter
          after: $after
          before: $before
          first: $first
          last: $last
          offset: $offset
          orderBy: $orderBy
        ) {
          totalCount
          resultCount
          edges {
            cursor
            node {
              id
              author
              board
              content
              writtenAt
            }
          }
        }
      }
    `;

    it('time-based after + first', async () => {
      const foundMessage1 = await testGraphql(findMessagesQuery, asAdmin(), {
        orderBy: ['WRITTEN_AT_DESC'],
        messageFilter: {
          id: 7,
        },
      });

      expect(foundMessage1).toMatchSnapshot('found 1');

      const cursor1 = foundMessage1.data.allMessages.edges[0].cursor;

      const result1 = await testGraphql(findMessagesQuery, asAdmin(), {
        orderBy: ['WRITTEN_AT_DESC'],
        after: cursor1,
        first: 6,
      });

      expect(result1).toMatchSnapshot('result 1');

      const foundMessage2 = await testGraphql(findMessagesQuery, asAdmin(), {
        orderBy: ['WRITTEN_AT_DESC'],
        messageFilter: {
          id: 40,
        },
      });

      expect(foundMessage2).toMatchSnapshot('found 2');

      const cursor2 = foundMessage2.data.allMessages.edges[0].cursor;

      const result2 = await testGraphql(findMessagesQuery, asAdmin(), {
        orderBy: ['WRITTEN_AT_DESC'],
        after: cursor2,
        first: 6,
      });

      expect(result2).toMatchSnapshot('result 2');

      const foundMessage3 = await testGraphql(findMessagesQuery, asAdmin(), {
        orderBy: ['WRITTEN_AT_DESC'],
        messageFilter: {
          id: 20,
        },
      });

      expect(foundMessage3).toMatchSnapshot('found 3');

      const cursor3 = foundMessage3.data.allMessages.edges[0].cursor;

      const result3 = await testGraphql(findMessagesQuery, asAdmin(), {
        orderBy: ['WRITTEN_AT_DESC'],
        after: cursor3,
        first: 6,
      });

      expect(result3).toMatchSnapshot('result 3');
    });

    it('time-based before + last', async () => {
      const foundMessage1 = await testGraphql(findMessagesQuery, asAdmin(), {
        orderBy: ['WRITTEN_AT_ASC'],
        messageFilter: {
          id: 7,
        },
      });

      expect(foundMessage1).toMatchSnapshot('found 1');

      const cursor1 = foundMessage1.data.allMessages.edges[0].cursor;

      const result1 = await testGraphql(findMessagesQuery, asAdmin(), {
        orderBy: ['WRITTEN_AT_ASC'],
        before: cursor1,
        last: 6,
      });

      expect(result1).toMatchSnapshot('result 1');

      const foundMessage2 = await testGraphql(findMessagesQuery, asAdmin(), {
        orderBy: ['WRITTEN_AT_ASC'],
        messageFilter: {
          id: 40,
        },
      });

      expect(foundMessage2).toMatchSnapshot('found 2');

      const cursor2 = foundMessage2.data.allMessages.edges[0].cursor;

      const result2 = await testGraphql(findMessagesQuery, asAdmin(), {
        orderBy: ['WRITTEN_AT_ASC'],
        before: cursor2,
        last: 6,
      });

      expect(result2).toMatchSnapshot('result 2');

      const foundMessage3 = await testGraphql(findMessagesQuery, asAdmin(), {
        orderBy: ['WRITTEN_AT_ASC'],
        messageFilter: {
          id: 20,
        },
      });

      expect(foundMessage3).toMatchSnapshot('found 3');

      const cursor3 = foundMessage3.data.allMessages.edges[0].cursor;

      const result3 = await testGraphql(findMessagesQuery, asAdmin(), {
        orderBy: ['WRITTEN_AT_ASC'],
        before: cursor3,
        last: 6,
      });

      expect(result3).toMatchSnapshot('result 3');
    });
  });
});
