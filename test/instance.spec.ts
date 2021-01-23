import './setupAndTearDown';
import { findOne, findOneByValue } from './db';

import { asAdmin, removeDynamicData, removeListDynamicData } from './testUtils';

import { Profile } from './models/Profile';
import { Board } from './models/Board';
import { BoardMember } from './models/BoardMember';

describe('postgres', () => {
  it('should fetch instances by ID', async () => {
    let profile;

    profile = await findOne(Profile, 10, {}, asAdmin());
    expect(removeDynamicData(Profile, profile)).toMatchSnapshot();

    profile = await findOne(Profile, 20, {}, asAdmin());
    expect(removeDynamicData(Profile, profile)).toMatchSnapshot();

    profile = await findOne(Profile, 30, {}, asAdmin());
    expect(removeDynamicData(Profile, profile)).toMatchSnapshot();

    let board;

    board = await findOne(Board, 10, {}, asAdmin());
    expect(removeDynamicData(Board, board)).toMatchSnapshot();

    board = await findOne(Board, 20, {}, asAdmin());
    expect(removeDynamicData(Board, board)).toMatchSnapshot();

    board = await findOne(Board, 30, {}, asAdmin());
    expect(removeDynamicData(Board, board)).toMatchSnapshot();

    let boardMember;

    boardMember = await findOne(BoardMember, 200, {}, asAdmin());
    expect(removeDynamicData(BoardMember, boardMember)).toMatchSnapshot();

    boardMember = await findOne(BoardMember, 201, {}, asAdmin());
    expect(removeDynamicData(BoardMember, boardMember)).toMatchSnapshot();

    boardMember = await findOne(BoardMember, 202, {}, asAdmin());
    expect(removeDynamicData(BoardMember, boardMember)).toMatchSnapshot();
  });

  it('should fetch instances by value', async () => {
    let profile;

    profile = await findOneByValue(
      Profile,
      { username: '----unknown----' },
      asAdmin(),
    );
    expect(profile).toBeUndefined();

    profile = await findOneByValue(
      Profile,
      { username: 'katrina560' },
      asAdmin(),
    );
    expect(removeDynamicData(Profile, profile)).toMatchSnapshot();

    profile = await findOneByValue(
      Profile,
      { username: 'clark218' },
      asAdmin(),
    );
    expect(removeDynamicData(Profile, profile)).toMatchSnapshot();

    profile = await findOneByValue(Profile, {}, asAdmin());
    expect(removeDynamicData(Profile, profile)).toMatchSnapshot();

    let boardMember;

    boardMember = await findOneByValue(BoardMember, { board: 9999 }, asAdmin());
    expect(boardMember).toBeUndefined();

    boardMember = await findOneByValue(
      BoardMember,
      { board: 9, invitee: 7, inviter: 52 },
      asAdmin(),
    );
    expect(removeDynamicData(BoardMember, boardMember)).toMatchSnapshot();

    boardMember = await findOneByValue(BoardMember, {}, asAdmin());
    expect(removeDynamicData(BoardMember, boardMember)).toMatchSnapshot();
  });

  it('should utilize data loader', async () => {
    const context = asAdmin();

    const result = await Promise.all([
      findOne(Profile, 10, {}, context),
      findOne(Profile, 20, {}, context),
      findOne(Profile, 30, {}, context),
      findOne(Profile, 20, {}, context),
      findOne(Profile, 10, {}, context),
      findOneByValue(Profile, { username: 'katrina560' }, context),
      findOneByValue(Profile, { username: 'clark218' }, context),
      findOneByValue(Profile, { username: 'katrina560' }, context),
    ]);

    expect(removeListDynamicData(Profile, result)).toMatchSnapshot();
  });

  it('should return null when instance is not found', async () => {
    const profile = await findOne(Profile, 10000, {}, asAdmin());
    expect(profile).toBeNull();
  });
});
