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

export {
  StorageTypePostgres,
  loadModels,
  generateMockData,
  connectStorage,
  disconnectStorage,
  getConnection,
  StoragePostgresConfiguration,
  isStoragePostgresConfiguration,
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
};
