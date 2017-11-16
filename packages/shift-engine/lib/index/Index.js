
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
      () => `Index definition of type '${type}' needs to have a list of attributes`
    )

    attributes.map(attribute => {
      passOrThrow(
        typeof attribute === 'string',
        () => `Index definition of type '${type}' needs to have a list of attribute names`
      )
    })

    passOrThrow(
      attributes.length === _.uniq(attributes).length,
      () => `Index definition of type '${type}' needs to have a list of unique attribute names`
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


export const processEntityIndexes = (entity, indexes) => {

  passOrThrow(
    isArray(indexes),
    () => `Entity '${entity.name}' indexes definition needs to be an array of indexes`
  )


  const entityAttributes = entity.getAttributes()

  indexes.map((index, idx) => {
    passOrThrow(
      isIndex(index),
      () => `Invalid index definition for entity '${entity.name}' at position '${idx}'`
    )


    index.attributes.map((attributeName) => {

      passOrThrow(
        entityAttributes[ attributeName ],
        () => `Cannot use attribute '${entity.name}.${attributeName}' in index as it does not exist`
      )

      if (index.type === INDEX_UNIQUE && index.attributes.length === 1) {
        entityAttributes[ attributeName ].isUnique = true
      }

    })
  })

  return indexes
}
