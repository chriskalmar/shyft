
import {
  GraphQLList,
  GraphQLNonNull,
  GraphQLInputObjectType,
} from 'graphql';

import _ from 'lodash';

import ProtocolGraphQL from './ProtocolGraphQL';

import {
  isEntity,
  constants,
  isComplexDataType,
} from 'shift-engine';


const {
  storageDataTypeCapabilities,
  storageDataTypeCapabilityType,
} = constants;


export const generateFilterInput = (entity) => {

  const typeNamePascalCase = entity.graphql.typeNamePascalCase
  const typeNamePluralListName = entity.graphql.typeNamePluralPascalCase

  const storageType = entity.storageType


  const entityFilterType = new GraphQLInputObjectType({

    name: `${typeNamePascalCase}Filter`,
    description: `Filter **\`${typeNamePluralListName}\`** by various criteria`,

    fields: () => {
      const fields = {
        AND: {
          description: `Combine **\`${typeNamePascalCase}Filter\`** by a logical **AND**`,
          type: new GraphQLList( new GraphQLNonNull( entityFilterType )),
        },
        OR: {
          description: `Combine **\`${typeNamePascalCase}Filter\`** by a logical **OR**`,
          type: new GraphQLList( new GraphQLNonNull( entityFilterType )),
        },
      }

      _.forEach(entity.getAttributes(), (attribute) => {

        let attributeType = attribute.type

        if (isComplexDataType(attributeType)) {
          return;
        }

        // it's a reference
        if (isEntity(attributeType)) {
          const targetEntity = attributeType
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
          const field = {}

          if (storageDataTypeCapabilities[ capability ] === storageDataTypeCapabilityType.VALUE) {
            field.type = fieldType
          }
          else if (storageDataTypeCapabilities[ capability ] === storageDataTypeCapabilityType.LIST) {
            field.type = new GraphQLList( new GraphQLNonNull( fieldType ))
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
