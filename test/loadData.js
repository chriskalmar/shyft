

import { readRows } from './testingData';
import { Profile } from './models/Profile';
import {
  mutate,
} from './db';
import {
  asAdmin,
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

}
