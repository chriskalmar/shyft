import './setupAndTearDown';
import {
  find,
} from './db';

import {
  asAdmin,
  removeListDynamicData,
} from './testUtils';

import { Profile } from './models/Profile';
import { Board } from './models/Board';
import { Participant } from './models/Participant';


const orderByIdAsc = {
  orderBy: [{
    attribute: 'id',
    direction: 'ASC'
  }]
}

const orderByIdDesc = {
  orderBy: [{
    attribute: 'id',
    direction: 'DESC'
  }]
}

describe('list', () => {

  it('orderBy', async () => {
    const profiles = await find(Profile, { ...orderByIdAsc }, asAdmin())
    profiles.data = removeListDynamicData(Profile, profiles.data)
    expect(profiles).toMatchSnapshot()
  })


  it('orderBy + first', async () => {
    const profiles = await find(Profile, { ...orderByIdAsc, first: 3 }, asAdmin())
    profiles.data = removeListDynamicData(Profile, profiles.data)
    expect(profiles).toMatchSnapshot()
  })


  it('orderBy + first 0', async () => {
    const profiles = await find(Profile, { ...orderByIdAsc, first: 0 }, asAdmin())
    expect(profiles).toMatchSnapshot()
  })


  it('orderBy + last', async () => {
    const profiles = await find(Profile, { ...orderByIdAsc, last: 3 }, asAdmin())
    profiles.data = removeListDynamicData(Profile, profiles.data)
    expect(profiles).toMatchSnapshot()
  })


  it('descending orderBy', async () => {
    const profiles = await find(Profile, { ...orderByIdDesc }, asAdmin())
    profiles.data = removeListDynamicData(Profile, profiles.data)
    expect(profiles).toMatchSnapshot()
  })


  it('descending orderBy + first', async () => {
    const profiles = await find(Profile, { ...orderByIdDesc, first: 3 }, asAdmin())
    profiles.data = removeListDynamicData(Profile, profiles.data)
    expect(profiles).toMatchSnapshot()
  })


  it('descending orderBy + last', async () => {
    const profiles = await find(Profile, { ...orderByIdDesc, last: 3 }, asAdmin())
    profiles.data = removeListDynamicData(Profile, profiles.data)
    expect(profiles).toMatchSnapshot()
  })


  it('orderBy + offset', async () => {
    const profiles = await find(Profile, { ...orderByIdAsc, offset: 5}, asAdmin())
    profiles.data = removeListDynamicData(Profile, profiles.data)
    expect(profiles).toMatchSnapshot()
  })


  it('orderBy + first + offset', async () => {
    const profiles = await find(Profile, { ...orderByIdAsc, first: 3, offset: 5 }, asAdmin())
    profiles.data = removeListDynamicData(Profile, profiles.data)
    expect(profiles).toMatchSnapshot()
  })


  it('orderBy + last + offset', async () => {
    const profiles = await find(Profile, { ...orderByIdAsc, last: 3, offset: 5 }, asAdmin())
    profiles.data = removeListDynamicData(Profile, profiles.data)
    expect(profiles).toMatchSnapshot()
  })


  it('descending orderBy + offset', async () => {
    const profiles = await find(Profile, { ...orderByIdDesc, offset: 5 }, asAdmin())
    profiles.data = removeListDynamicData(Profile, profiles.data)
    expect(profiles).toMatchSnapshot()
  })


  it('descending orderBy + first + offset', async () => {
    const profiles = await find(Profile, { ...orderByIdDesc, first: 3, offset: 5 }, asAdmin())
    profiles.data = removeListDynamicData(Profile, profiles.data)
    expect(profiles).toMatchSnapshot()
  })


  it('descending orderBy + last + offset', async () => {
    const profiles = await find(Profile, { ...orderByIdDesc, last: 3, offset: 5 }, asAdmin())
    profiles.data = removeListDynamicData(Profile, profiles.data)
    expect(profiles).toMatchSnapshot()
  })


  it('filter', async () => {
    const filter = {
      username: 'hazel528'
    }

    const result = await find(Profile, { ...orderByIdAsc, filter }, asAdmin())
    result.data = removeListDynamicData(Profile, result.data)
    expect(result).toMatchSnapshot()
  })


  it('filter with no results', async () => {
    const filter = {
      username: '---not-found---'
    }

    const result = await find(Profile, { ...orderByIdAsc, filter }, asAdmin())
    result.data = removeListDynamicData(Profile, result.data)
    expect(result).toMatchSnapshot()
  })


  it('filter with mutliple attributes', async () => {
    const filter = {
      name: 'Veritatis nihil cum',
      isPrivate: true,
    }

    const result = await find(Board, { ...orderByIdAsc, filter }, asAdmin())
    result.data = removeListDynamicData(Board, result.data)
    expect(result).toMatchSnapshot()
  })


  it('filter with invalid attributes (reject)', async () => {
    const filter = {
      someAttributes: 'Veritatis nihil cum',
    }

    await find(Board, { ...orderByIdAsc, filter }, asAdmin())
      .catch(e => {
        expect(e).toMatchSnapshot()
      })
  })


  describe('filter with logical operators', () => {

    describe('OR', () => {

      const orderBy = [{
        attribute: 'registeredAt',
        direction: 'DESC'
      }]

      const filter = {
        OR: [
          {
            username: 'dana768'
          },
          {
            username: 'weston422'
          },
          {
            username__starts_with: 'jo',
            username__ends_with: '56'
          },
        ]
      }


      it('OR + orderBy', async () => {
        const result = await find(Profile, { orderBy, filter }, asAdmin())
        result.data = removeListDynamicData(Profile, result.data)
        expect(result).toMatchSnapshot()
      })


      it('OR + offset', async () => {
        const result = await find(Profile, { orderBy, filter, offset: 1 }, asAdmin())
        result.data = removeListDynamicData(Profile, result.data)
        expect(result).toMatchSnapshot()
      })


      it('OR + last', async () => {
        const result = await find(Profile, { orderBy, filter, last: 3 }, asAdmin())
        result.data = removeListDynamicData(Profile, result.data)
        expect(result).toMatchSnapshot()
      })

    })


    describe('AND', () => {

      const orderBy = [{
        attribute: 'createdAt',
        direction: 'DESC'
      }]

      const filter = {
        AND: [
          {
            board__gt: 30,
            board__lt: 40
          },
          {
            state__in: [
              20,
              50
            ]
          },
          {
            inviter__in: [
              61,
              78
            ]
          }
        ]
      }


      it('AND + orderBy', async () => {
        const result = await find(Participant, { orderBy, filter }, asAdmin())
        result.data = removeListDynamicData(Participant, result.data)
        expect(result).toMatchSnapshot()
      })


      it('AND + offset', async () => {
        const result = await find(Participant, { orderBy, filter, offset: 4 }, asAdmin())
        result.data = removeListDynamicData(Participant, result.data)
        expect(result).toMatchSnapshot()
      })


      it('AND + last', async () => {
        const result = await find(Participant, { orderBy, filter, last: 4 }, asAdmin())
        result.data = removeListDynamicData(Participant, result.data)
        expect(result).toMatchSnapshot()
      })

    })



    describe('filter with nested logical operators', () => {

      const orderBy = [{
        attribute: 'board',
        direction: 'ASC'
      }]

      const filter = {
        AND: [
          {
            board__gt: 30,
            board__lt: 40
          },
          {
            state__in: [
              20,
              50
            ]
          },
          {
            inviter__in: [
              61,
              78
            ]
          },
          {
            OR: [
              {
                invitee: 107
              },
              {
                invitee: 21
              },
              {
                invitee: 38
              },
              {
                invitee__gt: 60,
                invitee__lt: 62
              }
            ]
          }
        ]
      }


      it('AND + OR', async () => {
        const result = await find(Participant, { orderBy, filter }, asAdmin())
        result.data = removeListDynamicData(Participant, result.data)
        expect(result).toMatchSnapshot()
      })

    })

  })


  it('parentConnection', async () => {
    const parentConnection = {
      id: 60,
      attribute: 'inviter'
    }

    const result = await find(Participant, { ...orderByIdAsc }, asAdmin(), parentConnection)
    result.data = removeListDynamicData(Participant, result.data)
    expect(result).toMatchSnapshot()
  })


  it('parentConnection + first', async () => {
    const parentConnection = {
      id: 60,
      attribute: 'inviter'
    }

    const result = await find(Participant, { ...orderByIdAsc, first: 1 }, asAdmin(), parentConnection)
    result.data = removeListDynamicData(Participant, result.data)
    expect(result).toMatchSnapshot()
  })


  it('parentConnection with invalid attribute (reject)', async () => {
    const parentConnection = {
      id: 60,
      attribute: 'invalidAttributeName'
    }

    await await find(Participant, { ...orderByIdAsc }, asAdmin(), parentConnection)
      .catch(e => {
        expect(e).toMatchSnapshot()
      })
  })



})
