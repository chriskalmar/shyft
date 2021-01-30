import { readRows } from './testingData';
import { Board } from './models/Board';
import { findOneByValue, testGraphql } from './db';
import { asAdmin, asUser } from './testUtils';
import { asyncForEach } from '../src/engine/util';
import { formatGraphQLError, gql } from '../src/graphqlProtocol/util';

const stopOnError = (result) => {
  if (result.errors) {
    result.errors.map(formatGraphQLError).forEach(console.error);
    throw new Error('Failed on test data import!');
  }
};

export const loadData = async () => {
  const profiles = readRows('profiles');

  await asyncForEach(
    profiles,
    async ([username, password, firstname, lastname]) => {
      const payload = {
        username,
        password,
        firstname,
        lastname,
      };

      const result = await testGraphql(
        gql`
          mutation signupProfile($payload: SignupProfileInstanceInput!) {
            signupProfile(input: { profile: $payload }) {
              profile {
                id
              }
            }
          }
        `,
        asAdmin(),
        {
          payload,
        },
      );

      stopOnError(result);
    },
  );

  const boards = readRows('boards');

  await asyncForEach(
    boards,
    async ([name, userId, isPrivate, vip, metaData, mods]) => {
      const payload = {
        name,
        isPrivate: isPrivate === '1',
        vip,
        metaData: metaData ? JSON.parse(metaData) : null,
        mods: mods ? JSON.parse(mods) : null,
      };

      const result = await testGraphql(
        gql`
          mutation buildBoard($payload: BuildBoardInstanceInput!) {
            buildBoard(input: { board: $payload }) {
              board {
                id
              }
            }
          }
        `,
        asUser(userId),
        {
          payload,
        },
      );

      stopOnError(result);
    },
  );

  const boardsCache = {};

  const getBoardIdByName = async (name, userId) => {
    if (!boardsCache[name]) {
      const payload = {
        name,
      };

      const board = await findOneByValue(Board, payload, asUser(userId));
      boardsCache[name] = board.id;
    }

    return boardsCache[name];
  };

  const joins = readRows('joins');

  await asyncForEach(joins, async ([name, userId]) => {
    const payload = {
      board: await getBoardIdByName(name, userId),
    };

    const result = await testGraphql(
      gql`
        mutation joinBoardMember($payload: JoinBoardMemberInstanceInput!) {
          joinBoardMember(input: { boardMember: $payload }) {
            boardMember {
              id
            }
          }
        }
      `,
      asUser(userId),
      {
        payload,
      },
    );

    stopOnError(result);
  });

  const invites = readRows('invites');

  await asyncForEach(invites, async ([name, inviter, invitee, accept]) => {
    const payload = {
      board: await getBoardIdByName(name, inviter),
      invitee,
    };

    const invitation = await testGraphql(
      gql`
        mutation inviteBoardMember($payload: InviteBoardMemberInstanceInput!) {
          inviteBoardMember(input: { boardMember: $payload }) {
            boardMember {
              id
            }
          }
        }
      `,
      asUser(inviter),
      {
        payload,
      },
    );

    stopOnError(invitation);

    if (accept === '1') {
      const result = await testGraphql(
        gql`
          mutation acceptBoardMemberById($id: ID!) {
            acceptBoardMemberById(input: { id: $id }) {
              boardMember {
                id
              }
            }
          }
        `,
        asUser(invitee),
        {
          id: invitation.data.inviteBoardMember.boardMember.id,
        },
      );

      stopOnError(result);
    }
  });

  const messages = readRows('messages');

  await asyncForEach(messages, async ([content, author, board, writtenAt]) => {
    const payload = {
      content,
      author,
      board,
      writtenAt,
    };

    const result = await testGraphql(
      gql`
        mutation writeMessage($payload: WriteMessageInstanceInput!) {
          writeMessage(input: { message: $payload }) {
            message {
              id
            }
          }
        }
      `,
      asAdmin(),
      {
        payload,
      },
    );

    stopOnError(result);
  });

  const books = readRows('books');

  await asyncForEach(books, async ([title, author]) => {
    const payload = {
      title,
      author,
    };

    const result = await testGraphql(
      gql`
        mutation createBook($payload: CreateBookInstanceInput!) {
          createBook(input: { book: $payload }) {
            book {
              id
            }
          }
        }
      `,
      asAdmin(),
      {
        payload,
      },
    );

    stopOnError(result);
  });
};
