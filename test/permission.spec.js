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
        console.log(JSON.stringify(rowCount, null, 2));
      })
    })


  })

})
