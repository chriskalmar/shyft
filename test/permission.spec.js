import './setupAndTearDown';
import {
  find,
  count,
} from './db';

import {
  asUser,
  removeListDynamicData,
  asyncForEach,
} from './testUtils';


import { Board } from './models/Board';
import { Participant } from './models/Participant';



const orderByIdAsc = {
  orderBy: [{
    attribute: 'id',
    direction: 'ASC'
  }]
}


describe('permission', () => {
  describe('story', () => {

    it('a user should only see public boards and boards the user was invited to', async () => {

      const userIds = [46, 69, 40]

      await asyncForEach(userIds, async userId => {
        const result = await find(Board, { ...orderByIdAsc }, asUser(userId))
        result.data = removeListDynamicData(Board, result.data)
        expect(result).toMatchSnapshot('list')

        const rowCount = await count(Board, { }, asUser(userId))
        expect(rowCount).toMatchSnapshot('count')
      })

      const filter = {
        isPrivate: true
      }

      await asyncForEach(userIds, async userId => {
        const result = await find(Board, { ...orderByIdAsc, filter }, asUser(userId))
        result.data = removeListDynamicData(Board, result.data)
        expect(result).toMatchSnapshot('private list')

        const rowCount = await count(Board, { filter }, asUser(userId))
        expect(rowCount).toMatchSnapshot('private count')
      })
    })


    it('a user should only see participants of boards the user is part of', async () => {

      const userIds = [46, 69, 40]

      await asyncForEach(userIds, async userId => {
        const result = await find(Participant, { ...orderByIdAsc }, asUser(userId))
        result.data = removeListDynamicData(Participant, result.data)
        expect(result).toMatchSnapshot('list')

        const rowCount = await count(Participant, {}, asUser(userId))
        expect(rowCount).toMatchSnapshot('count')
      })

      await asyncForEach(userIds, async userId => {

        const filter = {
          invitee: {
            $ne: userId
          }
        }

        const result = await find(Participant, { ...orderByIdAsc, filter }, asUser(userId))
        result.data = removeListDynamicData(Participant, result.data)
        expect(result).toMatchSnapshot('list')

        const rowCount = await count(Participant, { filter }, asUser(userId))
        expect(rowCount).toMatchSnapshot('count')
      })

    })


  })

})
