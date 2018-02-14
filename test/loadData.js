

import { readRows } from './testingData';
import { Profile } from './models/Profile';
import { Board } from './models/Board';
import {
  mutate,
} from './db';
import {
  asAdmin,
  asUser,
  asyncForEach,
} from './testUtils';



export const loadData = async (context) => {

  const profiles = readRows('profiles')

  await asyncForEach(profiles, async ([ username, password]) => {
    const payload = {
      username,
      password,
    }

    await mutate(Profile, 'signup', payload, null, asAdmin(context))
  })


  const boards = readRows('boards')

  await asyncForEach(boards, async ([ name, userId, isPrivate]) => {
    const payload = {
      name,
      isPrivate: isPrivate === '1',
    }

    await mutate(Board, 'build', payload, null, asUser(context, userId))
  })

}
