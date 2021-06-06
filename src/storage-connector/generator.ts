import StorageTypePostgres from './StorageTypePostgres';
import * as _ from 'lodash';
import toposort from 'toposort';
import { generateIndexName } from './util';

import {
  isEntity,
  isViewEntity,
  isShadowEntity,
  INDEX_UNIQUE,
  INDEX_GENERIC,
  mapOverProperties,
  isComplexDataType,
  isConfiguration,
} from '..';

import { shaper } from 'json-shaper';

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  Index,
  ManyToOne,
  JoinColumn,
  createConnection,
  ViewEntity,
  ViewColumn,
  Connection,
} from 'typeorm';

import { isStoragePostgresConfiguration } from './StoragePostgresConfiguration';
import { PrimaryAttribute } from '../engine/attribute/Attribute';
import { Configuration } from '../engine/configuration/Configuration';

const filterOperatorMap = {
  $ne: '$ne',

  $in: '$in',
  $notIn: '$not_in',

  $lt: '$lt',
  $lte: '$lte',

  $gt: '$gt',
  $gte: '$gte',

  $startsWith: '$starts_with',
  $contains: '$contains',
  $endsWith: '$ends_with',

  $notStartsWith: '$not_starts_with',
  $notContains: '$not_contains',
  $notEndsWith: '$not_ends_with',

  $includes: '$includes',
  $notIncludes: '$not_includes',

  $isNull: '$is_null',

  $noResult: '$noResult',

  $not: '$not',
  $or: '$or',
  $and: '$and',
};

export const loadModels = (configuration) => {
  if (!isConfiguration(configuration)) {
    throw new Error('Invalid configuration object provided to loadModels()');
  }

  const schema = configuration.getSchema();
  const storageConfiguration = configuration.getStorageConfiguration();

  if (!isStoragePostgresConfiguration(storageConfiguration)) {
    throw new Error(
      'Invalid storage configuration object provided to loadModels()',
    );
  }

  StorageTypePostgres.setStorageConfiguration(storageConfiguration);

  const modelRegistry = {};

  _.map(schema.getEntities(), (entity, entityName) => {
    if (String(entity.storageType) !== String(StorageTypePostgres)) {
      return;
    }

    const attributes = {};
    const references = [];
    const dataShaperMap = {};
    const filterShaperMap = {};
    const foreignKeyIndices = [];

    function Skeleton() {
      // empty
    }

    Object.defineProperty(Skeleton, 'name', {
      value: entityName,
    });

    _.map(entity.getAttributes(), (attribute) => {
      // skip for computed values
      if (attribute.resolve) {
        return;
      }

      // skip for mutation inputs
      if (attribute.mutationInput) {
        return;
      }

      // TODO: add name to AttributeBase type
      // eslint-disable-next-line dot-notation
      const attributeName = attribute['name'];
      let storageAttributeName;

      if (attribute.meta && attribute.meta.storageAttributeName) {
        storageAttributeName = attribute.meta.storageAttributeName;
      } else if (isViewEntity(entity)) {
        // TODO: add name to AttributeBase type
        // eslint-disable-next-line dot-notation
        storageAttributeName = attribute['name'];
      } else {
        // TODO: add name to AttributeBase type
        // eslint-disable-next-line dot-notation
        storageAttributeName = _.snakeCase(attribute['name']);
      }

      dataShaperMap[attributeName] = storageAttributeName;
      filterShaperMap[attributeName] = attributeName;

      let storageDataType;

      // it's a reference
      if (isEntity(attribute.type) || isShadowEntity(attribute.type)) {
        const primaryAttribute = attribute.type.getPrimaryAttribute() as PrimaryAttribute;
        storageDataType = StorageTypePostgres.convertToStorageDataType(
          primaryAttribute.type,
        );

        const targetEntityName = attribute.type.name;

        // TODO: add targetAttributesMap to AttributeBase type
        // eslint-disable-next-line dot-notation
        if (attribute['targetAttributesMap']) {
          // TODO: check composite foreign keys support
          mapOverProperties(
            // TODO: add targetAttributesMap to AttributeBase type
            // eslint-disable-next-line dot-notation
            attribute['targetAttributesMap'],
            (targetAttribute, sourceAttributeName) => {
              references.push({
                sourceAttributeName,
                targetAttributeName: targetAttribute.name,
                targetEntityName,
              });
            },
          );
        } else {
          references.push({
            sourceAttributeName: attributeName,
            targetAttributeName: primaryAttribute.name,
            targetEntityName,
          });

          const foreignKeyIndexName = generateIndexName(
            _.snakeCase(entityName),
            [_.snakeCase(attributeName)],
            'key',
          );

          let unique = false;
          // checking if there is a defined index for the foreign key
          if (isEntity(entity) && entity.indexes) {
            const definedForeignKeyIndex = entity.indexes.filter((index) =>
              _.isEqual(index.attributes, [attributeName]),
            );
            if (definedForeignKeyIndex && definedForeignKeyIndex.length > 0) {
              unique = definedForeignKeyIndex[0].type === INDEX_UNIQUE;
            }
          }

          Index(foreignKeyIndexName, [attributeName], { unique })(Skeleton);
          foreignKeyIndices.push(foreignKeyIndexName);
        }

        ManyToOne(() => modelRegistry[targetEntityName].model, {
          onDelete: 'CASCADE',
        })(Skeleton.prototype, storageAttributeName);

        // why ts-ignore? name is not a valid key as function param
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        JoinColumn({
          name: storageAttributeName,
          cascadeAll: true,
        })(Skeleton.prototype, storageAttributeName);
      }
      // it's a regular attribute
      else {
        storageDataType = StorageTypePostgres.convertToStorageDataType(
          attribute.type,
        );
      }

      attributes[attributeName] = {
        name: storageAttributeName,
        type: storageDataType.nativeDataType,
        primary: attribute.primary,
        nullable: !attribute.required,
      };

      if (attribute.primary) {
        const primaryGenerator =
          storageDataType.name === 'StorageDataTypeUUID' ? 'uuid' : 'increment';

        // why ts-ignore? PrimaryGeneratedColumn expects 'rowid' as first param
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        PrimaryGeneratedColumn(primaryGenerator, attributes[attributeName])(
          Skeleton.prototype,
          attributeName,
        );
      } else if (isEntity(entity) || isShadowEntity(entity)) {
        Column(attributes[attributeName])(Skeleton.prototype, attributeName);
      } else if (isViewEntity(entity)) {
        ViewColumn(attributes[attributeName])(
          Skeleton.prototype,
          attributeName,
        );
      }
    });

    const constraints = {
      unique: {},
    };

    if (isEntity(entity) && entity.indexes) {
      entity.indexes.map((index) => {
        if (index.type === INDEX_UNIQUE || index.type === INDEX_GENERIC) {
          const indexAttributes = index.attributes.map(_.snakeCase);
          const indexName = generateIndexName(
            _.snakeCase(entityName),
            indexAttributes,
            'key',
          );

          const unique = index.type === INDEX_UNIQUE;
          if (!foreignKeyIndices.includes(indexName)) {
            Index(indexName, index.attributes, { unique })(Skeleton);
          }

          constraints.unique[indexName] = {
            attributes: index.attributes,
          };
        }
      });
    }

    const storageTableName = _.snakeCase(entityName);
    entity.storageTableName = storageTableName;

    if (isEntity(entity)) {
      Entity({ name: storageTableName })(Skeleton);
    } else if (isShadowEntity(entity)) {
      Entity({ name: storageTableName, synchronize: false })(Skeleton);
    } else if (isViewEntity(entity)) {
      ViewEntity({
        name: storageTableName,
        expression: entity.viewExpression,
      })(Skeleton);
    }

    modelRegistry[entityName] = {
      model: Skeleton,
      storageTableName,
      dataShaperMap,
      reverseDataShaperMap: _.invert(dataShaperMap),
      dataShaper: shaper(dataShaperMap),
      reverseDataShaper: shaper(_.invert(dataShaperMap)),
      filterShaper: shaper(_.extend(filterShaperMap, filterOperatorMap)),
      references,
      constraints,
    };
  });

  return modelRegistry;
};

