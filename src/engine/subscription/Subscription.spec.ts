/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable @typescript-eslint/explicit-function-return-type */

import {
  Subscription,
  isSubscription,
  SUBSCRIPTION_TYPE_CREATE,
  SUBSCRIPTION_TYPE_UPDATE,
  SUBSCRIPTION_TYPE_DELETE,
  processEntitySubscriptions,
  pubsub,
} from './Subscription';
import { Entity } from '../entity/Entity';
import { DataTypeString } from '../datatype/dataTypes';
import { passOrThrow } from '../util';
import { generateTestSchema } from '../../graphqlProtocol/test-helper';
import { generateGraphQLSchema } from '../../graphqlProtocol/generator';
import { subscribe, parse } from 'graphql';

describe('Subscription', () => {
  const entity = new Entity({
    name: 'SomeEntityName',
    description: 'Just some description',
    attributes: {
      someAttribute: {
        type: DataTypeString,
        description: 'Just some description',
      },
      anotherAttribute: {
        type: DataTypeString,
        description: 'Just some description',
      },
    },
  });

  it('should have a name', () => {
    function fn() {
      // eslint-disable-next-line no-new
      new Subscription();
    }

    expect(fn).toThrowErrorMatchingSnapshot();
  });

  it('should have a type', () => {
    function fn() {
      // eslint-disable-next-line no-new
      new Subscription({
        name: 'example',
      });
    }

    expect(fn).toThrowErrorMatchingSnapshot();
  });

  it('should have a valid type', () => {
    function fn() {
      // eslint-disable-next-line no-new
      new Subscription({
        name: 'example',
        type: 12346,
      });
    }

    expect(fn).toThrowErrorMatchingSnapshot();
  });

  it('should have a description', () => {
    function fn() {
      // eslint-disable-next-line no-new
      new Subscription({
        name: 'example',
        type: SUBSCRIPTION_TYPE_CREATE,
      });
    }

    expect(fn).toThrowErrorMatchingSnapshot();
  });

  it('should have a list of default attributes', () => {
    const subscription = new Subscription({
      name: 'example',
      type: SUBSCRIPTION_TYPE_CREATE,
      description: 'subscribe the world',
    });

    processEntitySubscriptions(entity, [subscription]);
    const defaultAttributes = subscription.attributes;

    const expectedAttributes = ['someAttribute', 'anotherAttribute'];

    expect(defaultAttributes).toEqual(expectedAttributes);
  });

  it('should have a list of valid attribute names', () => {
    const subscription = new Subscription({
      name: 'example',
      type: SUBSCRIPTION_TYPE_CREATE,
      description: 'subscribe the world',
      attributes: ['anything', { foo: 'bar' }],
    });

    function fn() {
      processEntitySubscriptions(entity, [subscription]);
    }

    expect(fn).toThrowErrorMatchingSnapshot();
  });

  it('should allow an empty attributes list for UPDATE type subscriptions', () => {
    const subscription = new Subscription({
      name: 'example',
      type: SUBSCRIPTION_TYPE_UPDATE,
      description: 'subscribe the world',
      attributes: [],
    });

    processEntitySubscriptions(entity, [subscription]);
    expect(subscription.attributes).toEqual([]);
  });

  it('should allow an empty attributes list for DELETE type subscriptions', () => {
    const subscription = new Subscription({
      name: 'example',
      type: SUBSCRIPTION_TYPE_DELETE,
      description: 'subscribe the world',
      attributes: [],
    });

    processEntitySubscriptions(entity, [subscription]);
    expect(subscription.attributes).not.toBeDefined();
  });

  it('should have a list of unique attribute names', () => {
    const subscription = new Subscription({
      name: 'example',
      type: SUBSCRIPTION_TYPE_CREATE,
      description: 'subscribe the world',
      attributes: ['anything', 'anything'],
    });

    function fn() {
      processEntitySubscriptions(entity, [subscription]);
    }

    expect(fn).toThrowErrorMatchingSnapshot();
  });

  it("should return it's name", () => {
    const subscription = new Subscription({
      name: 'example',
      type: SUBSCRIPTION_TYPE_UPDATE,
      description: 'mutate the world',
      attributes: ['anything'],
    });

    expect(subscription.name).toBe('example');
    expect(String(subscription)).toBe('example');
  });

  it('should have a valid preProcessor function', () => {
    function fn() {
      // eslint-disable-next-line no-new
      new Subscription({
        name: 'example',
        type: SUBSCRIPTION_TYPE_CREATE,
        description: 'mutate the world',
        attributes: ['anything'],
        preProcessor: 'not-a-function',
      });
    }

    expect(fn).toThrowErrorMatchingSnapshot();
  });

  it('should have a valid postProcessor function', () => {
    function fn() {
      // eslint-disable-next-line no-new
      new Subscription({
        name: 'example',
        type: SUBSCRIPTION_TYPE_CREATE,
        description: 'mutate the world',
        attributes: ['anything'],
        postProcessor: 'not-a-function',
      });
    }

    expect(fn).toThrowErrorMatchingSnapshot();
  });

  describe('isSubscription', () => {
    const subscription = new Subscription({
      name: 'example',
      type: SUBSCRIPTION_TYPE_UPDATE,
      description: 'mutate the world',
      attributes: ['anything'],
      preProcessor() {
        return null;
      },
      postProcessor() {
        return {};
      },
    });

    it('should recognize objects of type Subscription', () => {
      function fn() {
        passOrThrow(
          isSubscription(subscription),
          () => 'This error will never happen',
        );
      }

      expect(fn).not.toThrow();
    });

    it('should recognize non-Subscription objects', () => {
      function fn() {
        passOrThrow(
          isSubscription({}) ||
            isSubscription(function test() {}) ||
            isSubscription(Error),
          () => 'Not a Subscription object',
        );
      }

      expect(fn).toThrowErrorMatchingSnapshot();
    });
  });

  describe('processEntitySubscriptions', () => {
    it('should throw if provided with an invalid list of subscriptions', () => {
      const subscriptions = {
        foo: [{}],
      };

      function fn() {
        processEntitySubscriptions(entity, subscriptions);
      }

      expect(fn).toThrowErrorMatchingSnapshot();
    });

    it('should throw if provided with an invalid subscription', () => {
      const subscriptions = [{ foo: 'bar' }];

      function fn() {
        processEntitySubscriptions(entity, subscriptions);
      }

      expect(fn).toThrowErrorMatchingSnapshot();
    });

    // this check seems useless for subscription
    it.skip('should throw if required attribute is missing in CREATE type subscriptions', () => {
      function fn() {
        const otherEntity = new Entity({
          name: 'SomeEntityName',
          description: 'Just some description',
          attributes: {
            someAttribute: {
              type: DataTypeString,
              description: 'Just some description',
            },
            neededAttribute: {
              type: DataTypeString,
              description: 'This is important',
              required: true,
            },
          },
          subscriptions: [
            new Subscription({
              type: SUBSCRIPTION_TYPE_CREATE,
              name: 'onBuild',
              description: 'build item',
              attributes: ['someAttribute'],
            }),
          ],
        });

        otherEntity.getSubscriptionByName('onBuild');
      }

      expect(fn).toThrowErrorMatchingSnapshot();
    });

    it('should throw on duplicate subscription names', () => {
      const subscriptions = [
        new Subscription({
          type: SUBSCRIPTION_TYPE_CREATE,
          name: 'onBuild',
          description: 'build item',
          attributes: ['someAttribute'],
        }),
        new Subscription({
          type: SUBSCRIPTION_TYPE_DELETE,
          name: 'onBuild',
          description: 'build item',
          attributes: ['someAttribute'],
        }),
      ];

      function fn() {
        processEntitySubscriptions(entity, subscriptions);
      }

      expect(fn).toThrowErrorMatchingSnapshot();
    });

    it('should throw if unknown attributes are used', () => {
      const subscriptions = [
        new Subscription({
          type: SUBSCRIPTION_TYPE_CREATE,
          name: 'onBuild',
          description: 'build item',
          attributes: ['doesNotExist'],
        }),
      ];

      function fn() {
        processEntitySubscriptions(entity, subscriptions);
      }

      expect(fn).toThrowErrorMatchingSnapshot();
    });

    it('should allow for empty attribute lists on DELETE type subscriptions', () => {
      const subscriptions = [
        new Subscription({
          type: SUBSCRIPTION_TYPE_DELETE,
          name: 'onDrop',
          description: 'drop item',
          attributes: [],
        }),
      ];

      processEntitySubscriptions(entity, subscriptions);
    });
  });

  describe('preProcessor', () => {
    const testEntity = new Entity({
      name: 'SomeTestsEntityName',
      description: 'Just some description',
      attributes: {
        someAttribute: {
          type: DataTypeString,
          description: 'Just some description',
          required: false,
        },
        anotherAttribute: {
          type: DataTypeString,
          description: 'Just some description',
        },
      },
      subscriptions: [
        new Subscription({
          name: 'SomeSubWithPreProcessor',
          type: SUBSCRIPTION_TYPE_CREATE,
          description: 'build item',
          attributes: ['someAttribute'],
          delimiter: '/',
          // wildCard: '',
          // pattern: '',
          preProcessor: (
            _entity,
            _id,
            _source,
            input,
            typeName,
            entitySubscription,
          ) => {
            if (entitySubscription.attributes && Object.keys(input).length) {
              const delimiter = entitySubscription.delimiter;
              const filled = entitySubscription.attributes
                .map(attribute => input[attribute])
                .reduce((acc, curr) => `${acc + delimiter + curr}`, '');

              const topic = `${entitySubscription.name}${_entity.name}${filled}`;
              return topic;
            }

            return null;
          },
        }),
      ],
    });

    const someAttribute = 'test';

    it('should pass through preProcessor if it is declared', async () => {
      const subscriptionByName = testEntity.getSubscriptionByName(
        'SomeSubWithPreProcessor',
      );
      expect(subscriptionByName).toMatchSnapshot();

      const setup = await generateTestSchema({ entities: [testEntity] });
      const graphqlSchema = generateGraphQLSchema(setup.configuration);
      const subscriptionDoc = parse(`
        subscription someSubWithPreProcessorSomeTestsEntityName($input: SomeSubWithPreProcessorSomeTestsEntityNameInput!) {
          someSubWithPreProcessorSomeTestsEntityName(input: $input) {
            someTestsEntityName {
              # someAttribute
              anotherAttribute
            }
          }
        }`);

      // subscription topic will be automatically generated by shyft
      let subscription = (await subscribe({
        schema: graphqlSchema,
        document: subscriptionDoc,
        variableValues: {
          input: {
            someTestsEntityName: {},
          },
        },
        contextValue: { pubsub },
      })) as AsyncIterableIterator<any>;

      let pending = subscription.next();

      await pubsub.publish('SomeSubWithPreProcessorSomeTestsEntityName', {
        // someTestsEntityName: {
        someAttribute,
        anotherAttribute: 'world',
        // },
      });

      let result = await pending;
      expect(result).toMatchSnapshot('withoutPreProcessorResult');
      expect(await subscription.return()).toMatchSnapshot(
        'withoutPreProcessorEnd',
      );

      // subscription topic will be generated in preProcessor
      subscription = (await subscribe({
        schema: graphqlSchema,
        document: subscriptionDoc,
        variableValues: {
          input: {
            someTestsEntityName: {
              someAttribute,
            },
          },
        },
        contextValue: { pubsub },
      })) as AsyncIterableIterator<any>;

      pending = subscription.next();

      await pubsub.publish(
        `SomeSubWithPreProcessorSomeTestsEntityName/${someAttribute}`,
        {
          someAttribute,
          anotherAttribute: 'world',
        },
      );

      result = await pending;
      expect(result).toMatchSnapshot('withPreProcessorResult');
      expect(await subscription.return()).toMatchSnapshot(
        'withPreProcessorEnd',
      );
    });
  });

  describe('postProcessor', () => {
    const testEntity = new Entity({
      name: 'SomeTestsEntityName',
      description: 'Just some description',
      attributes: {
        someAttribute: {
          type: DataTypeString,
          description: 'Just some description',
          required: false,
        },
        anotherAttribute: {
          type: DataTypeString,
          description: 'Just some description',
        },
      },
      subscriptions: [
        new Subscription({
          name: 'SomeSubWithPostProcessor',
          type: SUBSCRIPTION_TYPE_CREATE,
          description: 'build item',
          attributes: ['someAttribute'],
          delimiter: '/',
          postProcessor: (
            _entity,
            // _id,
            _source,
            input,
            typeName,
            entitySubscription,
            context,
          ) => {
            if (context && context.changePayload) {
              return { anotherAttribute: 'earth' };
            }
            return null;
          },
        }),
      ],
    });

    const someAttribute = 'test';

    it('should pass through postProcessor if it is declared', async () => {
      const subscriptionByName = testEntity.getSubscriptionByName(
        'SomeSubWithPostProcessor',
      );
      expect(subscriptionByName).toMatchSnapshot();

      const setup = await generateTestSchema({ entities: [testEntity] });
      const graphqlSchema = generateGraphQLSchema(setup.configuration);
      const subscriptionDoc = parse(`
        subscription someSubWithPostProcessorSomeTestsEntityName($input: SomeSubWithPostProcessorSomeTestsEntityNameInput!) {
          someSubWithPostProcessorSomeTestsEntityName(input: $input) {
            someTestsEntityName {
              # someAttribute
              anotherAttribute
            }
          }
        }`);

      let subscription = (await subscribe({
        schema: graphqlSchema,
        document: subscriptionDoc,
        variableValues: {
          input: {
            someTestsEntityName: {},
          },
        },
        contextValue: { pubsub },
      })) as AsyncIterableIterator<any>;

      let pending = subscription.next();

      await pubsub.publish('SomeSubWithPostProcessorSomeTestsEntityName', {
        someAttribute,
        anotherAttribute: 'world',
      });

      let result = await pending;
      expect(result).toMatchSnapshot('withoutPostProcessorResult');
      expect(await subscription.return()).toMatchSnapshot(
        'withoutPostProcessorEnd',
      );

      subscription = (await subscribe({
        schema: graphqlSchema,
        document: subscriptionDoc,
        variableValues: {
          input: {
            someTestsEntityName: {},
          },
        },
        contextValue: { pubsub, changePayload: true },
      })) as AsyncIterableIterator<any>;

      pending = subscription.next();

      await pubsub.publish('SomeSubWithPostProcessorSomeTestsEntityName', {
        someAttribute,
        anotherAttribute: 'world',
      });

      result = await pending;
      expect(result).toMatchSnapshot('withPostProcessorResult');
      expect(await subscription.return()).toMatchSnapshot(
        'withPostProcessorEnd',
      );
    });
  });
});
