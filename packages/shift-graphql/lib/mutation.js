
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
  MUTATION_TYPE_CREATE,
  MUTATION_TYPE_UPDATE,
  MUTATION_TYPE_DELETE,
  INDEX_UNIQUE,
  CustomError,
  fillSystemAttributesDefaultValues,
  fillDefaultValues,
  serializeValues,
  validateMutationPayload,
} from 'shift-engine';

import {
  addRelayTypePromoterToInstance,
  addRelayTypePromoterToInstanceFn,
} from './util';


const i18nInputFieldTypesCache = {}

const generateI18nInputFieldType = (entity, entityMutation, attribute) => {
  const protocolConfiguration = ProtocolGraphQL.getProtocolConfiguration()
  const i18nFieldTypeName = protocolConfiguration.generateMutationI18nAttributeInputTypeName(entity, entityMutation, attribute)

  if (i18nInputFieldTypesCache[ i18nFieldTypeName ]) {
    return i18nInputFieldTypesCache[ i18nFieldTypeName ]
  }

  const attributeType = attribute.type
  const typeNamePascalCase = entity.graphql.typeNamePascalCase
  const languages = protocolConfiguration.getParentConfiguration().getLanguageCodes()
  const fieldType = ProtocolGraphQL.convertToProtocolDataType(attributeType, entity.name, true)

  const i18nFieldType = new GraphQLInputObjectType({
    name: i18nFieldTypeName,
    description: `**\`${entityMutation.name}\`** mutation translations input type for **\`${typeNamePascalCase}.${attribute.gqlFieldName}\`**`,

    fields: () => {
      const i18nFields = {}

      languages.map((language) => {
        const type = (language === 'default' && attribute.required && !entityMutation.ignoreRequired)
          ? new GraphQLNonNull(fieldType)
          : fieldType

        i18nFields[ language ] = {
          type,
        }
      })

      return i18nFields
    }
  })

  i18nInputFieldTypesCache[ i18nFieldTypeName ] = i18nFieldType

  return i18nFieldType
}


const checkRequiredI18nInputs = (entity, entityMutation, input) => {
  const entityAttributes = entity.getAttributes()

  _.forEach(entityMutation.attributes, (attributeName) => {

    const attribute = entityAttributes[ attributeName ]
    const { gqlFieldName, gqlFieldNameI18n } = attribute

    if (attribute.i18n) {
      if (input[ gqlFieldName ] && input[ gqlFieldNameI18n ] && input[ gqlFieldNameI18n ]) {
        throw new CustomError(`Only one of these fields may be used: ${gqlFieldName}, ${gqlFieldNameI18n}`, 'AmbigiousI18nInputError')
      }

      if (attribute.required && !entityMutation.ignoreRequired) {
        if (!input[ gqlFieldName ] && !input[ gqlFieldNameI18n ]) {
          throw new CustomError(`Provide one of these fields: ${gqlFieldName}, ${gqlFieldNameI18n}`, 'MissingI18nInputError')
        }
      }
    }

  })
}



export const generateMutationInstanceInput = (entity, entityMutation) => {

  const protocolConfiguration = ProtocolGraphQL.getProtocolConfiguration()

  const typeNamePascalCase = entity.graphql.typeNamePascalCase

  const entityMutationInstanceInputType = new GraphQLInputObjectType({
    name: protocolConfiguration.generateMutationInstanceInputTypeName(entity, entityMutation),
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

        const fieldType = ProtocolGraphQL.convertToProtocolDataType(attributeType, entity.name, true)

        fields[ attribute.gqlFieldName ] = {
          type: attribute.required && !entityMutation.ignoreRequired && !attribute.i18n
            ? new GraphQLNonNull(fieldType)
            : fieldType
        };

        if (attribute.i18n) {
          const i18nFieldType = generateI18nInputFieldType(entity, entityMutation, attribute)

          fields[ attribute.gqlFieldNameI18n ] = {
            type: i18nFieldType
          };
        }

      });

      return fields
    }
  })

  return entityMutationInstanceInputType
}



