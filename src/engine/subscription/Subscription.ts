import { uniq } from 'lodash';
import { PubSub } from 'graphql-subscriptions';
import { passOrThrow, isArray, isFunction, mapOverProperties } from '../util';

import { Entity } from '../entity/Entity';

export const pubsub = new PubSub();

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
  delimiter?: string;
  wildCard?: string;
  pattern?: string;
  preProcessor?: (
    entity?: Entity,
    id?: string | number,
    source?: any,
    input?: any,
    typeName?: string,
    entitySubscription?: Subscription,
    context?: any,
    info?: any,
  ) => Promise<string | null> | string | null;
  postProcessor?: (
    entity?: Entity,
    // id,
    source?: any,
    input?: any,
    typeName?: string,
    entitySubscription?: Subscription,
    context?: any,
    info?: any,
  ) => Promise<object | null> | object | null;
};

export class Subscription {
  name: string;
  type: string;
  description: string;
  attributes: string[];
  delimiter?: string;
  wildCard?: string;
  pattern?: string;

  preProcessor: Function;
  postProcessor: Function;

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
      preProcessor,
      postProcessor,
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
      this.ignoreRequired = true;
    }

    if (this.type === SUBSCRIPTION_TYPE_UPDATE) {
      // this.needsInstance = true;
      this.ignoreRequired = true;
      this.isTypeUpdate = true;
    }

    if (this.type === SUBSCRIPTION_TYPE_DELETE) {
      // this.needsInstance = true;
      this.isTypeDelete = true;
    }

    if (preProcessor) {
      passOrThrow(
        isFunction(preProcessor),
        () =>
          `preProcessor of subscription '${name}' needs to be a valid function`,
      );

      this.preProcessor = preProcessor;
    }

    if (postProcessor) {
      passOrThrow(
        isFunction(postProcessor),
        () =>
          `postProcessor of subscription '${name}' needs to be a valid function`,
      );

      this.postProcessor = postProcessor;
    }
  }

  toString() {
    return this.name;
  }
}

export const isSubscription = (obj: unknown): obj is Subscription => {
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

  subscriptions.map((subscription) => {
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

      subscription.attributes.map((attribute) => {
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

      subscription.attributes.map((attributeName) => {
        passOrThrow(
          entityAttributes[attributeName],
          () =>
            `Cannot use attribute '${entity.name}.${attributeName}' in subscription '${entity.name}.${subscription.name}' as it does not exist`,
        );
      });

      // if (subscription.type === SUBSCRIPTION_TYPE_CREATE) {
      //   const missingAttributeNames = requiredAttributeNames.filter(
      //     requiredAttributeName => {
      //       return !subscription.attributes.includes(requiredAttributeName);
      //     },
      //   );

      //   passOrThrow(
      //     missingAttributeNames.length === 0,
      //     () =>
      //       `Missing required attributes in subscription '${entity.name}.${
      //         subscription.name
      //       }' need to have a defaultValue() function: [ ${missingAttributeNames.join(
      //         ', ',
      //       )} ]`,
      //   );
      // }
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

    if (subscription.delimiter) {
      passOrThrow(
        typeof subscription.delimiter === 'string',
        () =>
          `Subscription '${entity.name}.${subscription.name}' delimiter should be a string`,
      );
    } else {
      subscription.delimiter = '/';
    }

    if (subscription.wildCard) {
      // todo make a list of valid wildCards (#, +, *)
      passOrThrow(
        typeof subscription.wildCard === 'string',
        () =>
          `Subscription '${entity.name}.${subscription.name}' wildCard should be a string`,
      );
    }

    if (subscription.pattern) {
      // todo validate pattern based on entityAttributes
      passOrThrow(
        typeof subscription.pattern === 'string',
        () =>
          `Subscription '${entity.name}.${subscription.name}' pattern should be a string`,
      );
    }
    // else {
    //   subscription.pattern = Object.keys(entityAttributes).join(
    //     subscription.delimiter,
    //   );
    // }
  });

  return subscriptions;
};
