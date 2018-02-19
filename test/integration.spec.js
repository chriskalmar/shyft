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
import { Participant } from './models/Participant';


describe('postgres', () => {

  it('test data imported correctly', async () => {
    const profileCount = await count(Profile, {}, asAdmin())
    expect(profileCount).toEqual(counts.profileCount)

    const boardCount = await count(Board, {}, asAdmin())
    expect(boardCount).toEqual(counts.boardCount)

    const participantCount = await count(Participant, {}, asAdmin())
    expect(participantCount).toEqual(counts.joinCount + counts.inviteCount)
  })

})
