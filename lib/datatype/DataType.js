
import { passOrThrow } from '../util';


class DataType {

  constructor (setup = {}) {

    const {
      name,
      description,
    } = setup

    passOrThrow(name, () => 'Missing data type name')
    passOrThrow(description, () => `Missing description for data type '${name}'`)

    this.name = name
    this.description = description
  }


  toString() {
    return this.name
  }

}


export default DataType
