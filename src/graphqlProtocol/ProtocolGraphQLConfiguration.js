import {
  generateTypeName,
  generateTypeNamePlural,
  generateTypeNamePascalCase,
  generateTypeNamePluralPascalCase,
  generateTypeNameUpperCase,
} from './util';
import { MAX_PAGE_SIZE } from './protocolGraphqlConstants';
import { ProtocolConfiguration } from '../engine/protocol/ProtocolConfiguration';

export class ProtocolGraphQLConfiguration extends ProtocolConfiguration {
  constructor() {
    super();

    this.enableFeatures(
      [
        'query',
        'action',
        'mutation',
        'mutationNested',
        'mutationById',
        'mutationByUniqueness',
      ],
      true,
    );
  }

  getMaxPageSize() {
    return Number(process.env.MAX_PAGE_SIZE) || MAX_PAGE_SIZE;
  }

  /* name generators */

  generateEntityTypeName(entity) {
    return generateTypeName(entity.name);
  }

  generateEntityTypeNamePlural(entity) {
    return generateTypeNamePlural(entity.name);
  }

  generateEntityTypeNamePascalCase(entity) {
    return generateTypeNamePascalCase(entity.name);
  }

  generateEntityTypeNamePluralPascalCase(entity) {
    return generateTypeNamePluralPascalCase(entity.name);
  }

  generateReverseConnectionFieldName(sourceEntity, sourceAttributeName) {
    const typeNamePlural = this.generateEntityTypeNamePlural(sourceEntity);
    return generateTypeName(`${typeNamePlural}-by-${sourceAttributeName}`);
  }

  generateReferenceFieldName(referenceEntity, attribute) {
    const fieldName = this.generateFieldName(attribute);
    return generateTypeName(`${referenceEntity.name}-by-${fieldName}`);
  }

  generateFieldName(attribute) {
    return generateTypeName(attribute.name);
  }

  generateI18nJsonFieldName(attribute) {
    const fieldName = this.generateFieldName(attribute);
    return `${fieldName}_i18nJson`;
  }

  generateI18nFieldName(attribute) {
    const fieldName = this.generateFieldName(attribute);
    return `${fieldName}_i18n`;
  }

  generateI18nFieldTypeName(entity, attribute) {
    const typeName = this.generateEntityTypeName(entity);
    const fieldName = this.generateFieldName(attribute);
    return generateTypeNamePascalCase(`${typeName}-${fieldName}-i18n`);
  }

  generateMutationI18nAttributeInputTypeName(entity, mutation, attribute) {
    const typeName = this.generateEntityTypeName(entity);
    const fieldName = this.generateFieldName(attribute);
    return generateTypeNamePascalCase(
      `${mutation.name}-${typeName}-${fieldName}-i18n-input`,
    );
  }

  generateListQueryTypeName(entity) {
    const typeNamePlural = this.generateEntityTypeNamePlural(entity);
    return generateTypeName(`all-${typeNamePlural}`);
  }

  generateInstanceQueryTypeName(entity) {
    return this.generateEntityTypeName(entity);
  }

  generateInstanceByUniqueQueryTypeName(entity, attribute) {
    const typeName = this.generateEntityTypeName(entity);
    const fieldName = this.generateFieldName(attribute);
    return generateTypeName(`${typeName}-by-${fieldName}`);
  }

  generateMutationInstanceInputTypeName(entity, mutation) {
    const typeName = this.generateEntityTypeName(entity);
    return generateTypeNamePascalCase(
      `${mutation.name}-${typeName}-instance-input`,
    );
  }

  generateMutationInputTypeName(entity, mutation) {
    const typeName = this.generateEntityTypeName(entity);
    return generateTypeNamePascalCase(`${mutation.name}-${typeName}-input`);
  }

  generateMutationByPrimaryAttributeInputTypeName(entity, mutation, attribute) {
    const typeName = this.generateEntityTypeName(entity);
    const fieldName = this.generateFieldName(attribute);
    return generateTypeNamePascalCase(
      `${mutation.name}-${typeName}-by-${fieldName}-input`,
    );
  }