export const generateMutationInput = (entity, typeName, entityMutation, entityMutationInstanceInputType) => {

  const protocolConfiguration = ProtocolGraphQL.getProtocolConfiguration()

  const typeNamePascalCase = entity.graphql.typeNamePascalCase

  const entityMutationInputType = new GraphQLInputObjectType({

    name: protocolConfiguration.generateMutationInputTypeName(entity, entityMutation),
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

      if (entityMutationInstanceInputType) {
        fields[ typeName ] = {
          type: new GraphQLNonNull( entityMutationInstanceInputType )
        }
      }

      return fields
    }
  })

  return entityMutationInputType
}



export const generateMutationByPrimaryAttributeInput = (entity, typeName, entityMutation, entityMutationInstanceInputType, primaryAttribute) => {

  const protocolConfiguration = ProtocolGraphQL.getProtocolConfiguration()

  const fieldName = primaryAttribute.gqlFieldName
  const fieldType = ProtocolGraphQL.convertToProtocolDataType(primaryAttribute.type, entity.name, true)
  const typeNamePascalCase = entity.graphql.typeNamePascalCase

  const entityMutationInputType = new GraphQLInputObjectType({

    name: protocolConfiguration.generateMutationByPrimaryAttributeInputTypeName(entity, entityMutation, primaryAttribute),
    description: `Mutation input type for **\`${typeNamePascalCase}\`** using the **\`${fieldName}\`**`,

    fields: () => {
      const fields = {
        clientMutationId: {
          type: GraphQLString,
        }
      }

      if (entityMutation.needsInstance) {
        fields[ fieldName ] = {
          type: new GraphQLNonNull( fieldType )
        }
      }

      if (entityMutationInstanceInputType) {
        fields[ typeName ] = {
          type: new GraphQLNonNull( entityMutationInstanceInputType )
        }
      }

      return fields
    }
  })

  return entityMutationInputType
}



const getEntityUniquenessAttributes = (entity) => {

  const protocolConfiguration = ProtocolGraphQL.getProtocolConfiguration()

  const ret = []
  const entityIndexes = entity.getIndexes()

  if (entityIndexes) {
    entityIndexes.map(({type, attributes}) => {
      if (type === INDEX_UNIQUE) {
        ret.push({
          uniquenessName: protocolConfiguration.generateUniquenessAttributesName(entity, attributes),
          attributes,
        })
      }
    })
  }

  return ret
}



export const generateInstanceUniquenessInput = (entity, uniquenessAttributes, graphRegistry) => {

  const protocolConfiguration = ProtocolGraphQL.getProtocolConfiguration()

  const typeNamePascalCase = entity.graphql.typeNamePascalCase

  const entityInstanceInputType = new GraphQLInputObjectType({
    name: protocolConfiguration.generateInstanceUniquenessInputTypeName(entity, uniquenessAttributes.uniquenessName),
    description: `Input type for **\`${typeNamePascalCase}\`** using data uniqueness (${uniquenessAttributes.attributes}) to resolve the ID`,

    fields: () => {
      const fields = {}

      const entityAttributes = entity.getAttributes()

      _.forEach(uniquenessAttributes.attributes, (attributeName) => {

        const attribute = entityAttributes[ attributeName ]

        let attributeType = attribute.type

        if (isEntity(attributeType)) {
          const targetEntity = attributeType
          const primaryAttribute = targetEntity.getPrimaryAttribute()
          const targetTypeName = targetEntity.graphql.typeName

          attributeType = primaryAttribute.type
          const fieldType = ProtocolGraphQL.convertToProtocolDataType(attributeType, entity.name, true)

          const uniquenessAttributesList = getEntityUniquenessAttributes(targetEntity)

          if (uniquenessAttributesList.length === 0) {
            fields[ attribute.gqlFieldName ] = {
              type: attribute.required
              ? new GraphQLNonNull(fieldType)
              : fieldType
            };
          }
          else {
            fields[ attribute.gqlFieldName ] = {
              type: fieldType
            };

            const registryType = graphRegistry.types[ targetTypeName ]
            registryType.instanceUniquenessInputs = registryType.instanceUniquenessInputs || {}

            uniquenessAttributesList.map(({uniquenessName}) => {
              const fieldName = protocolConfiguration.generateUniquenessAttributesFieldName(entity, attribute, uniquenessName)
              fields[ fieldName ] = {
                type: registryType.instanceUniquenessInputs[ uniquenessName ]
              }
            })
          }

        }
        else {
          const fieldType = ProtocolGraphQL.convertToProtocolDataType(attributeType, entity.name, true)

          fields[ attribute.gqlFieldName ] = {
            type: new GraphQLNonNull(fieldType)
          };
        }

      });

      return fields
    }
  })

  return entityInstanceInputType
}



