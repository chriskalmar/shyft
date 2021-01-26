import { initDB, disconnectDB, initGraphQLSchema } from './db';
import { loadData } from './loadData';

beforeAll(async () => {
  await initDB();
  await loadData();
  initGraphQLSchema();
});

afterAll(() => {
  return disconnectDB();
});
