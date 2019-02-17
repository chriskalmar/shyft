import StorageTypePostgres from './StorageTypePostgres';
import _ from 'lodash';
import toposort from 'toposort';
import { generateIndexName } from './util';

import {
  isEntity,
  INDEX_UNIQUE,
  INDEX_GENERIC,
  mapOverProperties,
  isComplexDataType,
  isConfiguration,
} from 'shyft';

import { shaper } from 'json-shaper';

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  Index,
  ManyToOne,
  JoinColumn,
  createConnection,
} from 'typeorm';

import { isStoragePostgresConfiguration } from './StoragePostgresConfiguration';

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

  $noResult: '$noResult',

  $not: '$not',
  $or: '$or',
  $and: '$and',
};

export const loadModels = configuration => {
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

    const Skeleton = () => {};

    Object.defineProperty(Skeleton, 'name', {
      value: entityName,
    });

    _.map(entity.getAttributes(), attribute => {
      // skip for computed values
      if (attribute.resolve) {
        return;
      }

      // skip for mutation inputs
      if (attribute.mutationInput) {
        return;
      }

      const attributeName = attribute.name;
      const storageAttributeName =
        attribute.meta && attribute.meta.storageAttributeName
          ? attribute.meta.storageAttributeName
          : _.snakeCase(attribute.name);

      dataShaperMap[attributeName] = storageAttributeName;
      filterShaperMap[attributeName] = attributeName;

      let storageDataType;

      // it's a reference
      if (isEntity(attribute.type)) {
        const primaryAttribute = attribute.type.getPrimaryAttribute();
        storageDataType = StorageTypePostgres.convertToStorageDataType(
          primaryAttribute.type,
        );

        const targetEntityName = attribute.type.name;

        if (attribute.targetAttributesMap) {
          // sequelize doesn't support composite foreign keys yet (so this has no impact):
          // https://github.com/sequelize/sequelize/issues/311
          mapOverProperties(
            attribute.targetAttributesMap,
            (targetAttribute, sourceAttributeName) => {
              references.push({
                sourceAttributeName,
                targetAttributeName: targetAttribute.name,
                targetEntityName,
              });
            },
          );
        }
        else {
          references.push({
            sourceAttributeName: attributeName,
            targetAttributeName: primaryAttribute.name,
            targetEntityName,
          });
        }

        ManyToOne(() => modelRegistry[targetEntityName].model, {
          onDelete: 'CASCADE',
        })(Skeleton.prototype, storageAttributeName);

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

        PrimaryGeneratedColumn(primaryGenerator, attributes[attributeName])(
          Skeleton.prototype,
          attributeName,
        );
      }
      else {
        Column(attributes[attributeName])(Skeleton.prototype, attributeName);
      }
    });

    const constraints = {
      unique: {},
    };

    if (entity.indexes) {
      entity.indexes.map(index => {
        if (index.type === INDEX_UNIQUE || index.type === INDEX_GENERIC) {
          const indexAttributes = index.attributes.map(_.snakeCase);
          const indexName = generateIndexName(
            _.snakeCase(entityName),
            indexAttributes,
            'key',
          );

          const unique = index.type === INDEX_UNIQUE;
          Index(indexName, index.attributes, { unique })(Skeleton);

          constraints.unique[indexName] = {
            attributes: index.attributes,
          };
        }
      });
    }

    const storageTableName = _.snakeCase(entityName);
    entity.storageTableName = storageTableName;

    Entity({ name: storageTableName })(Skeleton);

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

export const generateMockData = async configuration => {
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

  _.map(entities, entity => {
    _.map(entity.getAttributes(), attribute => {
      if (isEntity(attribute.type)) {
        // skip cyclic dependencies
        if (entity.name === attribute.type.name) {
          return;
        }

        edges.push([ attribute.type.name, entity.name ]);
      }
    });
  });

  const dependencySortedEntityNames = toposort(edges);

  // add independent entities
  _.map(entities, entity => {
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
    }
    catch (err) {
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
    .select([ 't.id' ])
    .getMany();

  if (result.length) {
    mockInstancesMemory[entityName] = result.map(({ id }) => id);
  }
  else {
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
        }
        else {
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
  configuration,
  synchronize = false,
) => {
  const storageConfiguration = configuration.getStorageConfiguration();
  const languages = configuration.getLanguages();
  const storageInstance = storageConfiguration.getStorageInstance();
  const manager = storageInstance.manager;
  const modelFeatures = {};
  const schema = configuration.getSchema();

  if (languages.length > 1) {
    modelFeatures.language = true;
  }

  _.forEach(schema.getEntities(), entity => {
    if (entity.getI18nAttributeNames()) {
      modelFeatures.i18n = true;
    }

    if (entity.hasStates()) {
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
        storageConfiguration.createI18nIndices(configuration, manager),
      );
    }
  }
};

let connection;

export const connectStorage = async (configuration, synchronize = false) => {
  const storageConfiguration = configuration.getStorageConfiguration();
  const connectionConfig = storageConfiguration.getConnectionConfig();

  const modelRegistry = loadModels(configuration);

  const entities = Object.keys(modelRegistry).map(entityName => {
    return modelRegistry[entityName].model;
  });

  connection = await createConnection({
    ...connectionConfig,
    type: 'postgres',
    synchronize,
    dropSchema: synchronize,
    entities,
  });

  storageConfiguration.setStorageInstance(connection);
  storageConfiguration.setStorageModels(modelRegistry);

  // remember logger settings and disable logger
  const loggerOptions = connection.logger.options;
  connection.logger.options = false;

  await installStorageScripts(configuration, synchronize);

  // bring back logger options
  connection.logger.options = loggerOptions;
};

export const disconnectStorage = async () => {
  await connection.close();
};

export const getConnection = () => connection;