export const generateMockData = async (configuration) => {
  if (!isConfiguration(configuration)) {
    throw new Error(
      'Invalid configuration object provided to generateMockData()',
    );
  }

  const schema = configuration.getSchema();
  const languages = configuration.getLanguages();
  const storageConfiguration = configuration.getStorageConfiguration();
  const storageInstance = storageConfiguration.getStorageInstance();
  const modelRegistry = storageConfiguration.getStorageModels();

  const edges = [];
  const entities = schema.getEntities();
  const mockInstancesMemory = {};

  _.map(entities, (entity) => {
    _.map(entity.getAttributes(), (attribute) => {
      if (isEntity(attribute.type)) {
        // skip cyclic dependencies
        if (entity.name === attribute.type.name) {
          return;
        }

        edges.push([attribute.type.name, entity.name]);
      }
    });
  });

  const dependencySortedEntityNames = toposort(edges);

  // add independent entities
  _.map(entities, (entity) => {
    if (dependencySortedEntityNames.indexOf(entity.name) === -1) {
      dependencySortedEntityNames.push(entity.name);
    }
  });

  for (let e = 0; e < dependencySortedEntityNames.length; e++) {
    const entityName = dependencySortedEntityNames[e];
    const entity = entities[entityName];

    if (String(entity.storageType) !== String(StorageTypePostgres)) {
      return;
    }

    try {
      const mockItemCount =
        entity.meta && entity.meta.mockItemsCount >= 0
          ? entity.meta.mockItemsCount
          : _.random(10, 100);

      for (let i = 0; i < mockItemCount; i++) {
        await generateItem(
          storageInstance,
          entity,
          mockInstancesMemory,
          modelRegistry[entityName],
          languages,
        );
      }
    } catch (err) {
      console.error(err);
    }
  }
};

