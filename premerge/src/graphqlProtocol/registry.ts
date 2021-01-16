import { ViewEntity } from '..';
import { Entity } from '../engine/entity/Entity';

interface Data {
  [key: string]: unknown;
}

export interface RegistryEntityAttribute {
  fieldName: string;
  fieldNameI18n: string;
  fieldNameI18nJson: string;
}

export interface RegistryEntityAttributes {
  [key: string]: RegistryEntityAttribute;
}

export interface RegistryEntity {
  entity: Entity | ViewEntity;
  typeName: string;
  typeNamePlural: string;
  typeNamePascalCase: string;
  typeNamePluralPascalCase: string;
  attributes: RegistryEntityAttributes;
  dataShaper: (data: Data) => Data;
  dataSetShaper: (set: Data[]) => Data[];
  reverseDataShaper: (data: Data) => Data;
}

export interface Registry {
  [key: string]: RegistryEntity;
}

export const registry: Registry = {};

export const registerEntity = ({
  entity,
  typeName,
  typeNamePlural,
  typeNamePascalCase,
  typeNamePluralPascalCase,
  attributes,
  dataShaper,
  dataSetShaper,
  reverseDataShaper,
}: RegistryEntity) => {
  const entityName = entity.name;

  registry[entityName] = {
    entity,
    typeName,
    typeNamePlural,
    typeNamePascalCase,
    typeNamePluralPascalCase,
    attributes,
    dataShaper,
    dataSetShaper,
    reverseDataShaper,
  };
};

export const getRegisteredEntity = (entityName: string): RegistryEntity => {
  if (!registry[entityName]) {
    throw new Error(`Cannot find entity '${entityName}' in registry`);
  }

  return registry[entityName];
};

export const getRegisteredEntityAttribute = (
  entityName: string,
  attributeName: string,
): RegistryEntityAttribute => {
  const entity = getRegisteredEntity(entityName);

  if (!entity.attributes[attributeName]) {
    throw new Error(
      `Cannot find entity attribute '${entityName}.${attributeName}' in registry`,
    );
  }

  return entity.attributes[attributeName];
};
