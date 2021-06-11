import {
  connectStorage,
  disconnectStorage,
  Schema,
  Configuration,
  Entity,
  generateGraphQLSchema,
  ProtocolGraphQLConfiguration,
  Context,
  ProtocolGraphQL,
} from '../src';
import { StorageTypePostgres } from '../src/storage-connector/StorageTypePostgres';
import StoragePostgresConfiguration from '../src/storage-connector/StoragePostgresConfiguration';
import { writeFileSync } from 'fs';

import { Profile } from './models/Profile';
import { Message } from './models/Message';
import { BoardMember } from './models/BoardMember';
import { Book } from './models/Book';
import { DataTypeTester } from './models/DataTypeTester';
import { BoardMemberView } from './models/BoardMemberView';
import { Connection } from 'typeorm';

import {
  ExecutionResult,
  graphql,
  GraphQLResolveInfo,
  GraphQLSchema,
  printSchema,
  Source,
} from 'graphql';

import { formatGraphQLError } from '../src/graphqlProtocol/util';

import { getMutationResolver } from '../src/graphqlProtocol/resolver';

import { Website } from './models/Website';
import { WebsiteTag } from './models/WebsiteTag';

const schema = new Schema({
  defaultStorageType: StorageTypePostgres,

  entities: [
    Profile,
    Message,
    BoardMember,
    Book,
    DataTypeTester,
    BoardMemberView,
    Website,
    WebsiteTag,
  ],
});

const languages = ['en', 'de'];

const configuration = new Configuration({
  languages,
  schema,
  protocolConfiguration: new ProtocolGraphQLConfiguration(),
});

let connection: Connection;
let graphqlSchema: GraphQLSchema;

export const initDB = async (): Promise<void> => {
  const storageConfiguration = new StoragePostgresConfiguration({
    connectionConfig: {
      host: process.env.PGHOST || 'localhost',
      port: parseInt(process.env.PGPORT || '5432', 10),
      username: process.env.PGUSER || 'postgres',
      password: process.env.PGPASSWORD || null,
      database: process.env.SHYFT_TEST_DB || 'shyft_tests',
      // logging: true,
    },
  });

  configuration.setStorageConfiguration(storageConfiguration);

  ProtocolGraphQL.setProtocolConfiguration(new ProtocolGraphQLConfiguration());

  connection = await connectStorage(configuration, true, true);
};

export const disconnectDB = async (): Promise<void> => {
  await disconnectStorage(connection);
};

export const initGraphQLSchema = (): void => {
  graphqlSchema = generateGraphQLSchema(configuration);
  writeFileSync('./schema.graphql', printSchema(graphqlSchema), 'utf8');
};

export async function testGraphql(
  query: Source | string,
  context?: unknown,
  payload?: { [key: string]: unknown },
): Promise<ExecutionResult> {
  const result = await graphql(
    graphqlSchema,
    query,
    null,
    context || {},
    payload,
  );

  if (result.errors) {
    return {
      ...result,
      errors: result.errors.map(formatGraphQLError),
    };
  }

  return result;
}

export const mutate = async (
  entity: Entity,
  mutationName: string,
  payload,
  id,
  context: Context,
) => {
  const typeName = entity.name;

  const entityMutation = entity.getMutationByName(mutationName);

  const resolver = getMutationResolver({
    entity,
    entityMutation,
    typeName,
    nested: false,
    idResolver: () => {
      return id;
    },
  });

  const result = await resolver(
    {},
    { input: { [typeName]: payload } },
    context,
    {} as GraphQLResolveInfo,
  );

  if (entityMutation.isTypeDelete) {
    return result;
  }

  return result[typeName];
};

export const findOne = async (entity, id, payload, context) => {
  return await StorageTypePostgres.findOne(entity, id, payload, context);
};

export const findOneByValue = async (entity, payload, context) => {
  return await StorageTypePostgres.findOneByValues(entity, payload, context);
};

export const find = async (entity, payload, context, parentConnection?) => {
  return await StorageTypePostgres.find(
    entity,
    payload,
    context,
    parentConnection,
  );
};

export const count = async (entity, payload, context, parentConnection?) => {
  return await StorageTypePostgres.count(
    entity,
    payload,
    context,
    parentConnection,
  );
};
