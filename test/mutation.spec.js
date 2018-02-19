import './setupAndTearDown';
import {
  mutate,
} from './db';

import {
  asUser,
  removeDynamicData,
} from './testUtils';

import { Participant } from './models/Participant';


describe.only('mutation', () => {

  it('reject mutations without state transitions on stateful entities', async () => {

    const payload = {
      board: 50,
    }

    await mutate(Participant, 'create', payload, null, asUser(99))
      .catch(e => {
        expect(e).toMatchSnapshot()
      })

  })


  // let joinId

  it('perform create mutations', async () => {

    const payload = {
      board: 50,
    }

    const result = await mutate(Participant, 'join', payload, null, asUser(99))
    // joinId = result.dataValues.id
    expect(removeDynamicData(Participant, result.dataValues)).toMatchSnapshot()
  })

  it('handle uniqueness constraints', async () => {

    const payload = {
      board: 50,
    }

    await mutate(Participant, 'join', payload, null, asUser(99))
      .catch(e => {
        expect(e).toMatchSnapshot()
      })
  })


})
