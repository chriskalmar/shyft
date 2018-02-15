import './beforeAll';
import {
  count,
  findOne,
  findOneByValue,
} from './db';

import {
  asAdmin,
  removeDynamicData,
} from './testUtils';

import { counts } from './testSetGenerator';

import { Profile } from './models/Profile';
import { Board } from './models/Board';
import { Participant } from './models/Participant';


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


  it('should fetch instances by value', async () => {
    let profile

    profile = await findOneByValue(Profile, { username: '----unknown----' }, asAdmin(context))
    expect(profile).toBeUndefined()

    profile = await findOneByValue(Profile, { username: 'katrina560' }, asAdmin(context))
    expect(removeDynamicData(Profile, profile)).toMatchSnapshot()

    profile = await findOneByValue(Profile, { username: 'clark218' }, asAdmin(context))
    expect(removeDynamicData(Profile, profile)).toMatchSnapshot()

    profile = await findOneByValue(Profile, { }, asAdmin(context))
    expect(removeDynamicData(Profile, profile)).toMatchSnapshot()

    let participant

    participant = await findOneByValue(Participant, { board: 9999 }, asAdmin(context))
    expect(participant).toBeUndefined()

    participant = await findOneByValue(Participant, { board: 9, invitee: 7, inviter: 52 }, asAdmin(context))
    expect(removeDynamicData(Participant, participant)).toMatchSnapshot()

    participant = await findOneByValue(Participant, { }, asAdmin(context))
    expect(removeDynamicData(Participant, participant)).toMatchSnapshot()

  })


})
