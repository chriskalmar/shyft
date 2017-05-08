
import {
  StorageType
} from 'shift-engine';


export const StorageTypeMemory = new StorageType({
  name: 'StorageTypeMemory',
  description: 'Simple in-memory database',
  findOne() {},
  find() {},
})

