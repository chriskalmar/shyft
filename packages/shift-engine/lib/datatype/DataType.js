
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

      this.validator = validate
    }

    this.name = name
    this.description = description
    this.mock = mock
  }


  validate = (value, context) => {
    if (value && this.validator) {
      this.validator(value, context)
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
