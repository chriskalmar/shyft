import {
  generateTypeName,
  generateTypeNamePlural,
  generateTypeNamePascalCase,
  generateTypeNamePluralPascalCase,
  generateTypeNameUpperCase,
} from './util';
import { MAX_PAGE_SIZE } from './protocolGraphqlConstants';
import { ProtocolConfiguration } from '../engine/protocol/ProtocolConfiguration';
import { Mutation, Subscription, Entity } from '..';

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
        'subscription',
        'subscriptionNested',
        'subscriptionById',
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

  generateReferenceFieldListName(referenceEntity, attribute) {
    const fieldName = this.generateFieldName(attribute);
    const referenceEntityNamePlural = this.generateEntityTypeNamePlural(
      referenceEntity,
    );
    return generateTypeName(`${referenceEntityNamePlural}-by-${fieldName}`);
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

  generateUniquenessAttributesName(_entity, attributes) {
    return generateTypeName(attributes.join('-and-'));
  }

  generateUniquenessAttributesFieldName(
    _entity,
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

  generateInputTypeName(baseName: string) {
    return generateTypeNamePascalCase(`${baseName}-input`);
  }

  generateDataOutPutTypeName(baseName: string) {
    return generateTypeNamePascalCase(`${baseName}-data-output`);
  }

  generateNestedDataOutPutTypeName(
    baseName: string,
    nestedParamName: string,
    level?: number,
  ) {
    const levelStr = level > 1 ? `L${level}` : '';

    return generateTypeNamePascalCase(
      `${baseName}-${nestedParamName}-${levelStr}-data-output`,
    );
  }

  generateOutPutTypeName(baseName: string) {
    return generateTypeNamePascalCase(`${baseName}-output`);
  }

  generateSortKeyName(attribute: any, ascending?: boolean) {
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

  generateFilterPreFilterInputTypeName(entity) {
    const typeName = this.generateEntityTypeName(entity);
    return generateTypeNamePascalCase(`${typeName}-pre-filter`);
  }

  generateFilterPreFilterParamsInputTypeName(entity, preFilter) {
    const typeName = this.generateEntityTypeName(entity);
    return generateTypeNamePascalCase(
      `${typeName}-pre-filter-${preFilter}-params`,
    );
  }

  generateConnectionEdgeTypeName(entity) {
    const typeName = this.generateEntityTypeName(entity);
    return generateTypeNamePascalCase(`${typeName}-edge`);
  }

  generateConnectionTypeName(entity): string {
    const typeName = this.generateEntityTypeName(entity);
    return generateTypeNamePascalCase(`${typeName}-connection`);
  }

  generateOperationI18nAttributeInputTypeName(
    entity: Entity | any,
    operation: Mutation | Subscription | any,
    attribute,
  ) {
    const typeName = this.generateEntityTypeName(entity);
    const fieldName = this.generateFieldName(attribute);
    return generateTypeNamePascalCase(
      `${operation.name}-${typeName}-${fieldName}-i18n-input`,
    );
  }

  generateOperationInstanceInputTypeName(
    entity: Entity,
    operation: Mutation | Subscription,
  ) {
    const typeName = this.generateEntityTypeName(entity);
    return generateTypeNamePascalCase(
      `${operation.name}-${typeName}-instance-input`,
    );
  }

  generateOperationInputTypeName(
    entity: Entity,
    operation: Mutation | Subscription,
  ) {
    const typeName = this.generateEntityTypeName(entity);
    return generateTypeNamePascalCase(`${operation.name}-${typeName}-input`);
  }

  generateOperationByPrimaryAttributeInputTypeName(
    entity: Entity,
    operation: Mutation | Subscription,
    attribute,
  ) {
    const typeName = this.generateEntityTypeName(entity);
    const fieldName = this.generateFieldName(attribute);
    return generateTypeNamePascalCase(
      `${operation.name}-${typeName}-by-${fieldName}-input`,
    );
  }

  generateOperationInstanceNestedInputTypeName(
    entity: Entity,
    operation: Mutation | Subscription,
  ) {
    const typeName = this.generateEntityTypeName(entity);
    return generateTypeNamePascalCase(
      `${operation.name}-${typeName}-instance-nested-input`,
    );
  }

  generateOperationNestedInputTypeName(
    entity: Entity,
    operation: Mutation | Subscription,
  ) {
    const typeName = this.generateEntityTypeName(entity);
    return generateTypeNamePascalCase(
      `${operation.name}-${typeName}-nested-input`,
    );
  }

  generateOperationOutputTypeName(
    entity: Entity,
    operation: Mutation | Subscription,
  ) {
    const typeName = this.generateEntityTypeName(entity);
    return generateTypeNamePascalCase(`${operation.name}-${typeName}-output`);
  }

  generateOperationTypeName(
    entity: Entity,
    operation: Mutation | Subscription,
  ) {
    const typeName = this.generateEntityTypeName(entity);
    return generateTypeName(`${operation.name}-${typeName}`);
  }

  generateOperationNestedTypeName(
    entity: Entity,
    operation: Mutation | Subscription,
  ) {
    const typeName = this.generateEntityTypeName(entity);
    return generateTypeName(`${operation.name}-${typeName}-nested`);
  }

  generateOperationByPrimaryAttributeTypeName(
    entity: Entity,
    operation: Mutation | Subscription,
    attribute,
  ) {
    const typeName = this.generateEntityTypeName(entity);
    const fieldName = this.generateFieldName(attribute);
    return generateTypeName(`${operation.name}-${typeName}-by-${fieldName}`);
  }
}

export const isProtocolGraphQLConfiguration = (obj: any): boolean => {
  return obj instanceof ProtocolGraphQLConfiguration;
};
