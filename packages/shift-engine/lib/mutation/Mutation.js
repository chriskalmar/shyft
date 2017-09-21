
import {
  passOrThrow,
  isArray,
  isFunction,
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

export const defaultEntityMutations = [
  {
    name: 'create',
    type: MUTATION_TYPE_CREATE,
    description: (typeName) => `Create a new **\`${typeName}\`**`,
    hasAttributes: true,
  },
  {
    name: 'update',
    type: MUTATION_TYPE_UPDATE,
    description: (typeName) => `Update a single **\`${typeName}\`** using its node ID and a data patch`,
    hasAttributes: true,
  },
  {
    name: 'delete',
    description: (typeName) => `Delete a single **\`${typeName}\`** using its node ID`,
    type: MUTATION_TYPE_DELETE,
  },
]


class Mutation {

  constructor (setup = {}) {

    const {
      name,
      type,
      description,
      attributes,
      preProcessor,
    } = setup

    passOrThrow(name, () => 'Missing mutation name')
    passOrThrow(type, () => `Missing type for mutation '${name}'`)
    passOrThrow(
      mutationTypes.indexOf(type) >= 0,
      () => `Unknown mutation type '${type}' used, try one of these: '${mutationTypes.join(', ')}'`
    )

    passOrThrow(description, () => `Missing description for mutation '${name}'`)


    this.name = name
    this.type = type
    this.description = description


    if (this.type === MUTATION_TYPE_CREATE || this.type === MUTATION_TYPE_UPDATE) {

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

      this.attributes = attributes
    }


    if (this.type === MUTATION_TYPE_CREATE) {
      this.isTypeCreate = true
    }

    if (this.type === MUTATION_TYPE_UPDATE) {
      this.needsInstance = true
      this.ignoreRequired = true
      this.isTypeUpdate = true
    }

    if (this.type === MUTATION_TYPE_DELETE) {
      this.needsInstance = true
      this.isTypeDelete = true
    }


    if (preProcessor) {
      passOrThrow(
        isFunction(preProcessor),
        () => `preProcessor of mutation '${name}' needs to be a valid function`
      )

      this.preProcessor = preProcessor
    }


  }


  toString() {
    return this.name
  }

}


export default Mutation


export const isMutation = (obj) => {
  return (obj instanceof Mutation)
}
