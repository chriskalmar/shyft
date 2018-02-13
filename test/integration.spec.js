
import { initDB } from './db';
import { loadData } from './loadData';

beforeAll(() => {
  return initDB()
    .then(async (db) => {
      const context = {
        postgresDB: db,
        loaders: {},
      }

      await loadData(context)
    })
})


describe('postgres', () => {
  it('init', () => {
  })
})