export const generateInstanceUniquenessInputs = (graphRegistry) => {

  _.forEach(graphRegistry.types, ( { type, entity }, typeName) => {

    const uniquenessAttributesList = getEntityUniquenessAttributes(entity)

    const registryType = graphRegistry.types[ typeName ]
    registryType.instanceUniquenessInputs = registryType.instanceUniquenessInputs || {}

    uniquenessAttributesList.map((uniquenessAttributes) => {
      const instanceUniquenessInput = generateInstanceUniquenessInput(entity, uniquenessAttributes, graphRegistry)
      registryType.instanceUniquenessInputs[ uniquenessAttributes.uniquenessName ] = instanceUniquenessInput
    })

  })

}



export const generateMutationInstanceNestedInput = (entity, entityMutation, graphRegistry) => {

  const protocolConfiguration = ProtocolGraphQL.getProtocolConfiguration()

  const typeNamePascalCase = entity.graphql.typeNamePascalCase

  const entityMutationInstanceInputType = new GraphQLInputObjectType({
    name: protocolConfiguration.generateMutationInstanceNestedInputTypeName(entity, entityMutation),
    description: `**\`${entityMutation.name}\`** mutation input type for **\`${typeNamePascalCase}\`** using data uniqueness to resolve references`,

    fields: () => {
      const fields = {}

      const entityAttributes = entity.getAttributes()

      _.forEach(entityMutation.attributes, (attributeName) => {

        const attribute = entityAttributes[ attributeName ]

        let attributeType = attribute.type

        if (isEntity(attributeType)) {
          const targetEntity = attributeType
          const primaryAttribute = targetEntity.getPrimaryAttribute()
          const targetTypeName = targetEntity.graphql.typeName

          attributeType = primaryAttribute.type
          const fieldType = ProtocolGraphQL.convertToProtocolDataType(attributeType, entity.name, true)

          const uniquenessAttributesList = getEntityUniquenessAttributes(targetEntity)

          if (uniquenessAttributesList.length === 0) {
            fields[ attribute.gqlFieldName ] = {
              type: attribute.required && !entityMutation.ignoreRequired
              ? new GraphQLNonNull(fieldType)
              : fieldType
            };
          }
          else {
            fields[ attribute.gqlFieldName ] = {
              type: fieldType
            };

            const registryType = graphRegistry.types[ targetTypeName ]
            registryType.instanceUniquenessInputs = registryType.instanceUniquenessInputs || {}

            uniquenessAttributesList.map(({uniquenessName}) => {
              const fieldName = protocolConfiguration.generateUniquenessAttributesFieldName(entity, attribute, uniquenessName)
              fields[ fieldName ] = {
                type: registryType.instanceUniquenessInputs[ uniquenessName ]
              }
            })
          }

        }
        else {
          const fieldType = ProtocolGraphQL.convertToProtocolDataType(attributeType, entity.name, true)

          fields[ attribute.gqlFieldName ] = {
            type: attribute.required && !entityMutation.ignoreRequired && !attribute.i18n
              ? new GraphQLNonNull(fieldType)
              : fieldType
          };

          if (attribute.i18n) {
            const i18nFieldType = generateI18nInputFieldType(entity, entityMutation, attribute)

            fields[ attribute.gqlFieldNameI18n ] = {
              type: i18nFieldType
            };
          }
        }

      });

      return fields
    }
  })

  return entityMutationInstanceInputType
}



export const generateMutationNestedInput = (entity, typeName, entityMutation, entityMutationInstanceUniquenessInputType) => {

  const protocolConfiguration = ProtocolGraphQL.getProtocolConfiguration()

  const typeNamePascalCase = entity.graphql.typeNamePascalCase

  const entityMutationInputType = new GraphQLInputObjectType({
    name: protocolConfiguration.generateMutationNestedInputTypeName(entity, entityMutation),
    description: `Mutation input type for **\`${typeNamePascalCase}\`** using data uniqueness to resolve references`,

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

      if (entityMutationInstanceUniquenessInputType) {
        fields[ typeName ] = {
          type: new GraphQLNonNull( entityMutationInstanceUniquenessInputType )
        }
      }

      return fields
    }
  })

  return entityMutationInputType
}



