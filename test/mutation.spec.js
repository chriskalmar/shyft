import './setupAndTearDown';
import {
  mutate,
} from './db';

import {
  asUser,
  removeDynamicData,
} from './testUtils';

import { BoardMember } from './models/BoardMember';
import { Board } from './models/Board';
import { Book } from './models/Book';


describe('mutation', () => {

  it('reject mutations without state transitions on stateful entities', async () => {

    const payload = {
      board: 50,
    }

    await mutate(BoardMember, 'create', payload, null, asUser(99))
      .catch(e => {
        expect(e).toMatchSnapshot()
      })

  })



  it('perform create mutations', async () => {

    const payload = {
      board: 47,
    }

    const result = await mutate(BoardMember, 'join', payload, null, asUser(99))
    expect(removeDynamicData(BoardMember, result)).toMatchSnapshot()
  })


  it('perform create mutations with nested JSON attributes', async () => {

    const payload = {
      title: 'War and Peace',
      author: 'Leo Tolstoy',
      reviews: [
        {
          reviewer: 'John Connor',
          reviewText: 'Couldn\'t stop reading',
          bookAttributes: [
            {
              attribute: 'Year of publishing',
              value: '1867',
            },
            {
              attribute: 'Pages',
              value: '1225',
            },
          ]
        },
      ]
    }

    const result = await mutate(Book, 'create', payload, null, asUser(99))
    expect(result).toMatchSnapshot()
  })


  it('perform update mutations', async () => {

    const payload = {
      board: 50,
      invitee: 80,
    }

    let result = await mutate(BoardMember, 'invite', payload, null, asUser(84))
    const inviteId = result.id
    expect(removeDynamicData(BoardMember, result)).toMatchSnapshot()

    result = await mutate(BoardMember, 'accept', {}, inviteId, asUser(80))
    expect(removeDynamicData(BoardMember, result)).toMatchSnapshot()
  })


  it('handle uniqueness constraints', async () => {

    const payload = {
      name: 'New Board',
      isPrivate: false,
    }

    await mutate(Board, 'build', payload, null, asUser(99))

    await mutate(Board, 'build', payload, null, asUser(99))
      .catch(e => {
        expect(e).toMatchSnapshot()
      })
  })


  it('perform delete mutations', async () => {

    const payload = {
      board: 50,
      invitee: 81,
    }

    let result = await mutate(BoardMember, 'invite', payload, null, asUser(84))
    const inviteId = result.id
    expect(removeDynamicData(BoardMember, result)).toMatchSnapshot()

    result = await mutate(BoardMember, 'remove', {}, inviteId, asUser(84))
    expect(removeDynamicData(BoardMember, result)).toMatchSnapshot()
  })


  it('fail mutation if fromState is not a match', async () => {

    const payload = {
      board: 50,
      invitee: 81,
    }

    const result = await mutate(BoardMember, 'invite', payload, null, asUser(84))
    const inviteId = result.id

    await mutate(BoardMember, 'accept', {}, inviteId, asUser(81))

    await mutate(BoardMember, 'accept', {}, inviteId, asUser(81))
      .catch(e => {
        expect(e).toMatchSnapshot()
      })
  })



  it('reject mutations if ID not found', async () => {

    await mutate(BoardMember, 'remove', {}, 99999, asUser(80))
      .catch(e => {
        expect(e).toMatchSnapshot()
      })
  })


  it('reject unknown mutations', async () => {

    await mutate(BoardMember, 'findInnerPeace', {}, 1, asUser(80))
      .catch(e => {
        expect(e).toMatchSnapshot()
      })
  })

})
