import './setupAndTearDown';
import {
  find,
  count,
} from './db';

import {
  asUser,
  removeListDynamicData,
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
      const result = await find(Board, { ...orderByIdAsc }, asUser(46))
      result.data = removeListDynamicData(Board, result.data)
      expect(result).toMatchSnapshot('list')

      const rowCount = await count(Board, {}, asUser(46))
      expect(rowCount).toMatchSnapshot('count')
    })


  })

})
