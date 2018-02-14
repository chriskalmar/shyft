import casual from 'casual';
import _ from 'lodash';
import {
  generateRows,
  readRows,
  writeTestDataFile,
} from './testingData';

const profileCount = 110

generateRows(profileCount, 'profiles', () => {
  return [
    casual.first_name.toLowerCase() + casual.integer(100, 999),
    casual.word,
  ]
})


const boardCount = 50

generateRows(boardCount, 'boards', () => {
  return [
    casual.title,
    casual.integer(5, profileCount-20),
    casual.integer(0, 1),
  ]
})


const inviteCount = 100

const generateInvites = () => {
  const uniqnessCache = []
  const boards = readRows('boards')
  const invites = []

  while (invites.length < inviteCount) {
    const [name, owner, isPrivate] = _.sample(boards)

    if (isPrivate === '1') {
      const invitee = casual.integer(1, profileCount)
      const accept = casual.integer(0, 1)

      if (invitee !== parseInt(owner, 10)) {
        const row = `${name},${owner},${invitee},${accept}`

        if (!uniqnessCache.includes(row)) {
          uniqnessCache.push(row)
          invites.push(row)
        }
      }
    }
  }

  return invites
}

writeTestDataFile('invites', generateInvites())


const joinCount = 200

const generateJoins = () => {
  const uniqnessCache = []
  const boards = readRows('boards')
  const joins = []

  while (joins.length < joinCount) {
    const [name, owner, isPrivate] = _.sample(boards)

    if (isPrivate === '0') {
      const invitee = casual.integer(1, profileCount)

      if (invitee !== parseInt(owner, 10)) {
        const row = `${name},${invitee}`

        if (!uniqnessCache.includes(row)) {
          uniqnessCache.push(row)
          joins.push(row)
        }
      }
    }
  }

  return joins
}

writeTestDataFile('joins', generateJoins())


