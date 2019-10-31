import './setupAndTearDown';
import { find } from './db';

import { asAdmin, removeListDynamicData } from './testUtils';

import { Profile } from './models/Profile';
import { Board } from './models/Board';
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

const orderByBoardIdDesc = {
  orderBy: [
    {
      attribute: 'boardId',
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
});
