import { initDB, disconnectDB, initGraphQLSchema } from './db';
import { loadData } from './loadData';

beforeAll(async () => {
  await initDB();
  initGraphQLSchema();
  await loadData();
});

afterAll(() => {
  return disconnectDB();
});
