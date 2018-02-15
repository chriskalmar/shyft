
import {
  initDB,
  count,
  findOne,
} from './db';

import {
  asAdmin,
  removeDynamicData,
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


  it('should fetch instances by ID', async () => {
    let profile

    profile = await findOne(Profile, 10, {}, asAdmin(context))
    expect(removeDynamicData(Profile, profile)).toMatchSnapshot()

    profile = await findOne(Profile, 20, {}, asAdmin(context))
    expect(removeDynamicData(Profile, profile)).toMatchSnapshot()

    profile = await findOne(Profile, 30, {}, asAdmin(context))
    expect(removeDynamicData(Profile, profile)).toMatchSnapshot()


    let board

    board = await findOne(Board, 10, {}, asAdmin(context))
    expect(removeDynamicData(Board, board)).toMatchSnapshot()

    board = await findOne(Board, 20, {}, asAdmin(context))
    expect(removeDynamicData(Board, board)).toMatchSnapshot()

    board = await findOne(Board, 30, {}, asAdmin(context))
    expect(removeDynamicData(Board, board)).toMatchSnapshot()


    let participant

    participant = await findOne(Participant, 200, {}, asAdmin(context))
    expect(removeDynamicData(Participant, participant)).toMatchSnapshot()

    participant = await findOne(Participant, 201, {}, asAdmin(context))
    expect(removeDynamicData(Participant, participant)).toMatchSnapshot()

    participant = await findOne(Participant, 202, {}, asAdmin(context))
    expect(removeDynamicData(Participant, participant)).toMatchSnapshot()
  })

})
