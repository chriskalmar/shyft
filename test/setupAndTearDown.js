import { initDB, disconnectDB } from './db';
import { loadData } from './loadData';

beforeAll(async () => {
  await initDB();
  await loadData();
});

afterAll(() => {
  return disconnectDB();
});
