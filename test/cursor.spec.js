import './setupAndTearDown';
import {
  find,
} from './db';

import {
  asAdmin,
  removeListDynamicData,
} from './testUtils';

import { Profile } from './models/Profile';


const orderByUsernameAsc = {
  orderBy: [{
    attribute: 'username',
    direction: 'ASC'
  }]
}

const orderByUsernameDesc = {
  orderBy: [{
    attribute: 'username',
    direction: 'DESC'
  }]
}

describe('cursor', () => {

  it('after', async () => {

    const cursor = {
      after: {
        Profile: [
          [
            'username',
            'amalia943'
          ],
          [
            'id',
            65
          ]
        ]
      }
    }

    const result = await find(Profile, { ...orderByUsernameAsc, ...cursor }, asAdmin())
    result.data = removeListDynamicData(Profile, result.data)

    expect(result).toMatchSnapshot()
  })


  it('before', async () => {

    const cursor = {
      before: {
        Profile: [
          [
            'username',
            'amalia943'
          ],
          [
            'id',
            65
          ]
        ]
      }
    }

    const result = await find(Profile, { ...orderByUsernameAsc, ...cursor }, asAdmin())
    result.data = removeListDynamicData(Profile, result.data)

    expect(result).toMatchSnapshot()
  })


  it('after + filter', async () => {

    const cursor = {
      after: {
        Profile: [
          [
            'username',
            'ella377'
          ],
          [
            'id',
            103
          ]
        ]
      }
    }

    const filter = {
      username: {
        $starts_with: 'e',
        $not_ends_with: '3',
      }
    }

    const result = await find(Profile, { ...orderByUsernameAsc, ...cursor, filter, first: 4 }, asAdmin())
    result.data = removeListDynamicData(Profile, result.data)
    // console.log(JSON.stringify(result, null, 2));
    expect(result).toMatchSnapshot()
  })


  it('before + filter', async () => {

    const cursor = {
      before: {
        Profile: [
          [
            'username',
            'emilia189'
          ],
          [
            'id',
            90
          ]
        ]
      }
    }

    const filter = {
      username: {
        $starts_with: 'e',
        $not_ends_with: '3',
      }
    }

    const result = await find(Profile, { ...orderByUsernameAsc, ...cursor, filter, first: 4 }, asAdmin())
    result.data = removeListDynamicData(Profile, result.data)
    // console.log(JSON.stringify(result, null, 2));
    expect(result).toMatchSnapshot()
  })


  it('after + before + filter + offset', async () => {

    const cursor = {
      after: {
        Profile: [
          [
            'username',
            'estell684'
          ],
          [
            'id',
            70
          ]
        ]
      },
      before: {
        Profile: [
          [
            'username',
            'edward969'
          ],
          [
            'id',
            8
          ]
        ]
      }
    }

    const filter = {
      username: {
        $starts_with: 'e',
        $not_ends_with: '3',
      }
    }

    let result

    result = await find(Profile, { ...orderByUsernameDesc, ...cursor, filter, offset: 3, first: 2 }, asAdmin())
    result.data = removeListDynamicData(Profile, result.data)
    expect(result).toMatchSnapshot()

    result = await find(Profile, { ...orderByUsernameDesc, ...cursor, filter, offset: 3, last: 2 }, asAdmin())
    result.data = removeListDynamicData(Profile, result.data)
    expect(result).toMatchSnapshot()
  })


})
