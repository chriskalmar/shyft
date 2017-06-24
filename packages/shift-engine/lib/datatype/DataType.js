
import {
  passOrThrow,
  isFunction,
} from '../util';


class DataType {

  constructor (setup = {}) {

    const {
      name,
      description,
      mock,
    } = setup

    passOrThrow(name, () => 'Missing data type name')
    passOrThrow(description, () => `Missing description for data type '${name}'`)

    passOrThrow(
      isFunction(mock),
      () => `'Missing mock function for data type '${name}'`
    )

    this.name = name
    this.description = description
    this.mock = mock
  }


  toString() {
    return this.name
  }

}


export default DataType

export class DataTypeUser extends DataType {}



export const isDataType = (obj) => {
  return (obj instanceof DataType)
}


export const isDataTypeUser = (obj) => {
  return (obj instanceof DataTypeUser)
}
