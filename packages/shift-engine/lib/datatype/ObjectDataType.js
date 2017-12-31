
import {
  passOrThrow,
  resolveFunctionMap,
  isMap,
  isFunction,
} from '../util';

import { isEntity } from '../entity/Entity';
import { isDataType } from './DataType';
import ComplexDataType, { isComplexDataType } from './ComplexDataType';


class ObjectDataType extends ComplexDataType {

  constructor (setup = {}) {

    super()

    const {
      name,
      attributes,
    } = setup

    passOrThrow(name, () => 'Missing object data type name')
    passOrThrow(attributes, () => `Missing attributes for object data type '${name}'`)

    passOrThrow(
      isMap(attributes) || isFunction(attributes),
      () => `Object data type '${name}' needs an attribute definition as a map or a function returning such a map`
    )

    this.name = name
    this._attributesMap = attributes
  }


  getAttributes () {
    if (this._attributes) {
      return this._attributes
    }

    const ret = this._attributes = this._processAttributeMap()
    return ret
  }


  _processAttribute (rawAttribute, attributeName) {

    if (rawAttribute instanceof ObjectDataType) {
      rawAttribute.getAttributes()
      return rawAttribute
    }

    const attribute = {
      ...rawAttribute,
      required: !!rawAttribute.required,
      name: attributeName
    }

    passOrThrow(attribute.description, () => `Missing description for '${this.name}.${attributeName}'`)

    passOrThrow(
      isDataType(attribute.type) || isEntity(attribute.type),
      () => `'${this.name}.${attributeName}' has invalid data type '${String(attribute.type)}'`
    )

    passOrThrow(
      !attribute.resolve || isFunction(attribute.resolve),
      () => `'${this.name}.${attributeName}' has an invalid resolve function'`
    )

    passOrThrow(
      !attribute.defaultValue || isFunction(attribute.defaultValue),
      () => `'${this.name}.${attributeName}' has an invalid defaultValue function'`
    )

    return attribute
  }


  _processAttributeMap () {

    // if it's a function, resolve it to get that map
    const attributeMap = resolveFunctionMap(this._attributesMap);

    passOrThrow(
      isMap(attributeMap),
      () => `Attribute definition function for object data type '${this.name}' does not return a map`
    )


    const attributeNames = Object.keys(attributeMap);
    passOrThrow(
      attributeNames.length > 0,
      () => `Object data type '${this.name}' has no attributes defined`
    )

    const resultAttributes = {}

    attributeNames.forEach((attributeName) => {
      resultAttributes[ attributeName ] = this._processAttribute(attributeMap[ attributeName ], attributeName)
    })

    return resultAttributes
  }


  toString() {
    return this.name
  }

}


export default ObjectDataType


export const isObjectDataType = (obj) => {
  return (obj instanceof ObjectDataType)
}

