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

import { generateMigration, runMigration, revertMigration } from './migration';

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
};