const getExistingData = async (
  storageInstance,
  mockInstancesMemory,
  entity,
) => {
  const { name: entityName, storageTableName } = entity;

  const manager = storageInstance.manager;
  const result = await manager
    .createQueryBuilder(storageTableName, 't')
    .select(['t.id'])
    .getMany();

  if (result.length) {
    mockInstancesMemory[entityName] = result.map(({ id }) => id);
  } else {
    mockInstancesMemory[entityName] = [];
  }
};

async function generateItem(
  storageInstance,
  entity,
  mockInstancesMemory,
  model,
  languages,
) {
  const { name: entityName, storageTableName } = entity;
  const item = {};

  await Promise.all(
    _.map(
      entity.getAttributes(),
      async ({ type, primary, required, mock }, name) => {
        if (primary) {
          return;
        }

        if (!required) {
          if (!entity.meta || (entity.meta && !entity.meta.mockNoNulls)) {
            if (Math.random() > 0.5) {
              return;
            }
          }
        }

        if (isEntity(type)) {
          if (!mockInstancesMemory[type.name]) {
            await getExistingData(storageInstance, mockInstancesMemory, type);
          }

          item[name] = _.sample(mockInstancesMemory[type.name]);
        }
        if (isComplexDataType(type)) {
          // TODO: generate mocks based on complex types
          item[name] = {};
        } else {
          const mockDataGenerator = mock || type.mock;

          if (mockDataGenerator) {
            item[name] = mockDataGenerator(entity, name, model, languages);
          }
        }
      },
    ),
  );

  const manager = storageInstance.manager;
  let instance;

  const result = await manager
    .createQueryBuilder()
    .insert()
    .into(storageTableName)
    .values(item)
    .returning('*')
    .execute();

  if (result.raw.length) {
    instance = result.raw[0];

    const { name: primaryAttributeName } = entity.getPrimaryAttribute();

    mockInstancesMemory[entityName] = mockInstancesMemory[entityName] || [];
    mockInstancesMemory[entityName].push(instance[primaryAttributeName]);
  }
}

export const installStorageScripts = async (
  configuration: Configuration,
  synchronize = false,
): Promise<void> => {
  const storageConfiguration = configuration.getStorageConfiguration();
  const languages = configuration.getLanguages();
  const storageInstance = storageConfiguration.getStorageInstance();
  const manager = storageInstance.manager;
  const modelFeatures = {
    language: false,
    i18n: false,
    state: false,
  };
  const schema = configuration.getSchema();

  if (languages.length > 1) {
    modelFeatures.language = true;
  }

  _.forEach(schema.getEntities(), (entity) => {
    if (isEntity(entity) && entity?.getI18nAttributeNames()) {
      modelFeatures.i18n = true;
    }

    if (isEntity(entity) && entity?.hasStates()) {
      modelFeatures.state = true;
    }
  });

  if (modelFeatures.state) {
    await manager.query(
      storageConfiguration.generateGetStateIdFunction(configuration),
    );
    await manager.query(
      storageConfiguration.generateGetStateIdsFunction(configuration),
    );
    await manager.query(
      storageConfiguration.generateGetStateMapFunction(configuration),
    );
    await manager.query(
      storageConfiguration.generateGetStateNameFunction(configuration),
    );
  }

  if (modelFeatures.i18n) {
    await manager.query(
      storageConfiguration.generateGetAttributeTranslationFunction(
        configuration,
      ),
    );
    await manager.query(
      storageConfiguration.generateGetAttributeTranslationsFunction(
        configuration,
      ),
    );
    await manager.query(
      storageConfiguration.generateMergeTranslationsFunction(configuration),
    );

    if (synchronize) {
      await manager.query(
        storageConfiguration.createI18nIndices(configuration),
      );
    }
  }
};

export type OnConnectionHandler = (connection: Connection) => void;

export const connectStorage = async (
  configuration: Configuration,
  synchronize = false,
  dropSchema = false,
  onConnect?: OnConnectionHandler,
): Promise<Connection> => {
  const storageConfiguration = configuration.getStorageConfiguration();
  const connectionConfig = storageConfiguration.getConnectionConfig();

  const modelRegistry = loadModels(configuration);

  const entities = Object.keys(modelRegistry).map((entityName) => {
    return modelRegistry[entityName].model;
  });

  const connection: Connection = await createConnection({
    ...connectionConfig,
    type: 'postgres',
    synchronize,
    dropSchema,
    entities,
  });

  if (onConnect) {
    onConnect(connection);
  }

  storageConfiguration.setStorageInstance(connection);
  storageConfiguration.setStorageModels(modelRegistry);

  // remember logger settings and disable logger
  // @ts-expect-error untyped property
  const loggerOptions = connection.logger.options;
  // @ts-expect-error untyped property
  connection.logger.options = false;

  await installStorageScripts(configuration, synchronize);

  // bring back logger options
  // @ts-expect-error untyped property
  connection.logger.options = loggerOptions;

  return connection;
};

export const disconnectStorage = async (
  connection: Connection,
): Promise<void> => {
  if (connection) {
    await connection.close();
  }
};
