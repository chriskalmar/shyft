
import {
  passOrThrow,
  isArray,
} from '../util';

import _ from 'lodash';

export const INDEX_UNIQUE = 'unique';
export const indexTypes = [
  INDEX_UNIQUE,
]


class Index {

  constructor (setup = {}) {

    const {
      type,
      attributes,
    } = setup

    passOrThrow(type, () => 'Missing index type')
    passOrThrow(
      indexTypes.indexOf(type) >= 0,
      () => `Unknown index type '${type}' used, try one of these: '${indexTypes.join(', ')}'`
    )

    passOrThrow(
      isArray(attributes, true),
      () => `Index defintion of type '${type}' needs to have a list of attributes`
    )

    attributes.map(attribute => {
      passOrThrow(
        typeof attribute === 'string',
        () => `Index defintion of type '${type}' needs to have a list of attribute names`
      )
    })

    passOrThrow(
      attributes.length === _.uniq(attributes).length,
      () => `Index defintion of type '${type}' needs to have a unique list of attribute names`
    )


    this.type = type
    this.attributes = attributes

  }


  toString() {
    return this.type
  }

}


export default Index


export const isIndex = (obj) => {
  return (obj instanceof Index)
}
