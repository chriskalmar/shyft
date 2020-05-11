import { uniq } from 'lodash';
import {
  passOrThrow,
  isArray,
  // isFunction,
  mapOverProperties,
} from '../util';

import { Entity } from '../entity/Entity';

export const SUBSCRIPTION_TYPE_CREATE = 'onCreate';
export const SUBSCRIPTION_TYPE_UPDATE = 'onUpdate';
export const SUBSCRIPTION_TYPE_DELETE = 'onDelete';

export const subscriptionTypes = [
  SUBSCRIPTION_TYPE_CREATE,
  SUBSCRIPTION_TYPE_UPDATE,
  SUBSCRIPTION_TYPE_DELETE,
];

export const defaultEntitySubscription = [
  {
    name: 'onCreate',
    type: SUBSCRIPTION_TYPE_CREATE,
    description: (typeName: string) =>
      `Watch a new **\`${typeName}\`** creation`,
    hasAttributes: true,
  },
  {
    name: 'onUpdate',
    type: SUBSCRIPTION_TYPE_UPDATE,
    description: (typeName: string) =>
      `Watch a single **\`${typeName}\`** update using its node ID and a data patch`,
    hasAttributes: true,
  },
  {
    name: 'onDelete',
    description: (typeName: string) =>
      `Watch a single **\`${typeName}\`** deletion using its node ID`,
    type: SUBSCRIPTION_TYPE_DELETE,
  },
];

export type SubscriptionSetup = {
  name?: string;
  type?: string;
  description?: string;
  attributes?: string[];
  // preProcessor?: Function;
  // postProcessor?: Function;
  // fromState?: string | string[];
  // toState?: string | string[];
};

export class Subscription {
  name: string;
  type: string;
  description: string;
  attributes: string[];
  // fromState: string | string[];
  // toState: string | string[];

  // preProcessor: Function;
  // postProcessor: Function;

  isTypeCreate?: boolean;
  isTypeDelete?: boolean;
  needsInstance?: boolean;
  ignoreRequired?: boolean;
  isTypeUpdate?: boolean;

  constructor(setup: SubscriptionSetup = {} as SubscriptionSetup) {
    const {
      name,
      type,
      description,
      attributes,
      // preProcessor,
      // postProcessor,
      // fromState,
      // toState,
    } = setup;

    passOrThrow(name, () => 'Missing subscription name');
    passOrThrow(type, () => `Missing type for subscription '${name}'`);
    passOrThrow(
      subscriptionTypes.indexOf(type) >= 0,
      () =>
        `Unknown subscription type '${type}' used, try one of these: '${subscriptionTypes.join(
          ', ',
        )}'`,
    );

    passOrThrow(
      description,
      () => `Missing description for subscription '${name}'`,
    );

    this.name = name;
    this.type = type;
    this.description = description;

    if (
      this.type === SUBSCRIPTION_TYPE_CREATE ||
      this.type === SUBSCRIPTION_TYPE_UPDATE
    ) {
      this.attributes = attributes;
    }

    if (this.type === SUBSCRIPTION_TYPE_CREATE) {
      this.isTypeCreate = true;
    }

    if (this.type === SUBSCRIPTION_TYPE_UPDATE) {
      this.needsInstance = true;
      this.ignoreRequired = true;
      this.isTypeUpdate = true;
    }

    if (this.type === SUBSCRIPTION_TYPE_DELETE) {
      this.needsInstance = true;
      this.isTypeDelete = true;
    }

    // if (preProcessor) {
    //   passOrThrow(
    //     isFunction(preProcessor),
    //     () => `preProcessor of subscription '${name}' needs to be a valid function`,
    //   );

    //   this.preProcessor = preProcessor;
    // }

    // if (postProcessor) {
    //   passOrThrow(
    //     isFunction(postProcessor),
    //     () =>
    //       `postProcessor of subscription '${name}' needs to be a valid function`,
    //   );

    //   this.postProcessor = postProcessor;
    // }

    // if (fromState) {
    //   passOrThrow(
    //     this.type !== SUBSCRIPTION_TYPE_CREATE,
    //     () =>
    //       `Subscription '${this.name}' cannot define fromState as it is a 'onCreate' type subscription`,
    //   );

    //   passOrThrow(
    //     typeof fromState === 'string' || isArray(fromState),
    //     () =>
    //       `fromState in subscription '${name}' needs to be the name of a state or a list of state names as a precondition to the subscription`,
    //   );

    //   if (this.type !== SUBSCRIPTION_TYPE_DELETE) {
    //     passOrThrow(
    //       toState,
    //       () =>
    //         `Subscription '${this.name}' has a fromState defined but misses a toState definition`,
    //     );
    //   }

    //   this.fromState = fromState;
    // }

    // if (toState) {
    //   passOrThrow(
    //     this.type !== SUBSCRIPTION_TYPE_DELETE,
    //     () =>
    //       `Subscription '${this.name}' cannot define toState as it is a 'onDelete' type subscription`,
    //   );

    //   passOrThrow(
    //     typeof toState === 'string' || isArray(toState),
    //     () =>
    //       `toState in subscription '${this.name}' needs to be the name of a state or a list of state names the subscription can transition to`,
    //   );

    //   if (this.type !== SUBSCRIPTION_TYPE_CREATE) {
    //     passOrThrow(
    //       fromState,
    //       () =>
    //         `Subscription '${this.name}' has a toState defined but misses a fromState definition`,
    //     );
    //   }

    //   this.toState = toState;
    // }
  }

