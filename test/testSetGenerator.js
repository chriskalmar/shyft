import casual from 'casual';
import { generateRows } from './testingData';

generateRows(110, 'profiles', () => {
  return [
    casual.first_name.toLowerCase() + casual.integer(100, 999),
    casual.word
  ]
})
