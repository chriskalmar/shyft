/* eslint-disable dot-notation */
import './setupAndTearDown';
import { mutate, findOneByValue, testGraphql } from './db';

import {
  asUser,
  removeDynamicData,
  removeListDynamicData,
  removeId,
} from './testUtils';

import { BoardMember } from './models/BoardMember';
import { Board } from './models/Board';
import { Book } from './models/Book';
import { gql } from '../src/graphqlProtocol/util';

describe('mutation', () => {
  describe('via connector', () => {
    it('reject mutations without state transitions on stateful entities', async () => {
      const payload = {
        board: 50,
      };

      await mutate(BoardMember, 'create', payload, null, asUser(99)).catch(
        (e) => {
          expect(e).toMatchSnapshot();
        },
      );
    });

    it('perform create mutations', async () => {
      const payload = {
        board: 47,
      };

      const result = await mutate(
        BoardMember,
        'join',
        payload,
        null,
        asUser(99),
      );
      expect(removeDynamicData(BoardMember, result)).toMatchSnapshot();
    });

    it('perform create mutations with nested JSON attributes', async () => {
      const payload = {
        title: 'War and Peace',
        author: 'Leo Tolstoy',
        reviews: [
          {
            reviewer: 'John Connor',
            reviewText: "Couldn't stop reading",
            bookAttributes: [
              {
                attribute: 'Year of publishing',
                value: '1867',
              },
              {
                attribute: 'Pages',
                value: '1225',
              },
            ],
          },
        ],
      };

      const result = await mutate(Book, 'create', payload, null, asUser(99));
      expect(removeId(result)).toMatchSnapshot();
    });

    it('perform update mutations', async () => {
      const payload = {
        board: 50,
        invitee: 80,
      };

      let result = await mutate(
        BoardMember,
        'invite',
        payload,
        null,
        asUser(84),
      );
      const inviteId = result['id'];
      expect(removeDynamicData(BoardMember, result)).toMatchSnapshot();

      result = await mutate(BoardMember, 'accept', {}, inviteId, asUser(80));
      expect(removeDynamicData(BoardMember, result)).toMatchSnapshot();
    });

    it('perform update mutations with nested JSON attributes', async () => {
      const book = await findOneByValue(
        Book,
        { author: 'Leo Tolstoy' },
        asUser(99),
      );

      const payload = {
        reviews: [
          {
            reviewer: 'John Connor',
            reviewText: 'Updated review',
            bookAttributes: [
              {
                attribute: 'Year of publishing',
                value: '1867',
              },
              {
                attribute: 'Pages',
                value: '1225',
              },
              {
                attribute: 'Pages',
                value: '1225',
              },
              {
                attribute: 'Genre',
                value: 'Novel',
              },
            ],
          },
        ],
      };

      const result = await mutate(Book, 'update', payload, book.id, asUser(99));
      expect(removeId(result)).toMatchSnapshot();
    });

    it('handle uniqueness constraints', async () => {
      const payload = {
        name: 'New Board',
        isPrivate: false,
        vip: 1,
      };

      await mutate(Board, 'build', payload, null, asUser(99));

      await mutate(Board, 'build', payload, null, asUser(99)).catch((e) => {
        expect(e).toMatchSnapshot();
      });
    });

    it('perform delete mutations', async () => {
      const payload = {
        board: 50,
        invitee: 81,
      };

      let result = await mutate(
        BoardMember,
        'invite',
        payload,
        null,
        asUser(84),
      );
      const inviteId = result['id'];
      expect(removeDynamicData(BoardMember, result)).toMatchSnapshot();

      result = await mutate(BoardMember, 'remove', {}, inviteId, asUser(84));
      result['rows'] = removeListDynamicData(BoardMember, result['rows']);
      expect(removeDynamicData(BoardMember, result)).toMatchSnapshot();
    });

    it('fail mutation if fromState is not a match', async () => {
      const payload = {
        board: 50,
        invitee: 81,
      };

      const result = await mutate(
        BoardMember,
        'invite',
        payload,
        null,
        asUser(84),
      );
      const inviteId = result['id'];

      await mutate(BoardMember, 'accept', {}, inviteId, asUser(81));

      await mutate(BoardMember, 'accept', {}, inviteId, asUser(81)).catch(
        (e) => {
          expect(e).toMatchSnapshot();
        },
      );
    });

    it('reject mutations if ID not found', async () => {
      await mutate(BoardMember, 'remove', {}, 99999, asUser(80)).catch((e) => {
        expect(e).toMatchSnapshot();
      });
    });

    it('reject unknown mutations', async () => {
      await mutate(BoardMember, 'findInnerPeace', {}, 1, asUser(80)).catch(
        (e) => {
          expect(e).toMatchSnapshot();
        },
      );
    });
  });

  describe('via GrahpQL', () => {
    it('perform create mutations', async () => {
      const result = await testGraphql(
        gql`
          mutation joinBoardMember {
            joinBoardMember(input: { boardMember: { board: 47 } }) {
              boardMember {
                id
                board
                inviter
                invitee
                state
              }
            }
          }
        `,
        asUser(98),
      );

      expect(result).toMatchSnapshot();
    });

    it('perform create mutations with nested JSON attributes', async () => {
      const result = await testGraphql(
        gql`
          mutation createBook {
            createBook(
              input: {
                book: {
                  title: "War and Peace"
                  author: "Leo Tolstoy"
                  reviews: [
                    {
                      reviewer: "John Connor"
                      reviewText: "Couldn't stop reading"
                      bookAttributes: [
                        { attribute: "Year of publishing", value: "1867" }
                        { attribute: "Pages", value: "1225" }
                      ]
                    }
                  ]
                }
              }
            ) {
              book {
                id
                title
                author
                reviews {
                  reviewer
                  reviewText
                  bookAttributes {
                    attribute
                    value
                  }
                }
              }
            }
          }
        `,
        asUser(98),
      );

      expect(result).toMatchSnapshot();
    });

    it('perform update mutations', async () => {
      const inviteResult = await testGraphql(
        gql`
          mutation inviteBoardMember {
            inviteBoardMember(
              input: { boardMember: { board: 48, invitee: 70 } }
            ) {
              boardMember {
                id
                board
                inviter
                invitee
                state
              }
            }
          }
        `,
        asUser(41),
      );

      expect(inviteResult).toMatchSnapshot('invite');

      const inviteId = inviteResult.data.inviteBoardMember.boardMember.id;

      const acceptResult = await testGraphql(
        gql`
          mutation acceptBoardMemberById($inviteId: ID!) {
            acceptBoardMemberById(input: { id: $inviteId }) {
              boardMember {
                id
                board
                inviter
                invitee
                state
              }
            }
          }
        `,
        asUser(70),
        {
          inviteId,
        },
      );

      expect(acceptResult).toMatchSnapshot('accept');
    });
  });

  it('perform update mutations with nested JSON attributes', async () => {
    const book = await findOneByValue(
      Book,
      { author: 'Leo Tolstoy' },
      asUser(99),
    );

    const result = await testGraphql(
      gql`
        mutation updateBookById($id: ID!) {
          updateBookById(
            input: {
              id: $id
              book: {
                reviews: [
                  {
                    reviewer: "John Connor"
                    reviewText: "Updated review"
                    bookAttributes: [
                      { attribute: "Year of publishing", value: "1867" }
                      { attribute: "Pages", value: "1225" }
                      { attribute: "Pages", value: "1225" }
                      { attribute: "Genre", value: "Novel" }
                    ]
                  }
                ]
              }
            }
          ) {
            book {
              id
              title
              author
              reviews {
                reviewer
                reviewText
                bookAttributes {
                  attribute
                  value
                }
              }
            }
          }
        }
      `,
      asUser(98),
      {
        id: book.id,
      },
    );

    expect(result).toMatchSnapshot();
  });

  it('handle uniqueness constraints', async () => {
    const firstResult = await testGraphql(
      gql`
        mutation buildBoard {
          buildBoard(
            input: { board: { name: "Next Board", isPrivate: false, vip: 2 } }
          ) {
            board {
              id
            }
          }
        }
      `,
      asUser(98),
    );

    expect(firstResult).toMatchSnapshot('first');

    const secondResult = await testGraphql(
      gql`
        mutation buildBoard {
          buildBoard(
            input: { board: { name: "Next Board", isPrivate: false, vip: 2 } }
          ) {
            board {
              id
            }
          }
        }
      `,
      asUser(98),
    );

    expect(secondResult).toMatchSnapshot('second');
  });

  it('perform delete mutations', async () => {
    const inviteResult = await testGraphql(
      gql`
        mutation inviteBoardMember {
          inviteBoardMember(
            input: { boardMember: { board: 48, invitee: 75 } }
          ) {
            boardMember {
              id
              board
              inviter
              invitee
              state
            }
          }
        }
      `,
      asUser(41),
    );

    expect(inviteResult).toMatchSnapshot('invite');

    const inviteId = inviteResult.data.inviteBoardMember.boardMember.id;

    const removeResult = await testGraphql(
      gql`
        mutation removeBoardMemberById($inviteId: ID!) {
          removeBoardMemberById(input: { id: $inviteId }) {
            deleteRowCount
            id
          }
        }
      `,
      asUser(41),
      {
        inviteId,
      },
    );

    expect(removeResult).toMatchSnapshot('remove');
  });

  it('fail mutation if fromState is not a match', async () => {
    const inviteResult = await testGraphql(
      gql`
        mutation inviteBoardMember {
          inviteBoardMember(
            input: { boardMember: { board: 48, invitee: 72 } }
          ) {
            boardMember {
              id
              board
              inviter
              invitee
              state
            }
          }
        }
      `,
      asUser(41),
    );

    expect(inviteResult).toMatchSnapshot('invite');

    const inviteId = inviteResult.data.inviteBoardMember.boardMember.id;

    const firstAcceptResult = await testGraphql(
      gql`
        mutation acceptBoardMemberById($inviteId: ID!) {
          acceptBoardMemberById(input: { id: $inviteId }) {
            boardMember {
              id
              board
              inviter
              invitee
              state
            }
          }
        }
      `,
      asUser(72),
      {
        inviteId,
      },
    );

    expect(firstAcceptResult).toMatchSnapshot('firstAccept');

    const secondAcceptResult = await testGraphql(
      gql`
        mutation acceptBoardMemberById($inviteId: ID!) {
          acceptBoardMemberById(input: { id: $inviteId }) {
            boardMember {
              id
              board
              inviter
              invitee
              state
            }
          }
        }
      `,
      asUser(72),
      {
        inviteId,
      },
    );

    expect(secondAcceptResult).toMatchSnapshot('secondAccept');
  });

  it('reject mutations if ID not found', async () => {
    const result = await testGraphql(
      gql`
        mutation removeBoardMemberById($inviteId: ID!) {
          removeBoardMemberById(input: { id: $inviteId }) {
            deleteRowCount
            id
          }
        }
      `,
      asUser(41),
      {
        inviteId: 99999,
      },
    );

    expect(result).toMatchSnapshot();
  });
});
