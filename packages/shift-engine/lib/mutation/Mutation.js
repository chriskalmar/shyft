
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
      fromState,
      toState,
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


    if (fromState) {
      passOrThrow(
        this.type !== MUTATION_TYPE_CREATE,
        () => `Mutation '${this.name}' cannot define fromState as it is a 'create' type mutation`
      )

      passOrThrow(
        typeof fromState === 'string' || isArray(fromState),
        () => `fromState in mutation '${name}' needs to be the name of a state or a list of state names as a precondition to the mutation`
      )

      if (this.type !== MUTATION_TYPE_DELETE) {
        passOrThrow(
          toState,
          () => `Mutation '${this.name}' has a fromState defined but misses a toState definition`
        )
      }

      this.fromState = fromState
    }


    if (toState) {
      passOrThrow(
        this.type !== MUTATION_TYPE_DELETE,
        () => `Mutation '${this.name}' cannot define toState as it is a 'delete' type mutation`
      )

      passOrThrow(
        typeof toState === 'string' || isArray(toState),
        () => `toState in mutation '${this.name}' needs to be the name of a state or a list of state names the mutation can transition to`
      )

      if (this.type !== MUTATION_TYPE_CREATE) {
        passOrThrow(
          fromState,
          () => `Mutation '${this.name}' has a toState defined but misses a fromState definition`
        )
      }

      this.toState = toState
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
