import { uniq } from 'lodash';
import { passOrThrow, isArray, isFunction, mapOverProperties } from '../util';

import { Entity } from '../entity/Entity';

export const MUTATION_TYPE_CREATE = 'create';
export const MUTATION_TYPE_UPDATE = 'update';
export const MUTATION_TYPE_DELETE = 'delete';

export const mutationTypes = [
  MUTATION_TYPE_CREATE,
  MUTATION_TYPE_UPDATE,
  MUTATION_TYPE_DELETE,
];

export interface MutationMap {
  [key: string]: Mutation;
}

export interface MutationGenerator {
  (mutations: MutationMap): Mutation[];
}

export const defaultEntityMutations = [
  {
    name: 'create',
    type: MUTATION_TYPE_CREATE,
    description: (typeName: string) => `Create a new **\`${typeName}\`**`,
    hasAttributes: true,
  },
  {
    name: 'update',
    type: MUTATION_TYPE_UPDATE,
    description: (typeName: string) =>
      `Update a single **\`${typeName}\`** using its node ID and a data patch`,
    hasAttributes: true,
  },
  {
    name: 'delete',
    description: (typeName: string) =>
      `Delete a single **\`${typeName}\`** using its node ID`,
    type: MUTATION_TYPE_DELETE,
  },
];

export type MutationSetup = {
  name?: string;
  type?: string;
  description?: string;
  attributes?: string[];
  // preProcessor?: Function;
  // postProcessor?: Function;
  preProcessor?: (
    entity?: Entity,
    id?: string | number,
    source?: any,
    input?: any,
    typeName?: string,
    entityMutation?: Mutation,
    context?: any,
    info?: any,
  ) => Promise<any> | any;
  postProcessor?: (
    error?: any,
    result?: any,
    entity?: Entity,
    id?: string | number,
    source?: any,
    input?: any,
    typeName?: string,
    entityMutation?: Mutation,
    context?: any,
    info?: any,
  ) => Promise<void> | void;
  fromState?: string | string[];
  toState?: string | string[];
};

export class Mutation {
  name: string;
  type: string;
  description: string;
  attributes: string[];
  fromState?: string | string[];
  toState?: string | string[];

  preProcessor?: Function;
  postProcessor?: Function;

  isTypeCreate?: boolean;
  isTypeDelete?: boolean;
  needsInstance?: boolean;
  ignoreRequired?: boolean;
  isTypeUpdate?: boolean;

  constructor(setup: MutationSetup = {} as MutationSetup) {
    const {
      name,
      type,
      description,
      attributes,
      preProcessor,
      postProcessor,
      fromState,
      toState,
    } = setup;

    passOrThrow(name, () => 'Missing mutation name');
    passOrThrow(type, () => `Missing type for mutation '${name}'`);
    passOrThrow(
      mutationTypes.indexOf(type) >= 0,
      () =>
        `Unknown mutation type '${type}' used, try one of these: '${mutationTypes.join(
          ', ',
        )}'`,
    );

    passOrThrow(
      description,
      () => `Missing description for mutation '${name}'`,
    );

    this.name = name;
    this.type = type;
    this.description = description;

    if (
      this.type === MUTATION_TYPE_CREATE ||
      this.type === MUTATION_TYPE_UPDATE
    ) {
      this.attributes = attributes;
    }

    if (this.type === MUTATION_TYPE_CREATE) {
      this.isTypeCreate = true;
    }

    if (this.type === MUTATION_TYPE_UPDATE) {
      this.needsInstance = true;
      this.ignoreRequired = true;
      this.isTypeUpdate = true;
    }

    if (this.type === MUTATION_TYPE_DELETE) {
      this.needsInstance = true;
      this.isTypeDelete = true;
    }

    if (preProcessor) {
      passOrThrow(
        isFunction(preProcessor),
        () => `preProcessor of mutation '${name}' needs to be a valid function`,
      );

      this.preProcessor = preProcessor;
    }

    if (postProcessor) {
      passOrThrow(
        isFunction(postProcessor),
        () =>
          `postProcessor of mutation '${name}' needs to be a valid function`,
      );

      this.postProcessor = postProcessor;
    }

    if (fromState) {
      passOrThrow(
        this.type !== MUTATION_TYPE_CREATE,
        () =>
          `Mutation '${this.name}' cannot define fromState as it is a 'create' type mutation`,
      );

      passOrThrow(
        typeof fromState === 'string' || isArray(fromState),
        () =>
          `fromState in mutation '${name}' needs to be the name of a state or a list of state names as a precondition to the mutation`,
      );

      if (this.type !== MUTATION_TYPE_DELETE) {
        passOrThrow(
          toState,
          () =>
            `Mutation '${this.name}' has a fromState defined but misses a toState definition`,
        );
      }

      this.fromState = fromState;
    }

    if (toState) {
      passOrThrow(
        this.type !== MUTATION_TYPE_DELETE,
        () =>
          `Mutation '${this.name}' cannot define toState as it is a 'delete' type mutation`,
      );

      passOrThrow(
        typeof toState === 'string' || isArray(toState),
        () =>
          `toState in mutation '${this.name}' needs to be the name of a state or a list of state names the mutation can transition to`,
      );

      if (this.type !== MUTATION_TYPE_CREATE) {
        passOrThrow(
          fromState,
          () =>
            `Mutation '${this.name}' has a toState defined but misses a fromState definition`,
        );
      }

      this.toState = toState;
    }
  }

