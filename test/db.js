import { connectStorage, disconnectStorage } from '../src/generator';
import { StorageTypePostgres } from '../src/StorageTypePostgres';
import StoragePostgresConfiguration from '../src/StoragePostgresConfiguration';

import {
  Schema,
  Configuration,
  fillSystemAttributesDefaultValues,
  fillDefaultValues,
  serializeValues,
  validateMutationPayload,
  MUTATION_TYPE_CREATE,
  MUTATION_TYPE_UPDATE,
  MUTATION_TYPE_DELETE,
} from 'shyft';

import { Profile } from './models/Profile';
import { Message } from './models/Message';
import { BoardMember } from './models/BoardMember';
import { Book } from './models/Book';

const schema = new Schema({
  defaultStorageType: StorageTypePostgres,

  entities: [ Profile, Message, BoardMember, Book ],
});

const languages = {
  default: 1,
  de: 2,
};

const configuration = new Configuration({
  languages,
  schema,
});

export const initDB = async () => {
  const storageConfiguration = new StoragePostgresConfiguration({
    connectionConfig: {
      host: process.env.PGHOST || 'localhost',
      port: parseInt(process.env.PGPORT || 5432, 10),
      username: process.env.PGUSER || 'postgres',
      password: process.env.PGPASSWORD || null,
      database: process.env.SHYFT_TEST_DB || 'shyft_tests',
      // logging: true,
    },
  });

  configuration.setStorageConfiguration(storageConfiguration);

  await connectStorage(configuration, true);
};

export const disconnectDB = async () => {
  await disconnectStorage();
};

export const mutate = async (entity, mutationName, payload, id, context) => {
  const modelRegistry = StorageTypePostgres.getStorageModels();

  const typeName = entity.name;
  const entityMutation = entity.getMutationByName(mutationName);
  const source = {};

  const args = {
    input: {
      [typeName]: payload,
    },
  };

  if (entityMutation) {
    if (entityMutation.preProcessor) {
      args.input[typeName] = await entityMutation.preProcessor(
        entity,
        id,
        source,
        args.input[typeName],
        typeName,
        entityMutation,
        context,
      );
    }

    if (entityMutation.type === MUTATION_TYPE_CREATE) {
      args.input[typeName] = await fillDefaultValues(
        entity,
        entityMutation,
        args.input[typeName],
        context,
      );
    }

    if (
      entityMutation.type === MUTATION_TYPE_CREATE ||
      entityMutation.type === MUTATION_TYPE_UPDATE
    ) {
      args.input[typeName] = fillSystemAttributesDefaultValues(
        entity,
        entityMutation,
        args.input[typeName],
        context,
      );
    }

    validateMutationPayload(
      entity,
      entityMutation,
      args.input[typeName],
      context,
    );

    if (entityMutation.type !== MUTATION_TYPE_DELETE) {
      args.input[typeName] = serializeValues(
        entity,
        entityMutation,
        args.input[typeName],
        modelRegistry[typeName],
        context,
      );
    }
  }

  return await StorageTypePostgres.mutate(
    entity,
    id,
    args.input[typeName],
    entityMutation,
    context,
  );
};

export const findOne = async (entity, id, payload, context) => {
  return await StorageTypePostgres.findOne(entity, id, payload, context);
};

export const findOneByValue = async (entity, payload, context) => {
  return await StorageTypePostgres.findOneByValues(entity, payload, context);
};

export const find = async (entity, payload, context, parentConnection) => {
  return await StorageTypePostgres.find(
    entity,
    payload,
    context,
    parentConnection,
  );
};

export const count = async (entity, payload, context, parentConnection) => {
  return await StorageTypePostgres.count(
    entity,
    payload,
    context,
    parentConnection,
  );
};
