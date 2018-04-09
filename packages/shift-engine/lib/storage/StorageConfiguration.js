
import {
  passOrThrow,
} from '../util';


class StorageConfiguration {

  constructor(setup = {}) {
    const {
      storageInstance,
      storageModels,
      host,
      port,
      username,
      password,
      database,
      logging,
    } = setup

    if (storageInstance) {
      this.setStorageInstance(storageInstance)
    }

    if (storageModels) {
      this.setStorageModels(storageModels)
    }

    this.host = host
    this.port = port
    this.username = username
    this.password = password
    this.database = database
    this.logging = logging
  }


  setStorageInstance(storageInstance) {
    this.storageInstance = storageInstance
  }


  getStorageInstance() {
    passOrThrow(
      this.storageInstance,
      () => `Storage instance not set for storage type '${this.name}'`
    )

    return this.storageInstance
  }


  setStorageModels(storageModels) {
    this.storageModels = storageModels
  }


  getStorageModels() {
    passOrThrow(
      this.storageModels,
      () => `Storage models not set for storage type '${this.name}'`
    )

    return this.storageModels
  }
}

export default StorageConfiguration

export const isStorageConfiguration = (obj) => {
  return (obj instanceof StorageConfiguration)
}
