
import {
  passOrThrow,
} from '../util';

import { isEntity } from '../entity/Entity';
import { isDataType } from './DataType';
import ComplexDataType, { isComplexDataType } from './ComplexDataType';


class ListDataType extends ComplexDataType {

  constructor (setup = {}) {

    super()

    const {
      name,
      itemType,
    } = setup

    passOrThrow(name, () => 'Missing list data type name')
    passOrThrow(itemType, () => `Missing item type for list data type '${name}'`)

    passOrThrow(
      isDataType(itemType) || isEntity(itemType) || isComplexDataType(itemType),
      () => `List data type '${name}' has invalid item type '${String(itemType)}'`
    )

    this.name = name
    this.itemType = itemType
  }


  toString() {
    return this.name
  }

}


export default ListDataType


export const isListDataType = (obj) => {
  // console.log(JSON.stringify(obj, null, 2));
  return (obj instanceof ListDataType)
}