  toString() {
    return this.name;
  }
}

export const isSubscription = (obj: any) => {
  return obj instanceof Subscription;
};

export const processEntitySubscriptions = (
  entity: Entity,
  subscriptions: Subscription[],
) => {
  passOrThrow(
    isArray(subscriptions),
    () =>
      `Entity '${entity.name}' subscriptions definition needs to be an array of subscriptions`,
  );

  subscriptions.map((subscription, idx) => {
    passOrThrow(
      isSubscription(subscription),
      () =>
        `Invalid subscription definition for entity '${entity.name}' at position '${idx}'`,
    );
  });

  const entityAttributes = entity.getAttributes();
  // const entityStates = entity.getStates();

  const requiredAttributeNames = [];

  mapOverProperties(entityAttributes, (attribute, attributeName) => {
    if (!attribute.isSystemAttribute) {
      if (attribute.required && !attribute.defaultValue) {
        requiredAttributeNames.push(attributeName);
      }
    }
  });

  const subscriptionNames = [];

  subscriptions.map(subscription => {
    passOrThrow(
      !subscriptionNames.includes(subscription.name),
      () =>
        `Duplicate subscription name '${subscription.name}' found in '${entity.name}'`,
    );

    subscriptionNames.push(subscription.name);

    if (subscription.attributes) {
      passOrThrow(
        (isArray(subscription.attributes, true) &&
          subscription.type === SUBSCRIPTION_TYPE_CREATE) ||
          isArray(subscription.attributes, false),
        () =>
          `Subscription '${entity.name}.${subscription.name}' needs to have a list of attributes`,
      );

      subscription.attributes.map(attribute => {
        passOrThrow(
          typeof attribute === 'string',
          () =>
            `Subscription '${entity.name}.${subscription.name}' needs to have a list of attribute names`,
        );
      });

      passOrThrow(
        subscription.attributes.length === uniq(subscription.attributes).length,
        () =>
          `Subscription '${entity.name}.${subscription.name}' needs to have a list of unique attribute names`,
      );

      subscription.attributes.map(attributeName => {
        passOrThrow(
          entityAttributes[attributeName],
          () =>
            `Cannot use attribute '${entity.name}.${attributeName}' in subscription '${entity.name}.${subscription.name}' as it does not exist`,
        );
      });

      if (subscription.type === SUBSCRIPTION_TYPE_CREATE) {
        const missingAttributeNames = requiredAttributeNames.filter(
          requiredAttributeName => {
            return !subscription.attributes.includes(requiredAttributeName);
          },
        );

        passOrThrow(
          missingAttributeNames.length === 0,
          () =>
            `Missing required attributes in subscription '${entity.name}.${
              subscription.name
            }' need to have a defaultValue() function: [ ${missingAttributeNames.join(
              ', ',
            )} ]`,
        );
      }
    } else if (
      subscription.type === SUBSCRIPTION_TYPE_CREATE ||
      subscription.type === SUBSCRIPTION_TYPE_UPDATE
    ) {
      const nonSystemAttributeNames = [];

      mapOverProperties(entityAttributes, (attribute, attributeName) => {
        if (!attribute.isSystemAttribute) {
          nonSystemAttributeNames.push(attributeName);
        }
      });

      subscription.attributes = nonSystemAttributeNames;
    }

    // const checkSubscriptionStates = stateStringOrArray => {
    //   const stateNames = isArray(stateStringOrArray)
    //     ? stateStringOrArray
    //     : [stateStringOrArray];

    //   stateNames.map(stateName => {
    //     passOrThrow(
    //       entityStates[stateName],
    //       () =>
    //         `Unknown state '${stateName}' used in subscription '${entity.name}.${subscription.name}'`,
    //     );
    //   });
    // };

    // if (subscription.fromState) {
    //   passOrThrow(
    //     entity.hasStates(),
    //     () =>
    //       `Mutation '${entity.name}.${subscription.name}' cannot define fromState as the entity is stateless`,
    //   );

    //   checkSubscriptionStates(subscription.fromState);
    // }

    // if (subscription.toState) {
    //   passOrThrow(
    //     entity.hasStates(),
    //     () =>
    //       `Subscription '${entity.name}.${subscription.name}' cannot define toState as the entity is stateless`,
    //   );

    //   checkSubscriptionStates(subscription.toState);
    // }
  });

  return subscriptions;
};
