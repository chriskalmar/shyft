
import { passOrThrow } from '../util';


class StorageType {

  constructor (setup = {}) {

    const {
      name,
      description,
    } = setup

    passOrThrow(name, () => 'Missing storage type name')
    passOrThrow(description, () => `Missing description for storage type '${name}'`)

    this.name = name
    this.description = description
  }


  findOne() {
    throw new Error(`Storage type '${this.name} needs to implement findOne()`)
  }


  find() {
    throw new Error(`Storage type '${this.name} needs to implement find()`)
  }


  // filter capabilities
  // sort capabilities
  // ...


  toString() {
    return this.name
  }

}


export default StorageType
