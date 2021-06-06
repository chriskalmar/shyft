import { GraphQLNonNull, GraphQLID } from 'graphql';
import * as _ from 'lodash';
import { ProtocolGraphQL } from './ProtocolGraphQL';
import { ProtocolGraphQLConfiguration } from './ProtocolGraphQLConfiguration';

import { resolveByFind, resolveByFindOne } from './resolver';
import { isEntity } from '../engine/entity/Entity';
import { isViewEntity } from '../engine/entity/ViewEntity';
import { getRegisteredEntity, getRegisteredEntityAttribute } from './registry';

export const generateListQueries = (graphRegistry) => {
  const protocolConfiguration = ProtocolGraphQL.getProtocolConfiguration() as ProtocolGraphQLConfiguration;

  const listQueries = {};

  _.forEach(graphRegistry.types, ({ entity }, typeName) => {
    if (!isEntity(entity) && !isViewEntity(entity)) {
      return;
    }

    const {
      typeNamePluralPascalCase: typeNamePluralListName,
    } = getRegisteredEntity(entity.name);
    const queryName = protocolConfiguration.generateListQueryTypeName(entity);

    listQueries[queryName] = {
      type: graphRegistry.types[typeName].connection,
      description: `Fetch a list of **\`${typeNamePluralListName}\`**\n${
        entity.descriptionPermissionsFind || ''
      }`,
      args: graphRegistry.types[typeName].connectionArgs,
      resolve: resolveByFind(entity),
    };
  });

  return listQueries;
};

export const generateInstanceQueries = (graphRegistry, idFetcher) => {
  const protocolConfiguration = ProtocolGraphQL.getProtocolConfiguration() as ProtocolGraphQLConfiguration;
  const instanceQueries = {};

  _.forEach(graphRegistry.types, ({ type, entity }) => {
    if (!isEntity(entity) && !isViewEntity(entity)) {
      return;
    }

    const { typeNamePascalCase } = getRegisteredEntity(entity.name);
    const queryName = protocolConfiguration.generateInstanceQueryTypeName(
      entity,
    );

    instanceQueries[queryName] = {
      type: type,
      description: `Fetch a single **\`${typeNamePascalCase}\`** using its node ID\n${
        entity.descriptionPermissionsRead || ''
      }`,
      args: {
        nodeId: {
          type: new GraphQLNonNull(GraphQLID),
        },
      },
      resolve: (_source, { nodeId }, context, info) =>
        idFetcher(nodeId, context, info),
    };

    // find the primary attribute and add a query for it
    const attributes = entity.getAttributes();
    const primaryAttributeName = _.findKey(attributes, { primary: true });

    if (primaryAttributeName) {
      const primaryAttribute = attributes[primaryAttributeName];

      const { fieldName } = getRegisteredEntityAttribute(
        entity.name,
        // eslint-disable-next-line dot-notation
        primaryAttribute['name'],
      );

      const graphqlDataType = ProtocolGraphQL.convertToProtocolDataType(
        primaryAttribute.type,
        entity.name,
        false,
      );
      const queryNamePrimaryAttribute = protocolConfiguration.generateInstanceByUniqueQueryTypeName(
        entity,
        primaryAttribute,
      );

      instanceQueries[queryNamePrimaryAttribute] = {
        type: type,
        description: `Fetch a single **\`${typeNamePascalCase}\`** using its **\`${fieldName}\`**\n${
          entity.descriptionPermissionsRead || ''
        }`,
        args: {
          [fieldName]: {
            type: new GraphQLNonNull(graphqlDataType),
          },
        },
        resolve: resolveByFindOne(entity, ({ args }) => args[fieldName]),
      };
    }
  });

  return instanceQueries;
};
