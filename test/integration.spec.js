
import {
  initDB,
  count,
} from './db';

import {
  asAdmin,
} from './testUtils';

import { counts } from './testSetGenerator';
import { loadData } from './loadData';

import { Profile } from './models/Profile';
import { Board } from './models/Board';
import { Participant } from './models/Participant';

const context = {
  loaders: {},
}


beforeAll(() => {
  return initDB()
    .then(async (db) => {
      context.postgresDB = db
      await loadData(context)
    })
})


describe('postgres', () => {

  it('test data imported correctly', async () => {
    const profileCount = await count(Profile, {}, asAdmin(context))
    expect(profileCount).toEqual(counts.profileCount)

    const boardCount = await count(Board, {}, asAdmin(context))
    expect(boardCount).toEqual(counts.boardCount)

    const participantCount = await count(Participant, {}, asAdmin(context))
    expect(participantCount).toEqual(counts.joinCount + counts.inviteCount)
  })

})
