import { GraphQLNonNull } from 'graphql';
import * as _ from 'lodash';

import { ProtocolGraphQL } from './ProtocolGraphQL';
import { ProtocolGraphQLConfiguration } from './ProtocolGraphQLConfiguration';
import { getMutationResolver } from './resolver';
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

export const generateMutations = (graphRegistry) => {
  const protocolConfiguration = ProtocolGraphQL.getProtocolConfiguration() as ProtocolGraphQLConfiguration;
  const mutations = {};

  // generateInstanceUniquenessInputs(graphRegistry);

  _.forEach(graphRegistry.types, ({ type, entity }, typeName) => {
    if (!entity.getMutations) {
      return;
    }

    const entityMutations = entity.getMutations();

    if (!entityMutations || entityMutations.length < 1) {
      return;
    }

    entityMutations.map((entityMutation) => {
      const mutationName = protocolConfiguration.generateOperationTypeName(
        entity,
        entityMutation,
      );

      let entityMutationInstanceInputType;

      if (entityMutation.attributes && entityMutation.attributes.length) {
        entityMutationInstanceInputType = generateOperationInstanceInput(
          entity,
          entityMutation,
        );
      }

      const mutationInputType = generateOperationInput(
        entity,
        typeName,
        entityMutation,
        entityMutationInstanceInputType,
      );
      const mutationOutputType = generateOperationOutput(
        entity,
        typeName,
        type,
        entityMutation,
      );

      mutations[mutationName] = {
        type: mutationOutputType,
        description: entityMutation.description,
        args: {
          input: {
            description: 'Input argument for this mutation',
            type: new GraphQLNonNull(mutationInputType),
          },
        },
        resolve: getMutationResolver({
          entity,
          entityMutation,
          typeName,
          nested: false,
          idResolver: ({ args }) => {
            return extractIdFromNodeId(
              graphRegistry,
              entity.name,
              args.input.nodeId,
            );
          },
        }),
      };

      if (entityMutation.isTypeCreate || entityMutation.isTypeUpdate) {
        const mutationNestedName = protocolConfiguration.generateOperationNestedTypeName(
          entity,
          entityMutation,
        );

        let entityMutationInstanceNestedInputType;

        if (entityMutation.attributes && entityMutation.attributes.length) {
          entityMutationInstanceNestedInputType = generateOperationInstanceNestedInput(
            entity,
            entityMutation,
            graphRegistry,
          );
        }

        const mutationInputNestedType = generateOperationNestedInput(
          entity,
          typeName,
          entityMutation,
          entityMutationInstanceNestedInputType,
        );
        mutations[mutationNestedName] = {
          type: mutationOutputType,
          description: entityMutation.description,
          args: {
            input: {
              description: 'Input argument for this mutation',
              type: new GraphQLNonNull(mutationInputNestedType),
            },
          },
          resolve: getMutationResolver({
            entity,
            entityMutation,
            typeName,
            nested: true,
            idResolver: ({ args }) => {
              return extractIdFromNodeId(
                graphRegistry,
                entity.name,
                args.input.nodeId,
              );
            },
          }),
        };
      }

      if (entityMutation.needsInstance) {
        const primaryAttribute = entity.getPrimaryAttribute();

        if (primaryAttribute) {
          const { fieldName } = getRegisteredEntityAttribute(
            entity.name,
            primaryAttribute.name,
          );

          const mutationByPrimaryAttributeInputType = generateOperationByPrimaryAttributeInput(
            entity,
            typeName,
            entityMutation,
            entityMutationInstanceInputType,
            primaryAttribute,
          );
          const mutationByPrimaryAttributeName = protocolConfiguration.generateOperationByPrimaryAttributeTypeName(
            entity,
            entityMutation,
            primaryAttribute,
          );

          mutations[mutationByPrimaryAttributeName] = {
            type: mutationOutputType,
            description: entityMutation.description,
            args: {
              input: {
                description: 'Input argument for this mutation',
                type: new GraphQLNonNull(mutationByPrimaryAttributeInputType),
              },
            },
            resolve: getMutationResolver({
              entity,
              entityMutation,
              typeName,
              nested: false,
              idResolver: ({ args }) => {
                return args.input[fieldName];
              },
            }),
          };
        }
      }
    });
  });

  return mutations;
};
