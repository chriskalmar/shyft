
import {
  passOrThrow,
  isArray,
} from '../util';

import _ from 'lodash';

export const MUTATION_TYPE_CREATE = 'create';
export const MUTATION_TYPE_UPDATE = 'update';
export const MUTATION_TYPE_DELETE = 'delete';

export const mutationTypes = [
  MUTATION_TYPE_CREATE,
  MUTATION_TYPE_UPDATE,
  MUTATION_TYPE_DELETE,
]


class Mutation {

  constructor (setup = {}) {

    const {
      name,
      type,
      description,
      attributes,
    } = setup

    passOrThrow(name, () => 'Missing mutation name')
    passOrThrow(type, () => `Missing type for mutation '${name}'`)
    passOrThrow(
      mutationTypes.indexOf(type) >= 0,
      () => `Unknown mutation type '${type}' used, try one of these: '${mutationTypes.join(', ')}'`
    )

    passOrThrow(description, () => `Missing description for mutation '${name}'`)

    passOrThrow(
      isArray(attributes, true),
      () => `Mutation '${name}' needs to have a list of attributes`
    )

    attributes.map(attribute => {
      passOrThrow(
        typeof attribute === 'string',
        () => `Mutation '${name}' needs to have a list of attribute names`
      )
    })

    passOrThrow(
      attributes.length === _.uniq(attributes).length,
      () => `Mutation '${name}' needs to have a list of unique attribute names`
    )


    this.type = type
    this.attributes = attributes

  }


  toString() {
    return this.name
  }

}


export default Mutation


export const isMutation = (obj) => {
  return (obj instanceof Mutation)
}
