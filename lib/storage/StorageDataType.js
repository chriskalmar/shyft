
import {
  passOrThrow,
  isFunction,
} from '../util';


class StorageDataType {

  constructor (setup = {}) {

    const {
      name,
      description,
      nativeDataType,
      isSortable,
      serialize,
      parse,
    } = setup

    passOrThrow(name, () => 'Missing storage data type name')
    passOrThrow(description, () => `Missing description for storage data type '${name}'`)
    passOrThrow(nativeDataType, () => `Missing native data type for storage data type '${name}'`)

    passOrThrow(
      isFunction(serialize),
      () => `Storage data type '${name}' has an invalid serialize function`
    )

    passOrThrow(
      !parse || isFunction(parse),
      () => `Storage data type '${name}' has an invalid parse function`
    )

    this.name = name
    this.description = description
    this.nativeDataType = nativeDataType
    this.isSortable = !!isSortable
    this.serialize = serialize
    this.parse = parse || (value => value)
  }


  toString() {
    return this.name
  }

}


export default StorageDataType


export const isStorageDataType = (obj) => {
  return (obj instanceof StorageDataType)
}
