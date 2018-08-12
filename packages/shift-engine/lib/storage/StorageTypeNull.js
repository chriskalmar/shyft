import StorageType from './StorageType';

export const StorageTypeNull = new StorageType({
  name: 'StorageTypeNull',
  description: 'Default storage without any implementation',
  findOne() {
    throw new Error(
      "'StorageTypeNull' is not a real storage type implementation",
    );
  },
  findOneByValues() {
    throw new Error(
      "'StorageTypeNull' is not a real storage type implementation",
    );
  },
  find() {
    throw new Error(
      "'StorageTypeNull' is not a real storage type implementation",
    );
  },
  count() {
    throw new Error(
      "'StorageTypeNull' is not a real storage type implementation",
    );
  },
  mutate() {
    throw new Error(
      "'StorageTypeNull' is not a real storage type implementation",
    );
  },
  checkLookupPermission() {
    throw new Error(
      "'StorageTypeNull' is not a real storage type implementation",
    );
  },
});
