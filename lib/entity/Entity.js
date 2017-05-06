
import {
  passOrThrow,
  resolveFunctionMap,
  isMap,
  isFunction,
} from '../util';

import {
  ATTRIBUTE_NAME_PATTERN,
  attributeNameRegex,
} from '../constants';

import { isDataType } from '../datatype/DataType';
import { isStorageType } from '../storage/StorageType';

import { StorageTypeMemory } from '../storage/storageTypes';

class Entity {

  constructor (setup = {}) {

    const {
      name,
      description,
      attributes,
      storageType,
    } = setup

    passOrThrow(name, () => 'Missing entity name')
    passOrThrow(description, () => `Missing description for entity '${name}'`)
    passOrThrow(attributes, () => `Missing attributes for entity '${name}'`)

    passOrThrow(
      isMap(attributes) || isFunction(attributes),
      () => `Entity '${name}' needs an attribute definition as a map or a function returning such a map`
    )

    this.name = name
    this.description = description
    this._attributesMap = attributes

    if (storageType) {
      passOrThrow(
        isStorageType(storageType),
        () => `Entity '${name}' needs a valid storage type (defaults to 'StorageTypeMemory')`
      )
    }
    else {
      this.storageType = StorageTypeMemory
    }

  }


  getAttributes () {
    return this._attributes || (this._attributes = this._processAttributeMap())
  }


  _processAttributeMap () {

    // if it's a function, resolve it to get that map
    const attributeMap = resolveFunctionMap(this._attributesMap);

    passOrThrow(
      isMap(attributeMap),
      () => `Attribute definition function for entity '${this.name}' does not return a map`
    )

    const attributeNames = Object.keys(attributeMap);
    passOrThrow(
      attributeNames.length > 0,
      () => `Entity '${this.name}' has no attributes defined`
    )

    const resultAttributes = {}

    attributeNames.forEach((attributeName) => {

      passOrThrow(
        attributeNameRegex.test(attributeName),
        () => `Invalid attribute name '${attributeName}' in entity '${this.name}' (Regex: /${ATTRIBUTE_NAME_PATTERN}/)`
      )

      const attribute = {
        ...attributeMap[attributeName],
        name: attributeName
      }

      passOrThrow(attribute.description, () => `Missing description for '${this.name}.${attributeName}'`)

      passOrThrow(
        isDataType(attribute.type) || (attribute.type instanceof Entity),
        () => `'${this.name}.${attributeName}' has invalid data type '${String(attribute.type)}'`
      )

      passOrThrow(
        !attribute.resolve || isFunction(attribute.resolve),
        () => `'${this.name}.${attributeName}' has an invalid resolve function'`
      )

      resultAttributes[ attributeName ] = attribute
    })

    return resultAttributes
  }


  toString() {
    return this.name
  }

}


export default Entity


export const isEntity = (obj) => {
  return (obj instanceof Entity)
}
