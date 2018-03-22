
import {
  GraphQLEnumType,
  GraphQLList,
} from 'graphql';

import _ from 'lodash';

import { isEntity } from 'shift-engine';
import ProtocolGraphQL from './ProtocolGraphQL';


export const generateSortInput = (entity) => {

  const protocolConfiguration = ProtocolGraphQL.getProtocolConfiguration()
  const storageType = entity.storageType

  const sortNames = {}
  let defaultSortValue

  _.forEach(entity.getAttributes(), (attribute) => {

    if (isEntity(attribute.type)) {
      return
    }

    const storageDataType = storageType.convertToStorageDataType(attribute.type)

    if (!storageDataType.isSortable) {
      return
    }


    const keyAsc = protocolConfiguration.generateSortKeyName(attribute, true)
    const keyDesc = protocolConfiguration.generateSortKeyName(attribute, false)

    // add ascending key
    sortNames[ keyAsc ] = {
      description: `Order by **\`${attribute.gqlFieldName}\`** ascending`,
      value: {
        attribute: attribute.name,
        direction: 'ASC',
      }
    }


    if (attribute.isPrimary) {
      defaultSortValue = sortNames[ keyAsc ].value
    }


    // add descending key
    sortNames[ keyDesc ] = {
      description: `Order by **\`${attribute.gqlFieldName}\`** descending`,
      value: {
        attribute: attribute.name,
        direction: 'DESC',
      }
    }
  })


  if (_.isEmpty(sortNames)) {
    return null
  }


  const sortInputType = new GraphQLEnumType({
    name: protocolConfiguration.generateSortInputTypeName(entity),
    values: sortNames
  });


  if (!defaultSortValue) {
    defaultSortValue = sortInputType.getValues()[0].value
  }

  return {
    type: new GraphQLList(sortInputType),
    description: 'Order list by a single or multiple attributes',
    defaultValue: [ defaultSortValue ],
  }
}
