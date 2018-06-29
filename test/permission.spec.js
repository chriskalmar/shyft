import './setupAndTearDown';
import {
  find,
  count,
  mutate,
} from './db';

import {
  asUser,
  removeListDynamicData,
  removeDynamicData,
  asyncForEach,
} from './testUtils';


import { Board } from './models/Board';
import { BoardMember } from './models/BoardMember';



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


    it('a user should only see members of boards the user is part of', async () => {

      const userIds = [46, 69, 40]

      await asyncForEach(userIds, async userId => {
        const result = await find(BoardMember, { ...orderByIdAsc }, asUser(userId))
        result.data = removeListDynamicData(BoardMember, result.data)
        expect(result).toMatchSnapshot('list')

        const rowCount = await count(BoardMember, {}, asUser(userId))
        expect(rowCount).toMatchSnapshot('count')
      })

      await asyncForEach(userIds, async userId => {

        const filter = {
          invitee: {
            $ne: userId
          }
        }

        const result = await find(BoardMember, { ...orderByIdAsc, filter }, asUser(userId))
        result.data = removeListDynamicData(BoardMember, result.data)
        expect(result).toMatchSnapshot('list')

        const rowCount = await count(BoardMember, { filter }, asUser(userId))
        expect(rowCount).toMatchSnapshot('count')
      })

    })


    const joinCache = []

    it('a user should be able to join public boards', async () => {

      const userIds = [30, 33, 79]
      const board = 11

      await asyncForEach(userIds, async userId => {
        const result = await mutate(BoardMember, 'join', { board }, null, asUser(userId))
        const cleanedResult = removeDynamicData(BoardMember, result)
        expect(cleanedResult).toMatchSnapshot()
        joinCache.push(cleanedResult)
      })
    })


    it('a user should be able to leave public boards', async () => {

      const {
        invitee,
        id,
      } = joinCache[0]

      const result = await mutate(BoardMember, 'leave', { }, id, asUser(invitee))
      const cleanedResult = removeDynamicData(BoardMember, result)
      expect(cleanedResult).toMatchSnapshot()
    })


    it('a user should not be able to leave public boards on someone\'s behalf', async () => {

      const otherUser = '50'
      const {
        id,
      } = joinCache[1]

      await mutate(BoardMember, 'leave', {}, id, asUser(otherUser))
        .catch(e => {
          expect(e).toMatchSnapshot()
        })
    })


    it('a user should not be able to remove a user from a group as a non-owner', async () => {

      const notOwner = '50'
      const {
        id,
      } = joinCache[1]

      await mutate(BoardMember, 'remove', {}, id, asUser(notOwner))
        .catch(e => {
          expect(e).toMatchSnapshot()
        })
    })


    it('a user should be able to remove a user from a group as owner', async () => {

      const owner = 81
      const {
        id,
      } = joinCache[1]

      const result = await mutate(BoardMember, 'remove', {}, id, asUser(owner))
      const cleanedResult = removeDynamicData(BoardMember, result)
      expect(cleanedResult).toMatchSnapshot()
    })


    it('a user should not be able to join private boards', async () => {

      const userIds = [30, 33, 79]
      const board = 45

      await asyncForEach(userIds, async userId => {
        await mutate(BoardMember, 'join', { board }, null, asUser(userId))
          .catch(e => {
            expect(e).toMatchSnapshot()
          })
      })
    })



    it('a user should not be able to invite users to others boards', async () => {

      const inviter = 10
      const userIds = [30, 33, 79]
      const board = 45

      await asyncForEach(userIds, async invitee => {
        await mutate(BoardMember, 'invite', { board, invitee }, null, asUser(inviter))
        .catch(e => {
          expect(e).toMatchSnapshot()
        })
      })
    })


    const invitesCache = []

    it('a user should be able to invite users to an owned boards', async () => {

      const inviter = 85
      const userIds = [30, 33, 79]
      const board = 45

      await asyncForEach(userIds, async invitee => {
        const result = await mutate(BoardMember, 'invite', { board, invitee }, null, asUser(inviter))
        const cleanedResult = removeDynamicData(BoardMember, result)
        expect(cleanedResult).toMatchSnapshot()
        invitesCache.push(cleanedResult)
      })
    })


    it('a user should be able to accept invitations to private boards', async () => {

      const {
        invitee,
        id,
      } = invitesCache[0]

      const result = await mutate(BoardMember, 'accept', {}, id, asUser(invitee))
      const cleanedResult = removeDynamicData(BoardMember, result)
      expect(cleanedResult).toMatchSnapshot()
    })


    it('a user should not be able to accept invitations to private boards on someone\'s behalf', async () => {

      const otherUser = '50'
      const {
        id,
      } = joinCache[1]

      await mutate(BoardMember, 'accept', {}, id, asUser(otherUser))
        .catch(e => {
          expect(e).toMatchSnapshot()
        })
    })
  })

})
