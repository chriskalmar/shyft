import './setupAndTearDown';
import { testGraphql } from './db';
import { asAnonymous, asUser } from './testUtils';
import { gql } from '../src/graphqlProtocol/util';

describe('permission', () => {
  describe('story', () => {
    const findBoardsQuery = gql`
      query allBoards($boardFilter: BoardFilter) {
        allBoards(orderBy: [ID_ASC], first: 100, filter: $boardFilter) {
          edges {
            node {
              id
              name
              owner
              isPrivate
              metaData {
                description
              }
              mods
              updatedBy
            }
          }
          resultCount
        }
      }
    `;

    it('a user should only see public boards and boards the user was invited to', async () => {
      const result1 = await testGraphql(findBoardsQuery, asUser(46), {});
      expect(result1).toMatchSnapshot('boards | user 46');

      const result2 = await testGraphql(findBoardsQuery, asUser(69), {});
      expect(result2).toMatchSnapshot('boards | user 69');

      const result3 = await testGraphql(findBoardsQuery, asUser(40), {});
      expect(result3).toMatchSnapshot('boards | user 40');

      const result4 = await testGraphql(findBoardsQuery, asUser(46), {
        boardFilter: {
          isPrivate: true,
        },
      });
      expect(result4).toMatchSnapshot('private boards | user 46');

      const result5 = await testGraphql(findBoardsQuery, asUser(69), {
        boardFilter: {
          isPrivate: true,
        },
      });
      expect(result5).toMatchSnapshot('private boards | user 69');

      const result6 = await testGraphql(findBoardsQuery, asUser(40), {
        boardFilter: {
          isPrivate: true,
        },
      });
      expect(result6).toMatchSnapshot('private boards | user 40');
    });

    const findBoardMembersQuery = gql`
      query allBoardMembers($boardMemberFilter: BoardMemberFilter) {
        allBoardMembers(
          orderBy: [ID_ASC]
          first: 100
          filter: $boardMemberFilter
        ) {
          edges {
            node {
              id
              inviter
              invitee
              board
              state
            }
          }
          resultCount
          totalCount
        }
      }
    `;

    it('a user should only see members of boards the user is part of', async () => {
      const result1 = await testGraphql(findBoardMembersQuery, asUser(46), {});
      expect(result1).toMatchSnapshot('board members | user 46');

      const result2 = await testGraphql(findBoardMembersQuery, asUser(69), {});
      expect(result2).toMatchSnapshot('board members | user 69');

      const result3 = await testGraphql(findBoardMembersQuery, asUser(40), {});
      expect(result3).toMatchSnapshot('board members | user 40');

      const result4 = await testGraphql(findBoardMembersQuery, asUser(46), {
        boardMemberFilter: {
          invitee__ne: 46,
        },
      });
      expect(result4).toMatchSnapshot('board members w/o self | user 46');

      const result5 = await testGraphql(findBoardMembersQuery, asUser(69), {
        boardMemberFilter: {
          invitee__ne: 69,
        },
      });
      expect(result5).toMatchSnapshot('board members w/o self | user 69');

      const result6 = await testGraphql(findBoardMembersQuery, asUser(40), {
        boardMemberFilter: {
          invitee__ne: 40,
        },
      });
      expect(result6).toMatchSnapshot('board members w/o self | user 40');
    });

    const joinCache = [];

    const joinBoardMemberMutation = gql`
      mutation joinBoardMember($input: JoinBoardMemberInput!) {
        joinBoardMember(input: $input) {
          boardMember {
            id
            board
            inviter
            invitee
            state
          }
        }
      }
    `;

    it('a user should be able to join public boards', async () => {
      const input = {
        boardMember: {
          board: 11,
        },
      };

      const result1 = await testGraphql(joinBoardMemberMutation, asUser(30), {
        input,
      });
      expect(result1).toMatchSnapshot('join | user 30');

      const result2 = await testGraphql(joinBoardMemberMutation, asUser(33), {
        input,
      });
      expect(result2).toMatchSnapshot('join | user 33');

      const result3 = await testGraphql(joinBoardMemberMutation, asUser(79), {
        input,
      });
      expect(result3).toMatchSnapshot('join | user 79');

      joinCache.push(result1.data.joinBoardMember.boardMember);
      joinCache.push(result2.data.joinBoardMember.boardMember);
      joinCache.push(result3.data.joinBoardMember.boardMember);
    });

    const leaveBoardMemberMutation = gql`
      mutation leaveBoardMember($input: LeaveBoardMemberByIdInput!) {
        leaveBoardMemberById(input: $input) {
          deleteRowCount
          id
        }
      }
    `;

    it('a user should be able to leave public boards', async () => {
      const { invitee, id } = joinCache[0];

      const result = await testGraphql(
        leaveBoardMemberMutation,
        asUser(invitee),
        {
          input: {
            id,
          },
        },
      );

      expect(result).toMatchSnapshot();
    });

    it("a user should not be able to leave public boards on someone's behalf", async () => {
      const otherUser = '50';
      const { id } = joinCache[1];

      const result = await testGraphql(
        leaveBoardMemberMutation,
        asUser(otherUser),
        {
          input: {
            id,
          },
        },
      );

      expect(result).toMatchSnapshot();
    });

    const removeBoardMemberMutation = gql`
      mutation removeBoardMember($input: RemoveBoardMemberByIdInput!) {
        removeBoardMemberById(input: $input) {
          deleteRowCount
          id
        }
      }
    `;

    it('a user should not be able to remove a user from a group as a non-owner', async () => {
      const notOwner = '50';
      const { id } = joinCache[1];

      const result = await testGraphql(
        removeBoardMemberMutation,
        asUser(notOwner),
        {
          input: {
            id,
          },
        },
      );

      expect(result).toMatchSnapshot();
    });

    it('a user should be able to remove a user from a group as owner', async () => {
      const owner = 81;
      const { id } = joinCache[1];

      const result = await testGraphql(
        removeBoardMemberMutation,
        asUser(owner),
        {
          input: {
            id,
          },
        },
      );

      expect(result).toMatchSnapshot();
    });

    it('a user should not be able to join private boards', async () => {
      const input = { boardMember: { board: 45 } };

      const result1 = await testGraphql(joinBoardMemberMutation, asUser(30), {
        input,
      });
      expect(result1).toMatchSnapshot('join | user 30');

      const result2 = await testGraphql(joinBoardMemberMutation, asUser(33), {
        input,
      });
      expect(result2).toMatchSnapshot('join | user 33');

      const result3 = await testGraphql(joinBoardMemberMutation, asUser(79), {
        input,
      });
      expect(result3).toMatchSnapshot('join | user 79');
    });

    const inviteBoardMemberMutation = gql`
      mutation inviteBoardMember($input: InviteBoardMemberInput!) {
        inviteBoardMember(input: $input) {
          boardMember {
            id
            board
            inviter
            invitee
            state
          }
        }
      }
    `;

    it('a user should not be able to invite users to others boards', async () => {
      const inviter = 10;

      const result1 = await testGraphql(
        inviteBoardMemberMutation,
        asUser(inviter),
        {
          input: {
            boardMember: {
              board: 45,
              invitee: 30,
            },
          },
        },
      );
      expect(result1).toMatchSnapshot('invite | user 30');

      const result2 = await testGraphql(
        inviteBoardMemberMutation,
        asUser(inviter),
        {
          input: {
            boardMember: {
              board: 45,
              invitee: 33,
            },
          },
        },
      );
      expect(result2).toMatchSnapshot('invite | user 33');

      const result3 = await testGraphql(
        inviteBoardMemberMutation,
        asUser(inviter),
        {
          input: {
            boardMember: {
              board: 45,
              invitee: 79,
            },
          },
        },
      );
      expect(result3).toMatchSnapshot('invite | user 79');
    });

    const invitesCache = [];

    it('a user should be able to invite users to an owned boards', async () => {
      const inviter = 85;

      const result1 = await testGraphql(
        inviteBoardMemberMutation,
        asUser(inviter),
        {
          input: {
            boardMember: {
              board: 45,
              invitee: 30,
            },
          },
        },
      );
      expect(result1).toMatchSnapshot('invite | user 30');

      const result2 = await testGraphql(
        inviteBoardMemberMutation,
        asUser(inviter),
        {
          input: {
            boardMember: {
              board: 45,
              invitee: 33,
            },
          },
        },
      );
      expect(result2).toMatchSnapshot('invite | user 33');

      const result3 = await testGraphql(
        inviteBoardMemberMutation,
        asUser(inviter),
        {
          input: {
            boardMember: {
              board: 45,
              invitee: 79,
            },
          },
        },
      );
      expect(result3).toMatchSnapshot('invite | user 79');

      invitesCache.push(result1.data.inviteBoardMember.boardMember);
      invitesCache.push(result2.data.inviteBoardMember.boardMember);
      invitesCache.push(result3.data.inviteBoardMember.boardMember);
    });

    const acceptBoardMemberMutation = gql`
      mutation acceptBoardMember($input: AcceptBoardMemberByIdInput!) {
        acceptBoardMemberById(input: $input) {
          boardMember {
            id
            board
            inviter
            invitee
            state
          }
        }
      }
    `;

    it('a user should be able to accept invitations to private boards', async () => {
      const { invitee, id } = invitesCache[0];

      const result = await testGraphql(
        acceptBoardMemberMutation,
        asUser(invitee),
        {
          input: {
            id,
          },
        },
      );

      expect(result).toMatchSnapshot();
    });

    it("a user should not be able to accept invitations to private boards on someone's behalf", async () => {
      const otherUser = '50';
      const { id } = joinCache[1];

      const result = await testGraphql(
        acceptBoardMemberMutation,
        asUser(otherUser),
        {
          input: {
            id,
          },
        },
      );

      expect(result).toMatchSnapshot();
    });

    it('an anonymous user should be able to see all books', async () => {
      const result = await testGraphql(
        gql`
          query allBooks {
            allBooks(orderBy: [ID_ASC]) {
              edges {
                node {
                  id
                  author
                  title_i18n {
                    en
                    de
                  }
                  shortSummary
                }
              }
            }
          }
        `,
        asAnonymous(),
      );

      expect(result).toMatchSnapshot();
    });
  });
});
