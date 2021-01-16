import StorageTypePostgres from './StorageTypePostgres';
import StoragePostgresConfiguration, {
  isStoragePostgresConfiguration,
} from './StoragePostgresConfiguration';

import {
  loadModels,
  generateMockData,
  connectStorage,
  disconnectStorage,
  getConnection,
} from './generator';

import {
  generateMigration,
  runMigration,
  revertMigration,
  fillMigrationsTable,
  migrateI18nIndices,
} from './migration';

import { runTestPlaceholderQuery } from './helpers';

export {
  StorageTypePostgres,
  loadModels,
  generateMockData,
  connectStorage,
  disconnectStorage,
  getConnection,
  StoragePostgresConfiguration,
  isStoragePostgresConfiguration,
  generateMigration,
  runMigration,
  revertMigration,
  fillMigrationsTable,
  migrateI18nIndices,
  runTestPlaceholderQuery,
};

export default {
  StorageTypePostgres,
  loadModels,
  generateMockData,
  connectStorage,
  disconnectStorage,
  getConnection,
  StoragePostgresConfiguration,
  isStoragePostgresConfiguration,
  generateMigration,
  runMigration,
  revertMigration,
  fillMigrationsTable,
  migrateI18nIndices,
  runTestPlaceholderQuery,
};