  toString() {
    return this.name;
  }
}

export const isMutation = (obj: any) => {
  return obj instanceof Mutation;
};

export const processEntityMutations = (
  entity: Entity,
  mutations: Mutation[],
) => {
  passOrThrow(
    isArray(mutations),
    () =>
      `Entity '${entity.name}' mutations definition needs to be an array of mutations`,
  );

  mutations.map((mutation, idx) => {
    passOrThrow(
      isMutation(mutation),
      () =>
        `Invalid mutation definition for entity '${entity.name}' at position '${idx}'`,
    );
  });

  const entityAttributes = entity.getAttributes();
  const entityStates = entity.getStates();

  const requiredAttributeNames = [];

  mapOverProperties(entityAttributes, (attribute, attributeName) => {
    if (!attribute.isSystemAttribute) {
      if (attribute.required && !attribute.defaultValue) {
        requiredAttributeNames.push(attributeName);
      }
    }
  });

  const mutationNames = [];

  mutations.map((mutation) => {
    passOrThrow(
      !mutationNames.includes(mutation.name),
      () =>
        `Duplicate mutation name '${mutation.name}' found in '${entity.name}'`,
    );

    mutationNames.push(mutation.name);

    if (mutation.attributes) {
      passOrThrow(
        (isArray(mutation.attributes, true) &&
          mutation.type === MUTATION_TYPE_CREATE) ||
          isArray(mutation.attributes, false),
        () =>
          `Mutation '${entity.name}.${mutation.name}' needs to have a list of attributes`,
      );

      mutation.attributes.map((attribute) => {
        passOrThrow(
          typeof attribute === 'string',
          () =>
            `Mutation '${entity.name}.${mutation.name}' needs to have a list of attribute names`,
        );
      });

      passOrThrow(
        mutation.attributes.length === uniq(mutation.attributes).length,
        () =>
          `Mutation '${entity.name}.${mutation.name}' needs to have a list of unique attribute names`,
      );

      mutation.attributes.map((attributeName) => {
        passOrThrow(
          entityAttributes[attributeName],
          () =>
            `Cannot use attribute '${entity.name}.${attributeName}' in mutation '${entity.name}.${mutation.name}' as it does not exist`,
        );
      });

      if (mutation.type === MUTATION_TYPE_CREATE) {
        const missingAttributeNames = requiredAttributeNames.filter(
          (requiredAttributeName) => {
            return !mutation.attributes.includes(requiredAttributeName);
          },
        );

        passOrThrow(
          missingAttributeNames.length === 0,
          () =>
            `Missing required attributes in mutation '${entity.name}.${
              mutation.name
            }' need to have a defaultValue() function: [ ${missingAttributeNames.join(
              ', ',
            )} ]`,
        );
      }
    } else if (
      mutation.type === MUTATION_TYPE_CREATE ||
      mutation.type === MUTATION_TYPE_UPDATE
    ) {
      const nonSystemAttributeNames = [];

      mapOverProperties(entityAttributes, (attribute, attributeName) => {
        if (!attribute.isSystemAttribute) {
          nonSystemAttributeNames.push(attributeName);
        }
      });

      mutation.attributes = nonSystemAttributeNames;
    }

    const checkMutationStates = (stateStringOrArray) => {
      const stateNames = isArray(stateStringOrArray)
        ? stateStringOrArray
        : [stateStringOrArray];

      stateNames.map((stateName) => {
        passOrThrow(
          entityStates[stateName],
          () =>
            `Unknown state '${stateName}' used in mutation '${entity.name}.${mutation.name}'`,
        );
      });
    };

    if (mutation.fromState) {
      passOrThrow(
        entity.hasStates(),
        () =>
          `Mutation '${entity.name}.${mutation.name}' cannot define fromState as the entity is stateless`,
      );

      checkMutationStates(mutation.fromState);
    }

    if (mutation.toState) {
      passOrThrow(
        entity.hasStates(),
        () =>
          `Mutation '${entity.name}.${mutation.name}' cannot define toState as the entity is stateless`,
      );

      checkMutationStates(mutation.toState);
    }
  });

  return mutations;
};
