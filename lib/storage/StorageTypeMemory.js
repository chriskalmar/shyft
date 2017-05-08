
import StorageType from './StorageType';


export const StorageTypeMemory = new StorageType({
  name: 'memory',
  description: 'Default in-memory database',
  findOne() {},
  find() {},
})
