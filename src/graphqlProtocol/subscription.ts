import { GraphQLNonNull } from 'graphql';
import * as _ from 'lodash';

import { ProtocolGraphQL } from './ProtocolGraphQL';
import { ProtocolGraphQLConfiguration } from './ProtocolGraphQLConfiguration';
import {
  getSubscriptionResolver,
  getSubscriptionPayloadResolver,
} from './resolver';
import {
  generateOperationInstanceInput,
  generateOperationInput,
  generateOperationOutput,
  generateOperationInstanceNestedInput,
  generateOperationNestedInput,
  generateOperationByPrimaryAttributeInput,
  extractIdFromNodeId,
} from './operation';
import { getRegisteredEntityAttribute } from './registry';

export const generateSubscriptions = (graphRegistry) => {
  const protocolConfiguration = ProtocolGraphQL.getProtocolConfiguration() as ProtocolGraphQLConfiguration;
  const subscriptions = {};

  // generateInstanceUniquenessInputs(graphRegistry);

  _.forEach(graphRegistry.types, ({ type, entity }, typeName) => {
    if (!entity.getSubscriptions) {
      return;
    }

    // console.log('generateSubscriptions', { type, typeName });

    const entitySubscriptions = entity.getSubscriptions();

    if (!entitySubscriptions || entitySubscriptions.length < 1) {
      return;
    }

    entitySubscriptions.map((entitySubscription) => {
      const subscriptionName = protocolConfiguration.generateOperationTypeName(
        entity,
        entitySubscription,
      );

      let entitySubscriptionInstanceInputType;

      if (
        entitySubscription.attributes &&
        entitySubscription.attributes.length
      ) {
        entitySubscriptionInstanceInputType = generateOperationInstanceInput(
          entity,
          entitySubscription,
        );
      }

      const subscriptionInputType = generateOperationInput(
        entity,
        typeName,
        entitySubscription,
        entitySubscriptionInstanceInputType,
      );
      const subscriptionOutputType = generateOperationOutput(
        entity,
        typeName,
        type,
        entitySubscription,
      );

      subscriptions[subscriptionName] = {
        type: subscriptionOutputType,
        description: entitySubscription.description,
        args: {
          input: {
            description: 'Input argument for this subscription',
            type: new GraphQLNonNull(subscriptionInputType),
          },
        },
        subscribe: getSubscriptionResolver(
          entity,
          entitySubscription,
          typeName,
          false,
          ({ args }) =>
            extractIdFromNodeId(graphRegistry, entity.name, args.input.nodeId),
        ),
        resolve: getSubscriptionPayloadResolver(
          entity,
          entitySubscription,
          typeName,
        ),
      };

      if (entitySubscription.isTypeCreate || entitySubscription.isTypeUpdate) {
        const subscriptionNestedName = protocolConfiguration.generateOperationNestedTypeName(
          entity,
          entitySubscription,
        );

        let entitySubscriptionInstanceNestedInputType;

        if (
          entitySubscription.attributes &&
          entitySubscription.attributes.length
        ) {
          entitySubscriptionInstanceNestedInputType = generateOperationInstanceNestedInput(
            entity,
            entitySubscription,
            graphRegistry,
          );
        }

        const subscriptionInputNestedType = generateOperationNestedInput(
          entity,
          typeName,
          entitySubscription,
          entitySubscriptionInstanceNestedInputType,
        );
        subscriptions[subscriptionNestedName] = {
          type: subscriptionOutputType,
          description: entitySubscription.description,
          args: {
            input: {
              description: 'Input argument for this subscription',
              type: new GraphQLNonNull(subscriptionInputNestedType),
            },
          },
          subscribe: getSubscriptionResolver(
            entity,
            entitySubscription,
            typeName,
            true,
            ({ args }) =>
              extractIdFromNodeId(
                graphRegistry,
                entity.name,
                args.input.nodeId,
              ),
          ),
          resolve: getSubscriptionPayloadResolver(
            entity,
            entitySubscription,
            typeName,
          ),
        };
      }

      if (entitySubscription.needsInstance) {
        const primaryAttribute = entity.getPrimaryAttribute();

        if (primaryAttribute) {
          const { fieldName } = getRegisteredEntityAttribute(
            entity.name,
            primaryAttribute.name,
          );
          const subscriptionByPrimaryAttributeInputType = generateOperationByPrimaryAttributeInput(
            entity,
            typeName,
            entitySubscription,
            entitySubscriptionInstanceInputType,
            primaryAttribute,
          );
          const subscriptionByPrimaryAttributeName = protocolConfiguration.generateOperationByPrimaryAttributeTypeName(
            entity,
            entitySubscription,
            primaryAttribute,
          );

          subscriptions[subscriptionByPrimaryAttributeName] = {
            type: subscriptionOutputType,
            description: entitySubscription.description,
            args: {
              input: {
                description: 'Input argument for this subscription',
                type: new GraphQLNonNull(
                  subscriptionByPrimaryAttributeInputType,
                ),
              },
            },
            subscribe: getSubscriptionResolver(
              entity,
              entitySubscription,
              typeName,
              false,
              ({ args }) => args.input[fieldName],
            ),
            resolve: getSubscriptionPayloadResolver(
              entity,
              entitySubscription,
              typeName,
            ),
          };
        }
      }
    });
  });

  return subscriptions;
};
