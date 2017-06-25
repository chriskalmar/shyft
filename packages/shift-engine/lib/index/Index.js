
import {
  passOrThrow,
  isArray,
} from '../util';

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
      isArray(attributes),
      () => `Index defintion of type '${type}' needs to have a list of attributes`
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
