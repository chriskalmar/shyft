import './setupAndTearDown';

import { asAdmin, removeDynamicData } from './testUtils';

import { testGraphql } from './db';
import { gql } from '../src/graphqlProtocol/util';
import DataLoader from 'dataloader';
import { Profile } from './models/Profile';

describe('list', () => {
  it('orderBy', async () => {
    const result = await testGraphql(
      gql`
        query allProfiles {
          allProfiles(orderBy: [ID_ASC]) {
            edges {
              node {
                id
                username
                firstname
                lastname
                confirmedAt
              }
            }
            resultCount
            totalCount
            pageInfo {
              startCursor
              endCursor
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
        query allProfiles {
          allProfiles(orderBy: [ID_ASC], first: 3) {
            edges {
              node {
                id
                username
                firstname
                lastname
                confirmedAt
              }
            }
            resultCount
            totalCount
            pageInfo {
              startCursor
              endCursor
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
        query allProfiles {
          allProfiles(orderBy: [ID_ASC], first: 0) {
            edges {
              node {
                id
                username
                firstname
                lastname
                confirmedAt
              }
            }
            resultCount
            totalCount
            pageInfo {
              startCursor
              endCursor
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
        query allProfiles {
          allProfiles(orderBy: [ID_ASC], last: 3) {
            edges {
              node {
                id
                username
                firstname
                lastname
                confirmedAt
              }
            }
            resultCount
            totalCount
            pageInfo {
              startCursor
              endCursor
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
        query allProfiles {
          allProfiles(orderBy: [ID_DESC]) {
            edges {
              node {
                id
                username
                firstname
                lastname
                confirmedAt
              }
            }
            resultCount
            totalCount
            pageInfo {
              startCursor
              endCursor
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
        query allProfiles {
          allProfiles(orderBy: [ID_DESC], first: 3) {
            edges {
              node {
                id
                username
                firstname
                lastname
                confirmedAt
              }
            }
            resultCount
            totalCount
            pageInfo {
              startCursor
              endCursor
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
        query allProfiles {
          allProfiles(orderBy: [ID_DESC], last: 3) {
            edges {
              node {
                id
                username
                firstname
                lastname
                confirmedAt
              }
            }
            resultCount
            totalCount
            pageInfo {
              startCursor
              endCursor
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
        query allProfiles {
          allProfiles(orderBy: [ID_ASC], offset: 5) {
            edges {
              node {
                id
                username
                firstname
                lastname
                confirmedAt
              }
            }
            resultCount
            totalCount
            pageInfo {
              startCursor
              endCursor
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
        query allProfiles {
          allProfiles(orderBy: [ID_ASC], first: 3, offset: 5) {
            edges {
              node {
                id
                username
                firstname
                lastname
                confirmedAt
              }
            }
            resultCount
            totalCount
            pageInfo {
              startCursor
              endCursor
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
        query allProfiles {
          allProfiles(orderBy: [ID_ASC], last: 3, offset: 5) {
            edges {
              node {
                id
                username
                firstname
                lastname
                confirmedAt
              }
            }
            resultCount
            totalCount
            pageInfo {
              startCursor
              endCursor
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
        query allProfiles {
          allProfiles(orderBy: [ID_DESC], offset: 5) {
            edges {
              node {
                id
                username
                firstname
                lastname
                confirmedAt
              }
            }
            resultCount
            totalCount
            pageInfo {
              startCursor
              endCursor
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
        query allProfiles {
          allProfiles(orderBy: [ID_DESC], first: 3, offset: 5) {
            edges {
              node {
                id
                username
                firstname
                lastname
                confirmedAt
              }
            }
            resultCount
            totalCount
            pageInfo {
              startCursor
              endCursor
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
        query allProfiles {
          allProfiles(orderBy: [ID_DESC], last: 3, offset: 5) {
            edges {
              node {
                id
                username
                firstname
                lastname
                confirmedAt
              }
            }
            resultCount
            totalCount
            pageInfo {
              startCursor
              endCursor
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

  it('multi-key orderBy + first + offset', async () => {
    const result = await testGraphql(
      gql`
        query allBoardMembers {
          allBoardMembers(
            orderBy: [BOARD_ASC, INVITEE_DESC]
            first: 5
            offset: 5
          ) {
            edges {
              node {
                board
                id
                invitee
                inviter
                state
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
        query allProfiles {
          allProfiles(orderBy: [ID_ASC], filter: { username: "hazel528" }) {
            edges {
              node {
                id
                username
                firstname
                lastname
                confirmedAt
              }
            }
            resultCount
            totalCount
            pageInfo {
              startCursor
              endCursor
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
        query allProfiles {
          allProfiles(
            orderBy: [ID_ASC]
            filter: { username: "---not-found---" }
          ) {
            edges {
              node {
                id
                username
                firstname
                lastname
                confirmedAt
              }
            }
            resultCount
            totalCount
            pageInfo {
              startCursor
              endCursor
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
        query allBoards {
          allBoards(
            orderBy: [ID_ASC]
            filter: { name: "Veritatis nihil cum", isPrivate: true }
          ) {
            edges {
              node {
                name
                owner
                vip
                isPrivate
                metaData {
                  description
                  externalLinks
                }
                mods
              }
            }
            resultCount
            totalCount
            pageInfo {
              startCursor
              endCursor
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
        query allBoards {
          allBoards(
            orderBy: [ID_ASC]
            filter: { someAttributes: "Veritatis nihil cum" }
          ) {
            edges {
              node {
                name
                owner
                vip
                isPrivate
                metaData {
                  description
                  externalLinks
                }
                mods
              }
            }
            resultCount
            totalCount
            pageInfo {
              startCursor
              endCursor
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
            query allProfiles {
              allProfiles(
                orderBy: [REGISTERED_AT_DESC]
                filter: {
                  OR: [
                    { username: "dana768" }
                    { username: "weston422" }
                    { username__starts_with: "jo", username__ends_with: "56" }
                  ]
                }
              ) {
                edges {
                  node {
                    id
                    username
                    firstname
                    lastname
                    confirmedAt
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
            query allProfiles {
              allProfiles(
                orderBy: [REGISTERED_AT_DESC]
                offset: 1
                filter: {
                  OR: [
                    { username: "dana768" }
                    { username: "weston422" }
                    { username__starts_with: "jo", username__ends_with: "56" }
                  ]
                }
              ) {
                edges {
                  node {
                    id
                    username
                    firstname
                    lastname
                    confirmedAt
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
            query allProfiles {
              allProfiles(
                orderBy: [REGISTERED_AT_DESC]
                last: 3
                filter: {
                  OR: [
                    { username: "dana768" }
                    { username: "weston422" }
                    { username__starts_with: "jo", username__ends_with: "56" }
                  ]
                }
              ) {
                edges {
                  node {
                    id
                    username
                    firstname
                    lastname
                    confirmedAt
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
            query allBoardMembers {
              allBoardMembers(
                orderBy: [CREATED_AT_DESC]
                filter: {
                  AND: [
                    { board__gt: 30, board__lt: 40 }
                    { state__in: [accepted, joined] }
                    { inviter__in: [61, 78] }
                  ]
                }
              ) {
                edges {
                  node {
                    board
                    id
                    invitee
                    inviter
                    state
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
            query allBoardMembers {
              allBoardMembers(
                orderBy: [CREATED_AT_DESC]
                offset: 4
                filter: {
                  AND: [
                    { board__gt: 30, board__lt: 40 }
                    { state__in: [accepted, joined] }
                    { inviter__in: [61, 78] }
                  ]
                }
              ) {
                edges {
                  node {
                    board
                    id
                    invitee
                    inviter
                    state
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
            query allBoardMembers {
              allBoardMembers(
                orderBy: [CREATED_AT_DESC]
                last: 4
                filter: {
                  AND: [
                    { board__gt: 30, board__lt: 40 }
                    { state__in: [accepted, joined] }
                    { inviter__in: [61, 78] }
                  ]
                }
              ) {
                edges {
                  node {
                    board
                    id
                    invitee
                    inviter
                    state
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
            query allBoardMembers {
              allBoardMembers(
                orderBy: [BOARD_ASC]
                filter: {
                  AND: [
                    { board__gt: 30, board__lt: 40 }
                    { state__in: [accepted, joined] }
                    { inviter__in: [61, 78] }
                    {
                      OR: [
                        { invitee: 107 }
                        { invitee: 21 }
                        { invitee: 38 }
                        { invitee__gt: 60, invitee__lt: 62 }
                      ]
                    }
                  ]
                }
              ) {
                edges {
                  node {
                    board
                    id
                    invitee
                    inviter
                    state
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
          profileById(id: 60) {
            id
            boardMembersByInviter(orderBy: [ID_ASC]) {
              edges {
                node {
                  board
                  id
                  invitee
                  inviter
                  state
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
          profileById(id: 60) {
            id
            boardMembersByInviter(orderBy: [ID_ASC], first: 1) {
              edges {
                node {
                  board
                  id
                  invitee
                  inviter
                  state
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

  describe('filter variants', () => {
    const runFilterVariant = async (boardFilter: {
      [key: string]: unknown;
    }) => {
      return await testGraphql(
        gql`
          query allBoards($boardFilter: BoardFilter) {
            allBoards(orderBy: [ID_ASC], filter: $boardFilter) {
              edges {
                node {
                  name
                  owner
                  vip
                  isPrivate
                  metaData {
                    description
                    externalLinks
                  }
                  mods
                  createdBy
                  updatedBy
                }
              }
              resultCount
              totalCount
              pageInfo {
                startCursor
                endCursor
                hasNextPage
                hasPreviousPage
              }
            }
          }
        `,
        asAdmin(),
        {
          boardFilter: boardFilter,
        },
      );
    };

    it('equals (null)', async () => {
      const result = await runFilterVariant({
        name: null,
      });

      expect(result).toMatchSnapshot();
    });

    it('$ne', async () => {
      const result = await runFilterVariant({
        name__ne: 'Reiciendis quaerat',
      });

      expect(result).toMatchSnapshot();
    });

    it('$ne (null)', async () => {
      const result = await runFilterVariant({
        name__ne: null,
      });
      expect(result).toMatchSnapshot();
    });

    it('$in', async () => {
      const result = await runFilterVariant({
        name__in: ['Ut et', 'Rerum ad'],
      });

      expect(result).toMatchSnapshot();
    });

    it('$not_in', async () => {
      const result = await runFilterVariant({
        owner__not_in: [37, 79, 42],
      });

      expect(result).toMatchSnapshot();
    });

    it('$lt', async () => {
      const result = await runFilterVariant({
        id__lt: 4,
      });

      expect(result).toMatchSnapshot();
    });

    it('$lte', async () => {
      const result = await runFilterVariant({
        id__lte: 4,
      });

      expect(result).toMatchSnapshot();
    });

    it('$gt', async () => {
      const result = await runFilterVariant({
        id__gt: 47,
      });

      expect(result).toMatchSnapshot();
    });

    it('$gte', async () => {
      const result = await runFilterVariant({
        id__gte: 47,
      });

      expect(result).toMatchSnapshot();
    });

    it('$contains', async () => {
      const result = await runFilterVariant({
        name__contains: 'quia',
      });

      expect(result).toMatchSnapshot();
    });

    it('$starts_with', async () => {
      const result = await runFilterVariant({
        name__starts_with: 'est',
      });

      expect(result).toMatchSnapshot();
    });

    it('$ends_with', async () => {
      const result = await runFilterVariant({
        name__ends_with: 'et',
      });

      expect(result).toMatchSnapshot();
    });

    it('$contains + $starts_with + $ends_with', async () => {
      const result = await runFilterVariant({
        name__starts_with: 'e',
        name__contains: 'dol',
        name__ends_with: 'e',
      });

      expect(result).toMatchSnapshot();
    });

    it('$not_contains', async () => {
      const result = await runFilterVariant({
        name__not_contains: 'e',
      });

      expect(result).toMatchSnapshot();
    });

    it('$not_starts_with', async () => {
      const result = await runFilterVariant({
        name__not_starts_with: 've',
      });

      expect(result).toMatchSnapshot();
    });

    it('$not_ends_with', async () => {
      const result = await runFilterVariant({
        name__not_ends_with: 't',
      });

      expect(result).toMatchSnapshot();
    });

    it('$not_contains + $not_starts_with + $not_ends_with', async () => {
      const result = await runFilterVariant({
        name__not_starts_with: 'r',
        name__not_contains: 'i',
        name__not_ends_with: 'e',
      });

      expect(result).toMatchSnapshot();
    });

    it('$contains + $not_contains', async () => {
      const result = await runFilterVariant({
        name__contains: 'r',
        name__not_contains: 'e',
      });

      expect(result).toMatchSnapshot();
    });

    it('$starts_with + $not_ends_with', async () => {
      const result = await runFilterVariant({
        name__starts_with: 'su',
        name__not_ends_with: 's',
      });

      expect(result).toMatchSnapshot();
    });

    it('$includes', async () => {
      const resultObj = await runFilterVariant({
        metaData__includes: 'description',
      });

      expect(resultObj).toMatchSnapshot('object');

      const resultList = await runFilterVariant({
        mods__includes: 'Jane',
      });

      expect(resultList).toMatchSnapshot('list');
    });

    it('$includes + $notIncludes', async () => {
      const resultObj = await runFilterVariant({
        metaData__includes: 'externalLinks',
        metaData__not_includes: 'description',
      });

      expect(resultObj).toMatchSnapshot('object');

      const resultList = await runFilterVariant({
        mods__includes: 'Jane',
        mods__not_includes: 'Tom',
      });

      expect(resultList).toMatchSnapshot('list');
    });

    it('$isNull', async () => {
      const resultObj = await runFilterVariant({
        metaData__is_null: true,
        mods__is_null: false,
      });

      expect(resultObj).toMatchSnapshot('object');

      const resultList = await runFilterVariant({
        metaData__is_null: false,
        mods__is_null: true,
      });

      expect(resultList).toMatchSnapshot('list');
    });
  });

  it('should utilize data loader', async () => {
    const context = asAdmin();

    await testGraphql(
      gql`
        query allProfiles {
          allProfiles(orderBy: [ID_ASC]) {
            edges {
              node {
                id
                username
                firstname
                lastname
                confirmedAt
              }
            }
          }
        }
      `,
      context,
    );

    const loader = context.loaders.Profile as DataLoader<
      string,
      unknown,
      string
    >;

    const result = removeDynamicData(Profile, await loader.load('5'));
    expect(result).toMatchSnapshot();
  });
});
