

import { readRows } from './testingData';
import { Profile } from './models/Profile';
import { Board } from './models/Board';
import {
  mutate,
  findOneByValue,
} from './db';
import {
  asAdmin,
  asUser,
  asyncForEach,
} from './testUtils';
import { Participant } from './models/Participant';



export const loadData = async () => {

  const profiles = readRows('profiles')

  await asyncForEach(profiles, async ([ username, password]) => {
    const payload = {
      username,
      password,
    }

    await mutate(Profile, 'signup', payload, null, asAdmin())
  })


  const boards = readRows('boards')

  await asyncForEach(boards, async ([ name, userId, isPrivate]) => {
    const payload = {
      name,
      isPrivate: isPrivate === '1',
    }

    await mutate(Board, 'build', payload, null, asUser(userId))
  })



  const boardsCache = {}

  const getBoardIdByName = async(name, userId) => {
    if (!boardsCache[name]) {
      const payload = {
        name,
      }

      const board = await findOneByValue(Board, payload, asUser(userId))
      boardsCache[name] = board.id
    }

    return boardsCache[name]
  }


  const joins = readRows('joins')

  await asyncForEach(joins, async ([ name, userId]) => {

    const payload = {
      board: await getBoardIdByName(name, userId),
    }

    await mutate(Participant, 'join', payload, null, asUser(userId))
  })


  const invites = readRows('invites')

  await asyncForEach(invites, async ([name, inviter, invitee, accept]) => {

    const payload = {
      board: await getBoardIdByName(name, inviter),
      invitee,
    }

    const invitation = await mutate(Participant, 'invite', payload, null, asUser(inviter))

    if (accept === '1') {
      await mutate(Participant, 'accept', {}, invitation.id, asUser(invitee))
    }
  })

}
