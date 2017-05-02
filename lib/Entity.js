
import {
  passOrThrow,
  isDataType,
  resolveFunctionMap,
} from './util';


class Entity {

  constructor (setup = {}) {

    const {
      name,
      description,
      attributes,
    } = setup

    passOrThrow(name, 'Missing entity name')
    passOrThrow(description, `Missing description for entity '${name}'`)
    passOrThrow(attributes, `Missing attributes for entity '${name}'`)

    this.name = name
    this.description = description
    this._attributesMap = attributes
  }


  getAttributes () {
    return this._attributes || (this._attributes = this._processAttributeMap())
  }


  _processAttributeMap () {

    const attributeMap = resolveFunctionMap(this._attributesMap);

    const attributeNames = Object.keys(attributeMap);
    passOrThrow( attributeNames.length > 0, `Entity '${this.name}' has no attributes defined`)

    const resultAttributes = {}

    attributeNames.forEach((attributeName) => {

      // TODO check name
      // TODO check duplicates

      const attribute = {
        ...attributeMap[attributeName],
        name: attributeName
      }

      passOrThrow(attribute.description, `Missing description for '${this.name}.${attributeName}'`)

      passOrThrow(
        isDataType(attribute.type),
        `'${this.name}.${attributeName}' has invalid data type '${String(attribute.type)}'`
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
