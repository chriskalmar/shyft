import './setupAndTearDown';
import {
  count,
} from './db';

import {
  asAdmin,
} from './testUtils';

import { counts } from './testSetGenerator';

import { Profile } from './models/Profile';
import { Board } from './models/Board';
import { BoardMember } from './models/BoardMember';


describe('postgres', () => {

  it('test data imported correctly', async () => {
    const profileCount = await count(Profile, {}, asAdmin())
    expect(profileCount).toEqual(counts.profileCount)

    const boardCount = await count(Board, {}, asAdmin())
    expect(boardCount).toEqual(counts.boardCount)

    const memberCount = await count(BoardMember, {}, asAdmin())
    expect(memberCount).toEqual(counts.joinCount + counts.inviteCount)
  })

})
