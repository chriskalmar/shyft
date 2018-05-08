import './setupAndTearDown';
import {
  find,
} from './db';

import {
  asAdmin,
  removeListDynamicData,
} from './testUtils';

import { Profile } from './models/Profile';
import { Message } from './models/Message';


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


const orderByWrittenAtAsc = {
  orderBy: [{
    attribute: 'writtenAt',
    direction: 'ASC'
  }]
}

const orderByWrittenAtDesc = {
  orderBy: [{
    attribute: 'writtenAt',
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


  it('mutli-key after + before', async () => {

    const orderByNames = {
      orderBy: [
        {
          attribute: 'firstname',
          direction: 'ASC'
        },
        {
          attribute: 'lastname',
          direction: 'DESC'
        },
        {
          attribute: 'id',
          direction: 'ASC'
        },
      ]
    }


    const cursor = {
      after: {
        Profile: [
          [
            'firstname',
            'Joe'
          ],
          [
            'lastname',
            'Ratke'
          ],
          [
            'id',
            104
          ]
        ]
      },
      before: {
        Profile: [
          [
            'firstname',
            'Jose'
          ],
          [
            'lastname',
            'Leffler'
          ],
          [
            'id',
            71
          ]
        ]
      }
    }

    const filter = {
      username: {
        $starts_with: 'jo',
      }
    }

    const result = await find(Profile, { ...orderByNames, ...cursor, filter }, asAdmin())
    result.data = removeListDynamicData(Profile, result.data)
    expect(result).toMatchSnapshot()
  })



  it('time-based after + first', async () => {

    const differentiatorId = [7, 40, 20]

    await Promise.all(differentiatorId.map(async (id) => {


      const cursor = {
        after: {
          Message: [
            [
              'writtenAt',
              '2018-03-26 20:47:46.578Z'
            ],
            [
              'id',
              id
            ]
          ]
        }
      }


      const result = await find(Message, { ...orderByWrittenAtDesc, ...cursor, first: 6 }, asAdmin())
      result.data = removeListDynamicData(Message, result.data)
      expect(result).toMatchSnapshot(`id: ${id}`)
    }))
  })


  it('time-based before + last', async () => {

    const differentiatorId = [7, 40, 20]

    await Promise.all(differentiatorId.map(async (id) => {


      const cursor = {
        before: {
          Message: [
            [
              'writtenAt',
              '2018-03-26 20:47:46.578Z'
            ],
            [
              'id',
              id
            ]
          ]
        }
      }


      const result = await find(Message, { ...orderByWrittenAtAsc, ...cursor, last: 6 }, asAdmin())
      result.data = removeListDynamicData(Message, result.data)
      expect(result).toMatchSnapshot(`id: ${id}`)
    }))
  })


})