  generateUniquenessAttributesName(entity, attributes) {
    return generateTypeName(attributes.join('-and-'));
  }

  generateUniquenessAttributesFieldName(
    entity,
    attribute,
    uniquenessAttributesName,
  ) {
    const fieldName = this.generateFieldName(attribute);
    return generateTypeName(
      `${fieldName}-by-unique-${uniquenessAttributesName}`,
    );
  }

  generateInstanceUniquenessInputTypeName(entity, uniquenessAttributesName) {
    const typeName = this.generateEntityTypeName(entity);
    return generateTypeNamePascalCase(
      `${typeName}-instance-uniqueness-on-${uniquenessAttributesName}-input`,
    );
  }

  generateMutationInstanceNestedInputTypeName(entity, mutation) {
    const typeName = this.generateEntityTypeName(entity);
    return generateTypeNamePascalCase(
      `${mutation.name}-${typeName}-instance-nested-input`,
    );
  }

  generateMutationNestedInputTypeName(entity, mutation) {
    const typeName = this.generateEntityTypeName(entity);
    return generateTypeNamePascalCase(
      `${mutation.name}-${typeName}-nested-input`,
    );
  }

  generateMutationOutputTypeName(entity, mutation) {
    const typeName = this.generateEntityTypeName(entity);
    return generateTypeNamePascalCase(`${mutation.name}-${typeName}-output`);
  }

  generateMutationTypeName(entity, mutation) {
    const typeName = this.generateEntityTypeName(entity);
    return generateTypeName(`${mutation.name}-${typeName}`);
  }

  generateMutationNestedTypeName(entity, mutation) {
    const typeName = this.generateEntityTypeName(entity);
    return generateTypeName(`${mutation.name}-${typeName}-nested`);
  }

  generateMutationByPrimaryAttributeTypeName(entity, mutation, attribute) {
    const typeName = this.generateEntityTypeName(entity);
    const fieldName = this.generateFieldName(attribute);
    return generateTypeName(`${mutation.name}-${typeName}-by-${fieldName}`);
  }

  generateActionTypeName(action) {
    return generateTypeName(action.name);
  }

  generateDataInputTypeName(baseName) {
    return generateTypeNamePascalCase(`${baseName}-data-input`);
  }

  generateNestedDataInputTypeName(baseName, nestedParamName, level) {
    const levelStr = level > 1 ? `L${level}` : '';

    return generateTypeNamePascalCase(
      `${baseName}-${nestedParamName}-${levelStr}-data-input`,
    );
  }

  generateInputTypeName(baseName) {
    return generateTypeNamePascalCase(`${baseName}-input`);
  }

  generateDataOutPutTypeName(baseName) {
    return generateTypeNamePascalCase(`${baseName}-data-output`);
  }

  generateNestedDataOutPutTypeName(baseName, nestedParamName, level) {
    const levelStr = level > 1 ? `L${level}` : '';

    return generateTypeNamePascalCase(
      `${baseName}-${nestedParamName}-${levelStr}-data-output`,
    );
  }

  generateOutPutTypeName(baseName) {
    return generateTypeNamePascalCase(`${baseName}-output`);
  }

  generateSortKeyName(attribute, ascending) {
    const direction = ascending ? 'ASC' : 'DESC';

    return `${generateTypeNameUpperCase(attribute.name)}_${direction}`;
  }

  generateSortInputTypeName(entity) {
    const typeName = this.generateEntityTypeName(entity);
    return generateTypeNamePascalCase(`${typeName}-order-by`);
  }

  generateFilterInputTypeName(entity) {
    const typeName = this.generateEntityTypeName(entity);
    return generateTypeNamePascalCase(`${typeName}-filter`);
  }

  generateConnectionEdgeTypeName(entity) {
    const typeName = this.generateEntityTypeName(entity);
    return generateTypeNamePascalCase(`${typeName}-edge`);
  }

  generateConnectionTypeName(entity) {
    const typeName = this.generateEntityTypeName(entity);
    return generateTypeNamePascalCase(`${typeName}-connection`);
  }
}

export const isProtocolGraphQLConfiguration = obj => {
  return obj instanceof ProtocolGraphQLConfiguration;
};
