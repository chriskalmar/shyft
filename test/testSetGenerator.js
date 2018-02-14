import casual from 'casual';
import { generateRows } from './testingData';

const profileCount = 110
const boardCount = 50

generateRows(profileCount, 'profiles', () => {
  return [
    casual.first_name.toLowerCase() + casual.integer(100, 999),
    casual.word,
  ]
})

generateRows(boardCount, 'boards', () => {
  return [
    casual.title,
    casual.integer(5, profileCount-20),
    casual.integer(0, 1),
  ]
})
