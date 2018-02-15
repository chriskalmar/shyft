import { initDB, } from './db';
import { loadData } from './loadData';

beforeAll(() => {
  return initDB()
    .then(loadData)
})
