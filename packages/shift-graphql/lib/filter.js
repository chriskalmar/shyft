
import {
  GraphQLInputObjectType,
} from 'graphql';

import _ from 'lodash';

import ProtocolGraphQL from './ProtocolGraphQL';

import { isEntity } from 'shift-engine';


export const generateFilterInput = (entity) => {

  const typeNamePascalCase = entity.graphql.typeNamePascalCase
  const typeNamePluralListName = entity.graphql.typeNamePluralPascalCase

  const storageType = entity.storageType


  const entityFilterType = new GraphQLInputObjectType({

    name: `${typeNamePascalCase}Filter`,
    description: `Filter **\`${typeNamePluralListName}\`** by various criteria`,

    fields: () => {
      const fields = {}

      _.forEach(entity.getAttributes(), (attribute) => {

        let attributeType = attribute.type

        // it's a reference
        if (isEntity(attribute.type)) {
          const targetEntity = attribute.type
          const primaryAttribute = targetEntity.getPrimaryAttribute()
          attributeType = primaryAttribute.type
        }

        const fieldType = ProtocolGraphQL.convertToProtocolDataType(attributeType)

        const storageDataType = storageType.convertToStorageDataType(attributeType)

        fields[ attribute.gqlFieldName ] = {
          type: fieldType,
        };

        storageDataType.capabilities.map(capability => {

          const fieldName = `${attribute.gqlFieldName}__${capability}`

          const field = {
            type: fieldType,
          }

          fields[ fieldName ] = field;
        })


      });

      return fields
    }
  })

  return {
    type: entityFilterType,
    description: 'Filter list by various criteria',
  }
}
