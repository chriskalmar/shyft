
import {
  GraphQLString,
  GraphQLID,
  GraphQLNonNull,
  GraphQLInputObjectType,
  GraphQLObjectType,
  GraphQLInt,
} from 'graphql';

import {
  fromGlobalId,
} from 'graphql-relay';

import _ from 'lodash';

import ProtocolGraphQL from './ProtocolGraphQL';

import {
  isEntity,
  constants,
} from 'shift-engine';

import {
  generateTypeNamePascalCase,
} from './util';


export const generateMutationInstanceInput = (entity, entityMutation) => {

  const typeNamePascalCase = entity.graphql.typeNamePascalCase

  const entityMutationInstanceInputType = new GraphQLInputObjectType({
    name: generateTypeNamePascalCase(`${entityMutation.name}_${typeNamePascalCase}InstanceInput`),
    description: `**\`${entityMutation.name}\`** mutation input type for **\`${typeNamePascalCase}\`**`,

    fields: () => {
      const fields = {}

      const entityAttributes = entity.getAttributes()

      _.forEach(entityMutation.attributes, (attributeName) => {

        const attribute = entityAttributes[ attributeName ]

        let attributeType = attribute.type

        // it's a reference
        if (isEntity(attributeType)) {
          const targetEntity = attributeType
          const primaryAttribute = targetEntity.getPrimaryAttribute()
          attributeType = primaryAttribute.type
        }

        const fieldType = ProtocolGraphQL.convertToProtocolDataType(attributeType)

        fields[ attribute.gqlFieldName ] = {
          type: attribute.required && !entityMutation.ignoreRequired
            ? new GraphQLNonNull(fieldType)
            : fieldType
        };

      });

      return fields
    }
  })

  return entityMutationInstanceInputType
}



export const generateMutationInput = (entity, typeName, entityMutation) => {

  const typeNamePascalCase = entity.graphql.typeNamePascalCase

  const entityMutationInputType = new GraphQLInputObjectType({

    name: generateTypeNamePascalCase(`${entityMutation.name}_${typeNamePascalCase}Input`),
    description: `Mutation input type for **\`${typeNamePascalCase}\`**`,

    fields: () => {
      const fields = {
        clientMutationId: {
          type: GraphQLString,
        }
      }

      if (entityMutation.needsInstance) {
        fields.nodeId = {
          type: new GraphQLNonNull( GraphQLID )
        }
      }

      if (entityMutation.attributes) {
        const entityMutationInstanceInputType = generateMutationInstanceInput(entity, entityMutation)

        fields[ typeName ] = {
          type: new GraphQLNonNull( entityMutationInstanceInputType )
        }
      }

      return fields
    }
  })

  return entityMutationInputType
}



export const generateMutationOutput = (entity, typeName, type, entityMutation) => {

  const typeNamePascalCase = entity.graphql.typeNamePascalCase

  const entityMutationInputType = new GraphQLObjectType({

    name: generateTypeNamePascalCase(`${entityMutation.name}_${typeNamePascalCase}Output`),
    description: `Mutation output type for **\`${typeNamePascalCase}\`**`,

    fields: () => {
      const fields = {
        clientMutationId: {
          type: GraphQLString,
        }
      }

      if (entityMutation.isTypeDelete) {
        fields.deleteRowCount = {
          type: new GraphQLNonNull( GraphQLInt ),
          description: 'Number of deleted rows',
        }
      }
      else {
        fields[ typeName ] = {
          type: new GraphQLNonNull( type )
        }
      }

      return fields
    }
  })

  return entityMutationInputType
}



const extractIdFromNodeId = (graphRegistry, sourceEntityName, nodeId) => {
  let instanceId

  if (nodeId) {
    const {
      type,
      id
    } = fromGlobalId(nodeId);

    instanceId = id

    const entity = graphRegistry[ type ]
      ? graphRegistry[ type ].entity
      : null

    if (!entity || entity.name !== sourceEntityName) {
      throw new Error('Incompatible nodeId used with this mutation')
    }
  }

  return instanceId
}



export const generateMutations = (graphRegistry) => {

  const mutations = {}

  _.forEach(graphRegistry, ( { type, entity }, typeName) => {

    const entityMutations = entity.getMutations()

    if (!entityMutations || entityMutations.length < 1) {
      return
    }

    const storageType = entity.storageType

    entityMutations.map(entityMutation => {

      const mutationName = _.camelCase(`${entityMutation.name}_${typeName}`)

      const mutationInputType = generateMutationInput(entity, typeName, entityMutation)
      const mutationOutputType = generateMutationOutput(entity, typeName, type, entityMutation)

      mutations[ mutationName ] = {
        type: mutationOutputType,
        description: entityMutation.description,
        args: {
          input: {
            description: 'Input argument for this mutation',
            type: new GraphQLNonNull( mutationInputType ),
          },
        },
        resolve: async (source, args, context, info) => {

          const id = extractIdFromNodeId(graphRegistry, entity.name, args.input.nodeId)

          const result = await storageType.mutate(entity, id, source, args.input, typeName, entityMutation, context, info, constants.RELAY_TYPE_PROMOTER_FIELD)
          if (result[ typeName ]) {
            result[ typeName ] = entity.graphql.dataShaper(result[ typeName ])
          }
          return result
        },
      }
    })

  })

  return mutations
}

