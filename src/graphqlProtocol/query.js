import * as _ from 'lodash';
import { ProtocolGraphQL } from './ProtocolGraphQL';

import { GraphQLNonNull, GraphQLID } from 'graphql';

import { resolveByFind, resolveByFindOne } from './resolver';

export const generateListQueries = graphRegistry => {
  const protocolConfiguration = ProtocolGraphQL.getProtocolConfiguration();
  const listQueries = {};

  _.forEach(graphRegistry.types, ({ entity }, typeName) => {
    const typeNamePluralListName = entity.graphql.typeNamePluralPascalCase;
    const queryName = protocolConfiguration.generateListQueryTypeName(entity);

    listQueries[queryName] = {
      type: graphRegistry.types[typeName].connection,
      description: `Fetch a list of **\`${typeNamePluralListName}\`**\n${entity.descriptionPermissionsFind ||
        ''}`,
      args: graphRegistry.types[typeName].connectionArgs,
      resolve: resolveByFind(entity),
    };
  });

  return listQueries;
};

export const generateInstanceQueries = (graphRegistry, idFetcher) => {
  const protocolConfiguration = ProtocolGraphQL.getProtocolConfiguration();
  const instanceQueries = {};

  _.forEach(graphRegistry.types, ({ type, entity }) => {
    const typeNamePascalCase = entity.graphql.typeNamePascalCase;
    const queryName = protocolConfiguration.generateInstanceQueryTypeName(
      entity,
    );

    instanceQueries[queryName] = {
      type: type,
      description: `Fetch a single **\`${typeNamePascalCase}\`** using its node ID\n${entity.descriptionPermissionsRead ||
        ''}`,
      args: {
        nodeId: {
          type: new GraphQLNonNull(GraphQLID),
        },
      },
      resolve: (source, { nodeId }, context, info) =>
        idFetcher(nodeId, context, info),
    };

    // find the primary attribute and add a query for it
    const attributes = entity.getAttributes();
    const primaryAttributeName = _.findKey(attributes, { isPrimary: true });

    if (primaryAttributeName) {
      const primaryAttribute = attributes[primaryAttributeName];

      const fieldName = primaryAttribute.gqlFieldName;
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
        description: `Fetch a single **\`${typeNamePascalCase}\`** using its **\`${fieldName}\`**\n${entity.descriptionPermissionsRead ||
          ''}`,
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
