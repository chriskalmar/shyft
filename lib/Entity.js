
import {
  passOrThrow,
  // isDataType,
  // resolveFunctionMap,
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

    this.name = name
    this.description = description
    this._attributesMap = attributes
  }


  getAttributes () {
    return this._attributes || (this._attributes = this._processAttributeMap())
  }


  _processAttributeMap () {
    // const attributeMap = resolveFunctionMap(this._attributesMap);
  }


  toString() {
    return this.name
  }

}


export default Entity
