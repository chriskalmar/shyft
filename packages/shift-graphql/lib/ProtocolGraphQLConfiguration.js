

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
    return generateTypeName(`${referenceEntity.name}-by-${attribute.gqlFieldName}`)
  }


}


export default ProtocolGraphQLConfiguration


export const isProtocolGraphQLConfiguration = (obj) => {
  return (obj instanceof ProtocolGraphQLConfiguration)
}
