
import {
  passOrThrow,
  isFunction,
} from '../util';

import { isEntity } from '../entity/Entity';
import { isDataType } from './DataType';
import ComplexDataType, { isComplexDataType } from './ComplexDataType';


class ListDataType extends ComplexDataType {

  constructor (setup = {}) {

    super()

    const {
      name,
      description,
      itemType,
    } = setup

    passOrThrow(name, () => 'Missing list data type name')
    passOrThrow(description, () => `Missing description for list data type '${name}'`)
    passOrThrow(itemType, () => `Missing item type for list data type '${name}'`)

    passOrThrow(
      isDataType(itemType) || isEntity(itemType) || isComplexDataType(itemType) || isFunction(itemType),
      () => `List data type '${name}' has invalid item type '${String(itemType)}'`
    )

    this.name = name
    this.description = description
    this.itemType = itemType
  }


  _processItemType() {
    return isFunction(this.itemType)
      ? this.itemType({
        name: this.name,
        description: this.description
      })
      : this.itemType
  }


  getItemType() {
    if (this._itemType) {
      return this._itemType
    }

    const ret = this._itemType = this._processItemType()
    return ret
  }


  toString() {
    return this.name
  }

}


export default ListDataType


export const isListDataType = (obj) => {
  return (obj instanceof ListDataType)
}


export const buildListDataType = (obj) => {
  return ({name, description}) => new ListDataType({
    description,
    ...obj,
    name,
  })
}
