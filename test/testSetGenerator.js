import casual from 'casual';
import _ from 'lodash';
import {
  generateRows,
  readRows,
  writeTestDataFile,
} from './testingData';



const mockProfiles = (profileCount) => {
  generateRows(profileCount, 'profiles', () => {
    const firstName = casual.first_name
    return [
      firstName.toLowerCase() + casual.integer(100, 999),
      casual.word,
      firstName,
      casual.last_name,
    ]
  })
}


const mockBoards = (boardCount, profileCount) => {
  generateRows(boardCount, 'boards', () => {
    return [
      casual.title,
      casual.integer(5, profileCount-20),
      casual.integer(0, 1),
    ]
  })
}



const mockInvites = (inviteCount, profileCount) => {
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

  writeTestDataFile('invites', invites)
}



const mockJoins = (joinCount, profileCount) => {
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

  writeTestDataFile('joins', joins)
}



const emojiList = '😎 😀 🤘 😆 🙌 🍕 🍪 😂 😜 😊 😍 💩 ✅ 👌 🚀'.split(' ')

const mockMessages = (messageCount, boardCount, profileCount) => {
  generateRows(messageCount, 'messages', () => {
    const now = new Date().getTime()
    const randomFuture = now + casual.integer(0, 10000)
    const emoji = casual.coin_flip
      ? ' ' + emojiList[ casual.integer(0, emojiList.length-1) ]
      : ''

    return [
      casual.string + emoji,
      casual.integer(5, profileCount - 20),
      casual.integer(1, boardCount-1),
      new Date(randomFuture).toISOString(),
    ]
  })
}


const profileCount = 110
const boardCount = 50
const inviteCount = 100
const joinCount = 200
const messageCount = 50


export const generateMockData = () => {
  mockProfiles(profileCount)
  mockBoards(boardCount, profileCount)
  mockInvites(inviteCount, profileCount)
  mockJoins(joinCount, profileCount)
  mockMessages(messageCount, boardCount, profileCount)
}



export const counts = {
  profileCount,
  boardCount,
  joinCount,
  inviteCount,
  messageCount,
}
