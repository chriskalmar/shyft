import './setupAndTearDown';
import { asAdmin } from './testUtils';
import { testGraphql } from './db';
import { gql } from '../src/graphqlProtocol/util';

describe('view list', () => {
  it('orderBy', async () => {
    const result = await testGraphql(
      gql`
        query allBoardMemberViews {
          allBoardMemberViews(orderBy: [BOARD_ID_ASC, INVITER_ID_ASC]) {
            edges {
              node {
                boardId
                boardName
                inviterId
                username
                inviteCount
                invitees
              }
            }
            resultCount
            totalCount
            pageInfo {
              hasNextPage
              hasPreviousPage
            }
          }
        }
      `,
      asAdmin(),
    );

    expect(result).toMatchSnapshot();
  });

  it('orderBy + first', async () => {
    const result = await testGraphql(
      gql`
        query allBoardMemberViews {
          allBoardMemberViews(
            orderBy: [BOARD_ID_ASC, INVITER_ID_ASC]
            first: 3
          ) {
            edges {
              node {
                boardId
                boardName
                inviterId
                username
                inviteCount
                invitees
              }
            }
            resultCount
            totalCount
            pageInfo {
              hasNextPage
              hasPreviousPage
            }
          }
        }
      `,
      asAdmin(),
    );

    expect(result).toMatchSnapshot();
  });

  it('orderBy + first 0', async () => {
    const result = await testGraphql(
      gql`
        query allBoardMemberViews {
          allBoardMemberViews(
            orderBy: [BOARD_ID_ASC, INVITER_ID_ASC]
            first: 0
          ) {
            edges {
              node {
                boardId
                boardName
                inviterId
                username
                inviteCount
                invitees
              }
            }
            resultCount
            totalCount
            pageInfo {
              hasNextPage
              hasPreviousPage
            }
          }
        }
      `,
      asAdmin(),
    );

    expect(result).toMatchSnapshot();
  });

  it('orderBy + last', async () => {
    const result = await testGraphql(
      gql`
        query allBoardMemberViews {
          allBoardMemberViews(
            orderBy: [BOARD_ID_ASC, INVITER_ID_ASC]
            last: 3
          ) {
            edges {
              node {
                boardId
                boardName
                inviterId
                username
                inviteCount
                invitees
              }
            }
            resultCount
            totalCount
            pageInfo {
              hasNextPage
              hasPreviousPage
            }
          }
        }
      `,
      asAdmin(),
    );

    expect(result).toMatchSnapshot();
  });

  it('descending orderBy', async () => {
    const result = await testGraphql(
      gql`
        query allBoardMemberViews {
          allBoardMemberViews(orderBy: [BOARD_ID_DESC, INVITER_ID_DESC]) {
            edges {
              node {
                boardId
                boardName
                inviterId
                username
                inviteCount
                invitees
              }
            }
            resultCount
            totalCount
            pageInfo {
              hasNextPage
              hasPreviousPage
            }
          }
        }
      `,
      asAdmin(),
    );

    expect(result).toMatchSnapshot();
  });

  it('descending orderBy + first', async () => {
    const result = await testGraphql(
      gql`
        query allBoardMemberViews {
          allBoardMemberViews(
            orderBy: [BOARD_ID_DESC, INVITER_ID_DESC]
            first: 3
          ) {
            edges {
              node {
                boardId
                boardName
                inviterId
                username
                inviteCount
                invitees
              }
            }
            resultCount
            totalCount
            pageInfo {
              hasNextPage
              hasPreviousPage
            }
          }
        }
      `,
      asAdmin(),
    );

    expect(result).toMatchSnapshot();
  });

  it('descending orderBy + last', async () => {
    const result = await testGraphql(
      gql`
        query allBoardMemberViews {
          allBoardMemberViews(
            orderBy: [BOARD_ID_DESC, INVITER_ID_DESC]
            last: 3
          ) {
            edges {
              node {
                boardId
                boardName
                inviterId
                username
                inviteCount
                invitees
              }
            }
            resultCount
            totalCount
            pageInfo {
              hasNextPage
              hasPreviousPage
            }
          }
        }
      `,
      asAdmin(),
    );

    expect(result).toMatchSnapshot();
  });

  it('orderBy + offset', async () => {
    const result = await testGraphql(
      gql`
        query allBoardMemberViews {
          allBoardMemberViews(
            orderBy: [BOARD_ID_ASC, INVITER_ID_ASC]
            offset: 3
          ) {
            edges {
              node {
                boardId
                boardName
                inviterId
                username
                inviteCount
                invitees
              }
            }
            resultCount
            totalCount
            pageInfo {
              hasNextPage
              hasPreviousPage
            }
          }
        }
      `,
      asAdmin(),
    );

    expect(result).toMatchSnapshot();
  });

  it('orderBy + first + offset', async () => {
    const result = await testGraphql(
      gql`
        query allBoardMemberViews {
          allBoardMemberViews(
            orderBy: [BOARD_ID_ASC, INVITER_ID_ASC]
            first: 3
            offset: 5
          ) {
            edges {
              node {
                boardId
                boardName
                inviterId
                username
                inviteCount
                invitees
              }
            }
            resultCount
            totalCount
            pageInfo {
              hasNextPage
              hasPreviousPage
            }
          }
        }
      `,
      asAdmin(),
    );

    expect(result).toMatchSnapshot();
  });

  it('orderBy + last + offset', async () => {
    const result = await testGraphql(
      gql`
        query allBoardMemberViews {
          allBoardMemberViews(
            orderBy: [BOARD_ID_ASC, INVITER_ID_ASC]
            last: 3
            offset: 5
          ) {
            edges {
              node {
                boardId
                boardName
                inviterId
                username
                inviteCount
                invitees
              }
            }
            resultCount
            totalCount
            pageInfo {
              hasNextPage
              hasPreviousPage
            }
          }
        }
      `,
      asAdmin(),
    );

    expect(result).toMatchSnapshot();
  });

  it('descending orderBy + offset', async () => {
    const result = await testGraphql(
      gql`
        query allBoardMemberViews {
          allBoardMemberViews(
            orderBy: [BOARD_ID_DESC, INVITER_ID_DESC]
            offset: 3
          ) {
            edges {
              node {
                boardId
                boardName
                inviterId
                username
                inviteCount
                invitees
              }
            }
            resultCount
            totalCount
            pageInfo {
              hasNextPage
              hasPreviousPage
            }
          }
        }
      `,
      asAdmin(),
    );

    expect(result).toMatchSnapshot();
  });

  it('descending orderBy + first + offset', async () => {
    const result = await testGraphql(
      gql`
        query allBoardMemberViews {
          allBoardMemberViews(
            orderBy: [BOARD_ID_DESC, INVITER_ID_DESC]
            first: 3
            offset: 5
          ) {
            edges {
              node {
                boardId
                boardName
                inviterId
                username
                inviteCount
                invitees
              }
            }
            resultCount
            totalCount
            pageInfo {
              hasNextPage
              hasPreviousPage
            }
          }
        }
      `,
      asAdmin(),
    );

    expect(result).toMatchSnapshot();
  });

  it('descending orderBy + last + offset', async () => {
    const result = await testGraphql(
      gql`
        query allBoardMemberViews {
          allBoardMemberViews(
            orderBy: [BOARD_ID_DESC, INVITER_ID_DESC]
            last: 3
            offset: 5
          ) {
            edges {
              node {
                boardId
                boardName
                inviterId
                username
                inviteCount
                invitees
              }
            }
            resultCount
            totalCount
            pageInfo {
              hasNextPage
              hasPreviousPage
            }
          }
        }
      `,
      asAdmin(),
    );

    expect(result).toMatchSnapshot();
  });

  it('filter', async () => {
    const result = await testGraphql(
      gql`
        query allBoardMemberViews {
          allBoardMemberViews(
            orderBy: [BOARD_ID_ASC, INVITER_ID_ASC]
            filter: { username: "hazel528" }
          ) {
            edges {
              node {
                boardId
                boardName
                inviterId
                username
                inviteCount
                invitees
              }
            }
            resultCount
            totalCount
            pageInfo {
              hasNextPage
              hasPreviousPage
            }
          }
        }
      `,
      asAdmin(),
    );

    expect(result).toMatchSnapshot();
  });

  it('filter with no results', async () => {
    const result = await testGraphql(
      gql`
        query allBoardMemberViews {
          allBoardMemberViews(
            orderBy: [BOARD_ID_ASC, INVITER_ID_ASC]
            filter: { username: "---not-found---" }
          ) {
            edges {
              node {
                boardId
                boardName
                inviterId
                username
                inviteCount
                invitees
              }
            }
            resultCount
            totalCount
            pageInfo {
              hasNextPage
              hasPreviousPage
            }
          }
        }
      `,
      asAdmin(),
    );

    expect(result).toMatchSnapshot();
  });

  it('filter with mutliple attributes', async () => {
    const result = await testGraphql(
      gql`
        query allBoardMemberViews {
          allBoardMemberViews(
            orderBy: [BOARD_ID_ASC, INVITER_ID_ASC]
            filter: { username: "carissa722", inviteCount__gt: 5 }
          ) {
            edges {
              node {
                boardId
                boardName
                inviterId
                username
                inviteCount
                invitees
              }
            }
            resultCount
            totalCount
            pageInfo {
              hasNextPage
              hasPreviousPage
            }
          }
        }
      `,
      asAdmin(),
    );

    expect(result).toMatchSnapshot();
  });

  it('filter with invalid attributes (reject)', async () => {
    const result = await testGraphql(
      gql`
        query allBoardMemberViews {
          allBoardMemberViews(
            orderBy: [BOARD_ID_ASC, INVITER_ID_ASC]
            filter: { someAttributes: "Veritatis nihil cum" }
          ) {
            edges {
              node {
                boardId
                boardName
                inviterId
                username
                inviteCount
                invitees
              }
            }
            resultCount
            totalCount
            pageInfo {
              hasNextPage
              hasPreviousPage
            }
          }
        }
      `,
      asAdmin(),
    );

    expect(result).toMatchSnapshot();
  });

  describe('filter with logical operators', () => {
    describe('OR', () => {
      it('OR + orderBy', async () => {
        const result = await testGraphql(
          gql`
            query allBoardMemberViews {
              allBoardMemberViews(
                orderBy: [BOARD_ID_ASC, INVITER_ID_ASC]
                filter: {
                  OR: [
                    { username: "joel356" }
                    { username: "weston422" }
                    {
                      boardName__starts_with: "Qui"
                      boardName__ends_with: "ut"
                    }
                  ]
                }
              ) {
                edges {
                  node {
                    boardId
                    boardName
                    inviterId
                    username
                    inviteCount
                    invitees
                  }
                }
                resultCount
                totalCount
                pageInfo {
                  hasNextPage
                  hasPreviousPage
                }
              }
            }
          `,
          asAdmin(),
        );

        expect(result).toMatchSnapshot();
      });

      it('OR + offset', async () => {
        const result = await testGraphql(
          gql`
            query allBoardMemberViews {
              allBoardMemberViews(
                orderBy: [BOARD_ID_ASC, INVITER_ID_ASC]
                offset: 1
                filter: {
                  OR: [
                    { username: "joel356" }
                    { username: "weston422" }
                    {
                      boardName__starts_with: "Qui"
                      boardName__ends_with: "ut"
                    }
                  ]
                }
              ) {
                edges {
                  node {
                    boardId
                    boardName
                    inviterId
                    username
                    inviteCount
                    invitees
                  }
                }
                resultCount
                totalCount
                pageInfo {
                  hasNextPage
                  hasPreviousPage
                }
              }
            }
          `,
          asAdmin(),
        );

        expect(result).toMatchSnapshot();
      });

      it('OR + last', async () => {
        const result = await testGraphql(
          gql`
            query allBoardMemberViews {
              allBoardMemberViews(
                orderBy: [BOARD_ID_ASC, INVITER_ID_ASC]
                last: 3
                filter: {
                  OR: [
                    { username: "joel356" }
                    { username: "weston422" }
                    {
                      boardName__starts_with: "Qui"
                      boardName__ends_with: "ut"
                    }
                  ]
                }
              ) {
                edges {
                  node {
                    boardId
                    boardName
                    inviterId
                    username
                    inviteCount
                    invitees
                  }
                }
                resultCount
                totalCount
                pageInfo {
                  hasNextPage
                  hasPreviousPage
                }
              }
            }
          `,
          asAdmin(),
        );

        expect(result).toMatchSnapshot();
      });
    });

    describe('AND', () => {
      it('AND + orderBy', async () => {
        const result = await testGraphql(
          gql`
            query allBoardMemberViews {
              allBoardMemberViews(
                orderBy: [BOARD_ID_ASC, INVITER_ID_ASC]
                filter: {
                  AND: [
                    { boardId__gt: 30, boardId__lt: 40 }
                    { username__contains: "t" }
                    { inviteCount__in: [1, 4, 6] }
                  ]
                }
              ) {
                edges {
                  node {
                    boardId
                    boardName
                    inviterId
                    username
                    inviteCount
                    invitees
                  }
                }
                resultCount
                totalCount
                pageInfo {
                  hasNextPage
                  hasPreviousPage
                }
              }
            }
          `,
          asAdmin(),
        );

        expect(result).toMatchSnapshot();
      });

      it('AND + offset', async () => {
        const result = await testGraphql(
          gql`
            query allBoardMemberViews {
              allBoardMemberViews(
                orderBy: [BOARD_ID_ASC, INVITER_ID_ASC]
                offset: 4
                filter: {
                  AND: [
                    { boardId__gt: 30, boardId__lt: 40 }
                    { username__contains: "t" }
                    { inviteCount__in: [1, 4, 6] }
                  ]
                }
              ) {
                edges {
                  node {
                    boardId
                    boardName
                    inviterId
                    username
                    inviteCount
                    invitees
                  }
                }
                resultCount
                totalCount
                pageInfo {
                  hasNextPage
                  hasPreviousPage
                }
              }
            }
          `,
          asAdmin(),
        );

        expect(result).toMatchSnapshot();
      });

      it('AND + last', async () => {
        const result = await testGraphql(
          gql`
            query allBoardMemberViews {
              allBoardMemberViews(
                orderBy: [BOARD_ID_ASC, INVITER_ID_ASC]
                last: 4
                filter: {
                  AND: [
                    { boardId__gt: 30, boardId__lt: 40 }
                    { username__contains: "t" }
                    { inviteCount__in: [1, 4, 6] }
                  ]
                }
              ) {
                edges {
                  node {
                    boardId
                    boardName
                    inviterId
                    username
                    inviteCount
                    invitees
                  }
                }
                resultCount
                totalCount
                pageInfo {
                  hasNextPage
                  hasPreviousPage
                }
              }
            }
          `,
          asAdmin(),
        );

        expect(result).toMatchSnapshot();
      });
    });

    describe('filter with nested logical operators', () => {
      it('AND + OR', async () => {
        const result = await testGraphql(
          gql`
            query allBoardMemberViews {
              allBoardMemberViews(
                orderBy: [BOARD_ID_ASC, INVITER_ID_ASC]
                filter: {
                  AND: [
                    { boardId__gt: 30, boardId__lt: 40 }
                    { username__contains: "t" }
                    { inviteCount__in: [1, 4, 6] }
                    {
                      OR: [
                        { username: "tiana281" }
                        { username: "jonathon586" }
                      ]
                    }
                  ]
                }
              ) {
                edges {
                  node {
                    boardId
                    boardName
                    inviterId
                    username
                    inviteCount
                    invitees
                  }
                }
                resultCount
                totalCount
                pageInfo {
                  hasNextPage
                  hasPreviousPage
                }
              }
            }
          `,
          asAdmin(),
        );

        expect(result).toMatchSnapshot();
      });
    });
  });

  it('reverse connection', async () => {
    const result = await testGraphql(
      gql`
        query inviterById {
          profileById(id: 79) {
            id
            boardMemberViewsByInviterId(
              orderBy: [BOARD_ID_ASC, INVITER_ID_ASC]
            ) {
              edges {
                node {
                  boardId
                  boardName
                  inviterId
                  username
                  inviteCount
                  invitees
                }
              }
              resultCount
              totalCount
              pageInfo {
                hasNextPage
                hasPreviousPage
              }
            }
          }
        }
      `,
      asAdmin(),
    );

    expect(result).toMatchSnapshot();
  });

  it('reverse connection + first', async () => {
    const result = await testGraphql(
      gql`
        query inviterById {
          profileById(id: 79) {
            id
            boardMemberViewsByInviterId(
              orderBy: [BOARD_ID_ASC, INVITER_ID_ASC]
              first: 1
            ) {
              edges {
                node {
                  boardId
                  boardName
                  inviterId
                  username
                  inviteCount
                  invitees
                }
              }
              resultCount
              totalCount
              pageInfo {
                hasNextPage
                hasPreviousPage
              }
            }
          }
        }
      `,
      asAdmin(),
    );

    expect(result).toMatchSnapshot();
  });
});
