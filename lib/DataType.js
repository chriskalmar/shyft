
import { passOrThrow } from './util';


class DataType {

  constructor ({ name, description }) {

    // validate settings
    passOrThrow(name, 'Missing data type name')
    passOrThrow(description, 'Missing data type description')

    // configure data type
    this.name = name
    this.description = description
  }


  toString() {
    return this.name
  }

}


export default DataType