export const generateMutationOutput = (entity, typeName, type, entityMutation) => {

  const protocolConfiguration = ProtocolGraphQL.getProtocolConfiguration()

  const typeNamePascalCase = entity.graphql.typeNamePascalCase

  const entityMutationOutputType = new GraphQLObjectType({
    name: protocolConfiguration.generateMutationOutputTypeName(entity, entityMutation),
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

        const primaryAttribute = entity.getPrimaryAttribute()

        if (primaryAttribute) {
          const fieldName = primaryAttribute.gqlFieldName
          const fieldType = ProtocolGraphQL.convertToProtocolDataType(primaryAttribute.type, entity.name, false)

          fields[ fieldName ] = {
            type: new GraphQLNonNull(fieldType ),
            description: primaryAttribute.description,
          }
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

  return entityMutationOutputType
}



const extractIdFromNodeId = (graphRegistry, sourceEntityName, nodeId) => {
  let instanceId

  if (nodeId) {
    const {
      type,
      id
    } = fromGlobalId(nodeId);

    instanceId = id

    const entity = graphRegistry.types[ type ]
      ? graphRegistry.types[ type ].entity
      : null

    if (!entity || entity.name !== sourceEntityName) {
      throw new Error('Incompatible nodeId used with this mutation')
    }
  }

  return instanceId
}



const getNestedPayloadResolver = (entity, attributeNames, storageType, path=[]) => {

  const protocolConfiguration = ProtocolGraphQL.getProtocolConfiguration()

  return async (source, args, context, info) => {

    const resultPayload = {}
    const entityAttributes = entity.getAttributes()

    await Promise.all(attributeNames.map( async (attributeName) => {

      const attribute = entityAttributes[ attributeName ]
      const attributeType = attribute.type

      if (isEntity(attributeType)) {
        const targetEntity = attributeType
        const uniquenessAttributesList = getEntityUniquenessAttributes(targetEntity)

        if (uniquenessAttributesList.length > 0) {
          const uniquenessFieldNames = [ attribute.gqlFieldName ]
          const fieldNameToUniquenessAttributesMap = {}

          uniquenessAttributesList.map(({uniquenessName, attributes}) => {
            const fieldName = protocolConfiguration.generateUniquenessAttributesFieldName(entity, attribute, uniquenessName)
            uniquenessFieldNames.push(fieldName)
            fieldNameToUniquenessAttributesMap[ fieldName ] = attributes
          })

          let foundInput = null

          uniquenessFieldNames.map(uniquenessFieldName => {
            if (args[ uniquenessFieldName ]) {

              if (foundInput) {
                throw new CustomError(`Only one of these fields may be used: ${uniquenessFieldNames.join(', ')}`, 'AmbigiousNestedInputError')
              }

              foundInput = uniquenessFieldName
            }
          })

          if (!foundInput) {
            if (attribute.required) {
              throw new CustomError(`Provide one of these fields: ${uniquenessFieldNames.join(', ')}`, 'MissingNestedInputError')
            }
          }
          else {
            const attributes = targetEntity.getAttributes()
            const primaryAttributeName = _.findKey(attributes, { isPrimary: true })
            const uniquenessAttributes = fieldNameToUniquenessAttributesMap[foundInput]

            let result

            if (uniquenessAttributes) {

              const newPath = path.concat(foundInput)
              const nestedPayloadResolver = getNestedPayloadResolver(targetEntity, uniquenessAttributes, storageType, newPath)
              args[ foundInput ] = await nestedPayloadResolver(source, args[ foundInput ], context, info)

              result = await storageType.findOneByValues(targetEntity, args[ foundInput ], context)
                .then(
                  addRelayTypePromoterToInstanceFn(
                    protocolConfiguration.generateEntityTypeName(targetEntity)
                  )
                )
                .then(targetEntity.graphql.dataShaper)

              if (!result) {
                throw new CustomError(`Nested instance at path '${newPath.join('.')}' not found or access denied`, 'NestedInstanceNotFoundOrAccessDenied')
              }
            }
            else {
              result = await storageType.findOne(targetEntity, args[ foundInput ], args[ foundInput ], context)
                .then(
                  addRelayTypePromoterToInstanceFn(
                    protocolConfiguration.generateEntityTypeName(targetEntity)
                  )
                )
                .then(targetEntity.graphql.dataShaper)
            }

            if (result) {
              resultPayload[ attribute.gqlFieldName ] = result[ primaryAttributeName ]
            }
          }
        }
        else {
          resultPayload[ attribute.gqlFieldName ] = args[ attribute.gqlFieldName ]
        }
      }
      else {
        resultPayload[ attribute.gqlFieldName ] = args[ attribute.gqlFieldName ]

        if (attribute.i18n) {
          resultPayload[ attribute.gqlFieldNameI18n ] = args[ attribute.gqlFieldNameI18n ]
        }
      }

    }));

    return resultPayload
  }
}



const getMutationResolver = (entity, entityMutation, typeName, storageType, graphRegistry, nested) => {

  const protocolConfiguration = ProtocolGraphQL.getProtocolConfiguration()
  const nestedPayloadResolver = getNestedPayloadResolver(entity, entityMutation.attributes, storageType)

  return async (source, args, context, info) => {

    checkRequiredI18nInputs(entity, entityMutation, args.input[ typeName ], context)

    if (nested) {
      args.input[ typeName ] = await nestedPayloadResolver(source, args.input[ typeName ], context, info)
    }

    const id = extractIdFromNodeId(graphRegistry, entity.name, args.input.nodeId)

    try {
      if (entityMutation.preProcessor) {
        args.input[ typeName ] = await entityMutation.preProcessor(entity, id, source, args.input[ typeName ], typeName, entityMutation, context, info)
      }

      if (entityMutation.type === MUTATION_TYPE_CREATE) {
        args.input[typeName] = await fillDefaultValues(entity, entityMutation, args.input[typeName], context)
      }

      if (entityMutation.type === MUTATION_TYPE_CREATE || entityMutation.type === MUTATION_TYPE_UPDATE) {
        args.input[typeName] = fillSystemAttributesDefaultValues(entity, entityMutation, args.input[typeName], context)
      }

      validateMutationPayload(entity, entityMutation, args.input[ typeName ], context)

      if (entityMutation.type !== MUTATION_TYPE_DELETE) {
        args.input[typeName] = serializeValues(entity, entityMutation, args.input[typeName], context)
      }

      let ret = {
        clientMutationId: args.input.clientMutationId,
      }

      const input = entity.graphql.reverseDataShaper(args.input[ typeName ])
      let result = await storageType.mutate(entity, id, input, entityMutation, context)

      if (result) {
        if (entityMutation.type !== MUTATION_TYPE_DELETE) {
          result = entity.graphql.dataShaper(
            addRelayTypePromoterToInstance(
              protocolConfiguration.generateEntityTypeName(entity),
              result
            )
          )
        }
      }

      if (entityMutation.type === MUTATION_TYPE_DELETE) {
        ret = {
          ...ret,
          ...result,
        }
      }
      else {
        ret[typeName] = result
      }

      if (entityMutation.postProcessor) {
        await entityMutation.postProcessor(null, result, entity, id, source, args.input[ typeName ], typeName, entityMutation, context, info)
      }

      return ret
    }
    catch(error) {
      if (entityMutation.postProcessor) {
        await entityMutation.postProcessor(error, null, entity, id, source, args.input[ typeName ], typeName, entityMutation, context, info)
      }

      throw error
    }
  }
}


const getMutationByFieldNameResolver = (entity, entityMutation, typeName, storageType, fieldName) => {

  const protocolConfiguration = ProtocolGraphQL.getProtocolConfiguration()

  return async (source, args, context, info) => {

    checkRequiredI18nInputs(entity, entityMutation, args.input[ typeName ], context)

    const id = args.input[ fieldName ]

    try {
      if (entityMutation.preProcessor) {
        args.input[ typeName ] = await entityMutation.preProcessor(entity, id, source, args.input[ typeName ], typeName, entityMutation, context, info)
      }

      if (entityMutation.type === MUTATION_TYPE_UPDATE) {
        args.input[typeName] = fillSystemAttributesDefaultValues(entity, entityMutation, args.input[typeName], context)
      }

      validateMutationPayload(entity, entityMutation, args.input[ typeName ], context)

      if (entityMutation.type !== MUTATION_TYPE_DELETE) {
        args.input[typeName] = serializeValues(entity, entityMutation, args.input[typeName], context)
      }

      let ret = {
        clientMutationId: args.input.clientMutationId,
      }

      const input = entity.graphql.reverseDataShaper(args.input[ typeName ])
      let result = await storageType.mutate(entity, id, input, entityMutation, context)

      if (result) {
        if (entityMutation.type !== MUTATION_TYPE_DELETE) {
          result = entity.graphql.dataShaper(
            addRelayTypePromoterToInstance(
              protocolConfiguration.generateEntityTypeName(entity),
              result
            )
          )
        }
      }

      if (entityMutation.type === MUTATION_TYPE_DELETE) {
        ret = {
          ...ret,
          ...result,
        }
      }
      else {
        ret[typeName] = result
      }


      if (entityMutation.postProcessor) {
        await entityMutation.postProcessor(null, result, entity, id, source, args.input[ typeName ], typeName, entityMutation, context, info)
      }

      return ret
    }
    catch (error) {
      if (entityMutation.postProcessor) {
        await entityMutation.postProcessor(error, null, entity, id, source, args.input[ typeName ], typeName, entityMutation, context, info)
      }

      throw error
    }
  }
}


export const generateMutations = (graphRegistry) => {

  const protocolConfiguration = ProtocolGraphQL.getProtocolConfiguration()
  const mutations = {}

  generateInstanceUniquenessInputs(graphRegistry)

  _.forEach(graphRegistry.types, ( { type, entity }, typeName) => {

    const entityMutations = entity.getMutations()

    if (!entityMutations || entityMutations.length < 1) {
      return
    }

    const storageType = entity.storageType

    entityMutations.map(entityMutation => {

      const mutationName = protocolConfiguration.generateMutationTypeName(entity, entityMutation)

      let entityMutationInstanceInputType

      if (entityMutation.attributes) {
        entityMutationInstanceInputType = generateMutationInstanceInput(entity, entityMutation)
      }

      const mutationInputType = generateMutationInput(entity, typeName, entityMutation, entityMutationInstanceInputType)
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
        resolve: getMutationResolver(entity, entityMutation, typeName, storageType, graphRegistry),
      }


      if (entityMutation.isTypeCreate || entityMutation.isTypeUpdate) {
        const mutationNestedName = protocolConfiguration.generateMutationNestedTypeName(entity, entityMutation)

        let entityMutationInstanceNestedInputType

        if (entityMutation.attributes) {
          entityMutationInstanceNestedInputType = generateMutationInstanceNestedInput(entity, entityMutation, graphRegistry)
        }

        const mutationInputNestedType = generateMutationNestedInput(entity, typeName, entityMutation, entityMutationInstanceNestedInputType)
        mutations[ mutationNestedName ] = {
          type: mutationOutputType,
          description: entityMutation.description,
          args: {
            input: {
              description: 'Input argument for this mutation',
              type: new GraphQLNonNull( mutationInputNestedType ),
            },
          },
          resolve: getMutationResolver(entity, entityMutation, typeName, storageType, graphRegistry, true),
        }
      }


      if (entityMutation.needsInstance) {

        const primaryAttribute = entity.getPrimaryAttribute()

        if (primaryAttribute) {
          const fieldName = primaryAttribute.gqlFieldName
          const mutationByPrimaryAttributeInputType = generateMutationByPrimaryAttributeInput(entity, typeName, entityMutation, entityMutationInstanceInputType, primaryAttribute)
          const mutationByPrimaryAttributeName = protocolConfiguration.generateMutationByPrimaryAttributeTypeName(entity, entityMutation, primaryAttribute)

          mutations[ mutationByPrimaryAttributeName ] = {
            type: mutationOutputType,
            description: entityMutation.description,
            args: {
              input: {
                description: 'Input argument for this mutation',
                type: new GraphQLNonNull( mutationByPrimaryAttributeInputType ),
              },
            },
            resolve: getMutationByFieldNameResolver(entity, entityMutation, typeName, storageType, fieldName),
          }
        }
      }

    })

  })

  return mutations
}
