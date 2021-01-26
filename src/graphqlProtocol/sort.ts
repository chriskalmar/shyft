import { GraphQLEnumType, GraphQLList } from 'graphql';
import * as _ from 'lodash';
import { ProtocolGraphQL } from './ProtocolGraphQL';
import { ProtocolGraphQLConfiguration } from './ProtocolGraphQLConfiguration';
import { isEntity } from '../engine/entity/Entity';
import { isShadowEntity } from '../engine/entity/ShadowEntity';
import { getRegisteredEntityAttribute } from './registry';

export const generateSortInput = (entity) => {
  const protocolConfiguration = ProtocolGraphQL.getProtocolConfiguration() as ProtocolGraphQLConfiguration;
  const storageType = entity.storageType;

  const sortNames = {};
  let defaultSortValue;

  _.forEach(entity.getAttributes(), (attribute) => {
    if (attribute.hidden || attribute.mutationInput) {
      return;
    }

    const { fieldName: gqlFieldName } = getRegisteredEntityAttribute(
      entity.name,
      attribute.name,
    );

    let storageDataType;

    if (isEntity(attribute.type) || isShadowEntity(attribute.type)) {
      const targetPrimaryAttribute = attribute.type.getPrimaryAttribute();
      storageDataType = storageType.convertToStorageDataType(
        targetPrimaryAttribute.type,
      );
    } else {
      storageDataType = storageType.convertToStorageDataType(attribute.type);
    }

    if (!storageDataType.isSortable) {
      return;
    }

    const keyAsc = protocolConfiguration.generateSortKeyName(attribute, true);
    const keyDesc = protocolConfiguration.generateSortKeyName(attribute, false);

    // add ascending key
    sortNames[keyAsc] = {
      description: `Order by **\`${gqlFieldName}\`** ascending`,
      value: {
        attribute: attribute.name,
        direction: 'ASC',
      },
    };

    if (attribute.primary) {
      defaultSortValue = sortNames[keyAsc].value;
    }

    // add descending key
    sortNames[keyDesc] = {
      description: `Order by **\`${gqlFieldName}\`** descending`,
      value: {
        attribute: attribute.name,
        direction: 'DESC',
      },
    };
  });

  if (_.isEmpty(sortNames)) {
    return null;
  }

  const sortInputType = new GraphQLEnumType({
    name: protocolConfiguration.generateSortInputTypeName(entity),
    values: sortNames,
  });

  if (!defaultSortValue) {
    defaultSortValue = sortInputType.getValues()[0].value;
  }

  return {
    type: new GraphQLList(sortInputType),
    description: 'Order list by a single or multiple attributes',
    defaultValue: [defaultSortValue],
  };
};
