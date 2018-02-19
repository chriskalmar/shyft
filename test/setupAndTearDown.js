import {
  initDB,
  disconnectDB,
} from './db';
import { loadData } from './loadData';

beforeAll(() => {
  return initDB()
    .then(loadData)
})


afterAll(() => {
  return disconnectDB()
})

