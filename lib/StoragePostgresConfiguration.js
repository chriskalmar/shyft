
import {
  StorageConfiguration,
} from 'shift-engine';


class StoragePostgresConfiguration extends StorageConfiguration {

  constructor(setup = {}) {
    super(setup)
  }


}


export default StoragePostgresConfiguration


export const isStoragePostgresConfiguration = (obj) => {
  return (obj instanceof StoragePostgresConfiguration)
}
