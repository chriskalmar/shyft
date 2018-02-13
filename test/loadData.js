
import { mutate } from './db';

import { Profile } from './models/Profile';


const buildArray = (length, value=1) => {
  return (new Array(length)).fill(value)
}

export const loadData = async (context) => {

  return Promise.all(buildArray(10).map(async (item, idx) => {
    const payload = {
      username: `user${idx}`,
      password: `pa$$${idx}`,
    }

    await mutate(Profile, 'signup', payload, null, context)
  }))

}
