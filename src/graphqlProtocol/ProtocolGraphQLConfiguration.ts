import {
  generateTypeName,
  generateTypeNamePlural,
  generateTypeNamePascalCase,
  generateTypeNamePluralPascalCase,
  generateTypeNameUpperCase,
} from './util';
import { MAX_PAGE_SIZE } from './protocolGraphqlConstants';
import { ProtocolConfiguration } from '../engine/protocol/ProtocolConfiguration';
import { Mutation, Subscription, Entity, Action, ViewEntity } from '..';
import { ShadowEntity } from '../engine/entity/ShadowEntity';

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

  generateEntityTypeName(entity: Entity | ViewEntity | ShadowEntity): string {
    return generateTypeName(entity.name);
  }

  generateEntityTypeNamePlural(
    entity: Entity | ViewEntity | ShadowEntity,
  ): string {
    return generateTypeNamePlural(entity.name);
  }

  generateEntityTypeNamePascalCase(
    entity: Entity | ViewEntity | ShadowEntity,
  ): string {
    return generateTypeNamePascalCase(entity.name);
  }

  generateEntityTypeNamePluralPascalCase(
    entity: Entity | ViewEntity | ShadowEntity,
  ): string {
    return generateTypeNamePluralPascalCase(entity.name);
  }

  generateReverseConnectionFieldName(
    sourceEntity: Entity | ViewEntity | ShadowEntity,
    sourceAttributeName,
  ): string {
    const typeNamePlural = this.generateEntityTypeNamePlural(sourceEntity);
    return generateTypeName(`${typeNamePlural}-by-${sourceAttributeName}`);
  }

  generateReferenceFieldName(
    referenceEntity: Entity | ViewEntity | ShadowEntity,
    attribute,
  ): string {
    const fieldName = this.generateFieldName(attribute);
    return generateTypeName(`${referenceEntity.name}-by-${fieldName}`);
  }

  generateReferenceFieldListName(referenceEntity, attribute): string {
    const fieldName = this.generateFieldName(attribute);
    const referenceEntityNamePlural = this.generateEntityTypeNamePlural(
      referenceEntity,
    );
    return generateTypeName(`${referenceEntityNamePlural}-by-${fieldName}`);
  }

  generateFieldName(attribute): string {
    return generateTypeName(attribute.name);
  }

  generateI18nJsonFieldName(attribute): string {
    const fieldName = this.generateFieldName(attribute);
    return `${fieldName}_i18nJson`;
  }

  generateI18nFieldName(attribute): string {
    const fieldName = this.generateFieldName(attribute);
    return `${fieldName}_i18n`;
  }

  generateI18nFieldTypeName(entity: Entity | ViewEntity, attribute) {
    const typeName = this.generateEntityTypeName(entity);
    const fieldName = this.generateFieldName(attribute);
    return generateTypeNamePascalCase(`${typeName}-${fieldName}-i18n`);
  }

  generateListQueryTypeName(entity: Entity | ViewEntity) {
    const typeNamePlural = this.generateEntityTypeNamePlural(entity);
    return generateTypeName(`all-${typeNamePlural}`);
  }

  generateInstanceQueryTypeName(entity: Entity | ViewEntity): string {
    return this.generateEntityTypeName(entity);
  }

  generateInstanceByUniqueQueryTypeName(
    entity: Entity | ViewEntity,
    attribute,
  ): string {
    const typeName = this.generateEntityTypeName(entity);
    const fieldName = this.generateFieldName(attribute);
    return generateTypeName(`${typeName}-by-${fieldName}`);
  }

  generateUniquenessAttributesName(
    _entity: Entity | ViewEntity,
    attributes,
  ): string {
    return generateTypeName(attributes.join('-and-'));
  }

  generateUniquenessAttributesFieldName(
    _entity: Entity | ViewEntity,
    attribute,
    uniquenessAttributesName: string,
  ): string {
    const fieldName = this.generateFieldName(attribute);
    return generateTypeName(
      `${fieldName}-by-unique-${uniquenessAttributesName}`,
    );
  }

  generateInstanceUniquenessInputTypeName(
    entity: Entity | ViewEntity,
    uniquenessAttributesName,
  ): string {
    const typeName = this.generateEntityTypeName(entity);
    return generateTypeNamePascalCase(
      `${typeName}-instance-uniqueness-on-${uniquenessAttributesName}-input`,
    );
  }

  generateActionTypeName(action: Action): string {
    return generateTypeName(action.name);
  }

  generateDataInputTypeName(baseName: string): string {
    return generateTypeNamePascalCase(`${baseName}-data-input`);
  }

  generateNestedDataInputTypeName(
    baseName: string,
    nestedParamName: string,
    level: number,
  ): string {
    const levelStr = level > 1 ? `L${level}` : '';

    return generateTypeNamePascalCase(
      `${baseName}-${nestedParamName}-${levelStr}-data-input`,
    );
  }

  generateInputTypeName(baseName: string): string {
    return generateTypeNamePascalCase(`${baseName}-input`);
  }

  generateDataOutPutTypeName(baseName: string): string {
    return generateTypeNamePascalCase(`${baseName}-data-output`);
  }

  generateNestedDataOutPutTypeName(
    baseName: string,
    nestedParamName: string,
    level?: number,
  ): string {
    const levelStr = level > 1 ? `L${level}` : '';

    return generateTypeNamePascalCase(
      `${baseName}-${nestedParamName}-${levelStr}-data-output`,
    );
  }

  generateOutPutTypeName(baseName: string): string {
    return generateTypeNamePascalCase(`${baseName}-output`);
  }

  generateSortKeyName(attribute: any, ascending?: boolean): string {
    const direction = ascending ? 'ASC' : 'DESC';

    return `${generateTypeNameUpperCase(attribute.name)}_${direction}`;
  }

  generateSortInputTypeName(entity: Entity | ViewEntity): string {
    const typeName = this.generateEntityTypeName(entity);
    return generateTypeNamePascalCase(`${typeName}-order-by`);
  }

  generateFilterInputTypeName(entity: Entity | ViewEntity): string {
    const typeName = this.generateEntityTypeName(entity);
    return generateTypeNamePascalCase(`${typeName}-filter`);
  }

  generateFilterPreFilterInputTypeName(entity: Entity | ViewEntity): string {
    const typeName = this.generateEntityTypeName(entity);
    return generateTypeNamePascalCase(`${typeName}-pre-filter`);
  }

  generateFilterPreFilterParamsInputTypeName(
    entity: Entity | ViewEntity,
    preFilter,
  ): string {
    const typeName = this.generateEntityTypeName(entity);
    return generateTypeNamePascalCase(
      `${typeName}-pre-filter-${preFilter}-params`,
    );
  }

  generateConnectionEdgeTypeName(entity: Entity | ViewEntity): string {
    const typeName = this.generateEntityTypeName(entity);
    return generateTypeNamePascalCase(`${typeName}-edge`);
  }

  generateConnectionTypeName(entity: Entity | ViewEntity): string {
    const typeName = this.generateEntityTypeName(entity);
    return generateTypeNamePascalCase(`${typeName}-connection`);
  }

  generateOperationI18nAttributeInputTypeName(
    entity: Entity | any,
    operation: Mutation | Subscription | any,
    attribute,
  ): string {
    const typeName = this.generateEntityTypeName(entity);
    const fieldName = this.generateFieldName(attribute);
    return generateTypeNamePascalCase(
      `${operation.name}-${typeName}-${fieldName}-i18n-input`,
    );
  }

  generateOperationInstanceInputTypeName(
    entity: Entity,
    operation: Mutation | Subscription,
  ): string {
    const typeName = this.generateEntityTypeName(entity);
    return generateTypeNamePascalCase(
      `${operation.name}-${typeName}-instance-input`,
    );
  }

  generateOperationInputTypeName(
    entity: Entity,
    operation: Mutation | Subscription,
  ): string {
    const typeName = this.generateEntityTypeName(entity);
    return generateTypeNamePascalCase(`${operation.name}-${typeName}-input`);
  }

  generateOperationByPrimaryAttributeInputTypeName(
    entity: Entity,
    operation: Mutation | Subscription,
    attribute,
  ): string {
    const typeName = this.generateEntityTypeName(entity);
    const fieldName = this.generateFieldName(attribute);
    return generateTypeNamePascalCase(
      `${operation.name}-${typeName}-by-${fieldName}-input`,
    );
  }

  generateOperationInstanceNestedInputTypeName(
    entity: Entity,
    operation: Mutation | Subscription,
  ): string {
    const typeName = this.generateEntityTypeName(entity);
    return generateTypeNamePascalCase(
      `${operation.name}-${typeName}-instance-nested-input`,
    );
  }

  generateOperationNestedInputTypeName(
    entity: Entity,
    operation: Mutation | Subscription,
  ): string {
    const typeName = this.generateEntityTypeName(entity);
    return generateTypeNamePascalCase(
      `${operation.name}-${typeName}-nested-input`,
    );
  }

  generateOperationOutputTypeName(
    entity: Entity,
    operation: Mutation | Subscription,
  ): string {
    const typeName = this.generateEntityTypeName(entity);
    return generateTypeNamePascalCase(`${operation.name}-${typeName}-output`);
  }

  generateOperationTypeName(
    entity: Entity,
    operation: Mutation | Subscription,
  ): string {
    const typeName = this.generateEntityTypeName(entity);
    return generateTypeName(`${operation.name}-${typeName}`);
  }

  generateOperationNestedTypeName(
    entity: Entity,
    operation: Mutation | Subscription,
  ): string {
    const typeName = this.generateEntityTypeName(entity);
    return generateTypeName(`${operation.name}-${typeName}-nested`);
  }

  generateOperationByPrimaryAttributeTypeName(
    entity: Entity,
    operation: Mutation | Subscription,
    attribute,
  ): string {
    const typeName = this.generateEntityTypeName(entity);
    const fieldName = this.generateFieldName(attribute);
    return generateTypeName(`${operation.name}-${typeName}-by-${fieldName}`);
  }
}

export const isProtocolGraphQLConfiguration = (
  obj: any,
): obj is ProtocolGraphQLConfiguration => {
  return obj instanceof ProtocolGraphQLConfiguration;
};
