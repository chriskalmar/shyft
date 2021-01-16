import './setupAndTearDown';
import { find } from './db';
import { asAdmin } from './testUtils';
import { BoardMemberView } from './models/BoardMemberView';

const orderByBoardIdAndInviterIdAsc = {
  orderBy: [
    {
      attribute: 'boardId',
      direction: 'ASC',
    },
    {
      attribute: 'inviterId',
      direction: 'ASC',
    },
  ],
};

const orderByBoardIdAndInviterIdDesc = {
  orderBy: [
    {
      attribute: 'boardId',
      direction: 'DESC',
    },
    {
      attribute: 'inviterId',
      direction: 'DESC',
    },
  ],
};

describe('view list', () => {
  it('orderBy', async () => {
    const invites = await find(
      BoardMemberView,
      { ...orderByBoardIdAndInviterIdAsc },
      asAdmin(),
    );

    expect(invites).toMatchSnapshot();
  });

  it('orderBy + first', async () => {
    const invites = await find(
      BoardMemberView,
      { ...orderByBoardIdAndInviterIdAsc, first: 3 },
      asAdmin(),
    );

    expect(invites).toMatchSnapshot();
  });

  it('orderBy + first 0', async () => {
    const invites = await find(
      BoardMemberView,
      { ...orderByBoardIdAndInviterIdAsc, first: 0 },
      asAdmin(),
    );

    expect(invites).toMatchSnapshot();
  });

  it('orderBy + last', async () => {
    const invites = await find(
      BoardMemberView,
      { ...orderByBoardIdAndInviterIdAsc, last: 3 },
      asAdmin(),
    );

    expect(invites).toMatchSnapshot();
  });

  it('descending orderBy', async () => {
    const invites = await find(
      BoardMemberView,
      { ...orderByBoardIdAndInviterIdDesc },
      asAdmin(),
    );

    expect(invites).toMatchSnapshot();
  });

  it('descending orderBy + first', async () => {
    const invites = await find(
      BoardMemberView,
      { ...orderByBoardIdAndInviterIdDesc, first: 3 },
      asAdmin(),
    );

    expect(invites).toMatchSnapshot();
  });

  it('descending orderBy + last', async () => {
    const invites = await find(
      BoardMemberView,
      { ...orderByBoardIdAndInviterIdDesc, last: 3 },
      asAdmin(),
    );

    expect(invites).toMatchSnapshot();
  });

  it('orderBy + offset', async () => {
    const invites = await find(
      BoardMemberView,
      { ...orderByBoardIdAndInviterIdAsc, offset: 3 },
      asAdmin(),
    );

    expect(invites).toMatchSnapshot();
  });

  it('orderBy + first + offset', async () => {
    const invites = await find(
      BoardMemberView,
      { ...orderByBoardIdAndInviterIdAsc, first: 3, offset: 5 },
      asAdmin(),
    );

    expect(invites).toMatchSnapshot();
  });

  it('orderBy + last + offset', async () => {
    const invites = await find(
      BoardMemberView,
      { ...orderByBoardIdAndInviterIdAsc, last: 3, offset: 5 },
      asAdmin(),
    );

    expect(invites).toMatchSnapshot();
  });

  it('descending orderBy + offset', async () => {
    const invites = await find(
      BoardMemberView,
      { ...orderByBoardIdAndInviterIdDesc, offset: 3 },
      asAdmin(),
    );

    expect(invites).toMatchSnapshot();
  });

  it('descending orderBy + first + offset', async () => {
    const invites = await find(
      BoardMemberView,
      { ...orderByBoardIdAndInviterIdDesc, first: 3, offset: 5 },
      asAdmin(),
    );

    expect(invites).toMatchSnapshot();
  });

  it('descending orderBy + last + offset', async () => {
    const invites = await find(
      BoardMemberView,
      { ...orderByBoardIdAndInviterIdDesc, last: 3, offset: 5 },
      asAdmin(),
    );

    expect(invites).toMatchSnapshot();
  });

  it('filter', async () => {
    const filter = {
      username: 'hazel528',
    };

    const invites = await find(
      BoardMemberView,
      { ...orderByBoardIdAndInviterIdAsc, filter },
      asAdmin(),
    );

    expect(invites).toMatchSnapshot();
  });

  it('filter with no results', async () => {
    const filter = {
      username: '---not-found---',
    };

    const invites = await find(
      BoardMemberView,
      { ...orderByBoardIdAndInviterIdAsc, filter },
      asAdmin(),
    );

    expect(invites).toMatchSnapshot();
  });

  it('filter with mutliple attributes', async () => {
    const filter = {
      username: 'carissa722',
      inviteCount: {
        $gt: 5,
      },
    };

    const invites = await find(
      BoardMemberView,
      { ...orderByBoardIdAndInviterIdAsc, filter },
      asAdmin(),
    );

    expect(invites).toMatchSnapshot();
  });

  it('filter with invalid attributes (reject)', async () => {
    const filter = {
      someAttributes: 'Veritatis nihil cum',
    };

    await find(
      BoardMemberView,
      { ...orderByBoardIdAndInviterIdAsc, filter },
      asAdmin(),
    ).catch(e => {
      expect(e).toMatchSnapshot();
    });
  });

  describe('filter with logical operators', () => {
    describe('OR', () => {
      const filter = {
        $or: [
          {
            username: 'joel356',
          },
          {
            username: 'weston422',
          },
          {
            boardName: {
              $starts_with: 'Qui',
              $ends_with: 'ut',
            },
          },
        ],
      };

      it('OR + orderBy', async () => {
        const invites = await find(
          BoardMemberView,
          { ...orderByBoardIdAndInviterIdAsc, filter },
          asAdmin(),
        );

        expect(invites).toMatchSnapshot();
      });

      it('OR + offset', async () => {
        const invites = await find(
          BoardMemberView,
          { ...orderByBoardIdAndInviterIdAsc, filter, offset: 1 },
          asAdmin(),
        );

        expect(invites).toMatchSnapshot();
      });

      it('OR + last', async () => {
        const invites = await find(
          BoardMemberView,
          { ...orderByBoardIdAndInviterIdAsc, filter, last: 3 },
          asAdmin(),
        );

        expect(invites).toMatchSnapshot();
      });
    });

    describe('AND', () => {
      const filter = {
        $and: [
          {
            boardId: {
              $gt: 30,
              $lt: 40,
            },
          },
          {
            username: {
              $contains: 't',
            },
          },
          {
            inviteCount: {
              $in: [1, 4, 6],
            },
          },
        ],
      };

      it('AND + orderBy', async () => {
        const invites = await find(
          BoardMemberView,
          { ...orderByBoardIdAndInviterIdAsc, filter },
          asAdmin(),
        );

        expect(invites).toMatchSnapshot();
      });

      it('AND + offset', async () => {
        const invites = await find(
          BoardMemberView,
          { ...orderByBoardIdAndInviterIdAsc, filter, offset: 4 },
          asAdmin(),
        );

        expect(invites).toMatchSnapshot();
      });

      it('AND + last', async () => {
        const invites = await find(
          BoardMemberView,
          { ...orderByBoardIdAndInviterIdAsc, filter, last: 4 },
          asAdmin(),
        );

        expect(invites).toMatchSnapshot();
      });
    });

    describe('filter with nested logical operators', () => {
      const filter = {
        $and: [
          {
            boardId: {
              $gt: 30,
              $lt: 40,
            },
          },
          {
            username: {
              $contains: 't',
            },
          },
          {
            inviteCount: {
              $in: [1, 4, 6],
            },
          },
          {
            $or: [
              {
                username: 'tiana281',
              },
              {
                username: 'jonathon586',
              },
            ],
          },
        ],
      };

      it('AND + OR', async () => {
        const invites = await find(
          BoardMemberView,
          { ...orderByBoardIdAndInviterIdAsc, filter },
          asAdmin(),
        );

        expect(invites).toMatchSnapshot();
      });
    });
  });

  it('parentConnection', async () => {
    const parentConnection = {
      id: 79,
      attribute: 'inviterId',
    };

    const result = await find(
      BoardMemberView,
      { ...orderByBoardIdAndInviterIdAsc },
      asAdmin(),
      parentConnection,
    );

    expect(result).toMatchSnapshot();
  });

  it('parentConnection + first', async () => {
    const parentConnection = {
      id: 79,
      attribute: 'inviterId',
    };

    const result = await find(
      BoardMemberView,
      { ...orderByBoardIdAndInviterIdAsc, first: 1 },
      asAdmin(),
      parentConnection,
    );

    expect(result).toMatchSnapshot();
  });

  it('parentConnection with invalid attribute (reject)', async () => {
    const parentConnection = {
      id: 60,
      attribute: 'invalidAttributeName',
    };

    await find(
      BoardMemberView,
      { ...orderByBoardIdAndInviterIdAsc, first: 1 },
      asAdmin(),
      parentConnection,
    ).catch(e => {
      expect(e).toMatchSnapshot();
    });
  });
});
