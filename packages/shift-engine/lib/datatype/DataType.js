
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
      validate,
    } = setup

    passOrThrow(name, () => 'Missing data type name')
    passOrThrow(description, () => `Missing description for data type '${name}'`)

    passOrThrow(
      isFunction(mock),
      () => `'Missing mock function for data type '${name}'`
    )

    if (validate) {
      passOrThrow(
        isFunction(validate),
        () => `'Invalid validate function for data type '${name}'`
      )
    }

    this.name = name
    this.description = description
    this.mock = mock
    this.validate = validate
  }


  validate = (payload, context) => {
    if (payload && this.validate) {
      this.validate(payload, context)
    }
  }


  toString() {
    return this.name
  }

}


export default DataType


export const isDataType = (obj) => {
  return (obj instanceof DataType)
}
