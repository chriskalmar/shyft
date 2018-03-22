

import {
  ProtocolConfiguration,
} from 'shift-engine';
import {
  generateTypeName,
  generateTypeNamePlural,
  generateTypeNamePascalCase,
  generateTypeNamePluralPascalCase,
} from './util';


class ProtocolGraphQLConfiguration extends ProtocolConfiguration {

  constructor() {
    super()

    this.enableFeatures([
      'query',
      'action',
      'mutation',
      'mutationNested',
      'mutationById',
      'mutationByUniqueness',
    ], true)
  }

  generateEntityTypeName(entity) {
    return generateTypeName(entity.name)
  }

  generateEntityTypeNamePlural(entity) {
    return generateTypeNamePlural(entity.name)
  }

  generateEntityTypeNamePascalCase(entity) {
    return generateTypeNamePascalCase(entity.name)
  }

  generateEntityTypeNamePluralPascalCase(entity) {
    return generateTypeNamePluralPascalCase(entity.name)
  }

  generateReverseConnectionFieldName(sourceEntity, sourceAttributeName) {
    const typeNamePlural = this.generateEntityTypeNamePlural(sourceEntity)
    return generateTypeName(`${typeNamePlural}-by-${sourceAttributeName}`)
  }

  generateReferenceFieldName(referenceEntity, attribute) {
    const fieldName = this.generateFieldName(attribute)
    return generateTypeName(`${referenceEntity.name}-by-${fieldName}`)
  }


  generateFieldName(attribute) {
    return generateTypeName(attribute.name)
  }

  generateListQueryTypeName(entity) {
    const typeNamePlural = this.generateEntityTypeNamePlural(entity)
    return generateTypeName(`all-${typeNamePlural}`)
  }

  generateInstanceQueryTypeName(entity) {
    return this.generateEntityTypeName(entity)
  }

  generateInstanceByUniqueQueryTypeName(entity, attribute) {
    const typeName = this.generateEntityTypeName(entity)
    const fieldName = this.generateFieldName(attribute)
    return generateTypeName(`${typeName}-by-${fieldName}`)
  }


  generateMutationInstanceInputName(entity, mutation) {
    const typeName = this.generateEntityTypeName(entity)
    return generateTypeNamePascalCase(`${mutation.name}-${typeName}-instance-input`)
  }

  generateMutationInputName(entity, mutation) {
    const typeName = this.generateEntityTypeName(entity)
    return generateTypeNamePascalCase(`${mutation.name}-${typeName}-input`)
  }

  generateMutationByPrimaryAttributeInputName(entity, mutation, attribute) {
    const typeName = this.generateEntityTypeName(entity)
    const fieldName = this.generateFieldName(attribute)
    return generateTypeNamePascalCase(`${mutation.name}-${typeName}-by-${fieldName}-input`)
  }


  generateUniquenessAttributesName(entity, attributes) {
    return generateTypeName(attributes.join('-and-'))
  }

  generateInstanceUniquenessInputName(entity, uniquenessAttributesName) {
    const typeName = this.generateEntityTypeName(entity)
    return generateTypeNamePascalCase(`${typeName}-instance-uniqueness-on-${uniquenessAttributesName}-input`)
  }


  generateMutationInstanceNestedInputName(entity, mutation) {
    const typeName = this.generateEntityTypeName(entity)
    return generateTypeNamePascalCase(`${mutation.name}-${typeName}-instance-nested-input`)
  }

  generateMutationNestedInputName(entity, mutation) {
    const typeName = this.generateEntityTypeName(entity)
    return generateTypeNamePascalCase(`${mutation.name}-${typeName}-nested-input`)
  }


  generateMutationOutputName(entity, mutation) {
    const typeName = this.generateEntityTypeName(entity)
    return generateTypeNamePascalCase(`${mutation.name}-${typeName}-output`)
  }


}


export default ProtocolGraphQLConfiguration


export const isProtocolGraphQLConfiguration = (obj) => {
  return (obj instanceof ProtocolGraphQLConfiguration)
}
