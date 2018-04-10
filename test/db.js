

import { createConnection } from 'typeorm';


import {
  Schema,
  Configuration,
  StorageConfiguration,
} from 'shift-engine';

import { loadModels } from '../lib/generator';
import { StorageTypePostgres } from '../lib/StorageTypePostgres';

import {
  fillSystemAttributesDefaultValues,
  fillDefaultValues,
  serializeValues,
  validateMutationPayload,
  MUTATION_TYPE_CREATE,
  MUTATION_TYPE_UPDATE,
  MUTATION_TYPE_DELETE,
} from 'shift-engine';



import { Profile } from './models/Profile';
import { Message } from './models/Message';
import { Participant } from './models/Participant';
import { Book } from './models/Book';


const schema = new Schema({

  defaultStorageType: StorageTypePostgres,

  entities: [
    Profile,
    Message,
    Participant,
    Book,
  ],
})


const languages = {
  default: 1,
  de: 2,
}


const storageConfiguration = new StorageConfiguration()

const configuration = new Configuration({
  languages,
  schema,
  storageConfiguration,
})


let connection

export const initDB = async () => {

  const modelRegistry = loadModels(configuration)

  const entities = Object.keys(modelRegistry).map(entityName => {
    return modelRegistry[entityName].model
  })


  connection = await createConnection({
    type: 'postgres',
    host: process.env.PGHOST || 'localhost',
    port: parseInt(process.env.PGPORT || 5432, 10),
    username: process.env.PGUSER || 'postgres',
    password: process.env.PGPASSWORD || null,
    database: process.env.SHIFT_TEST_DB || 'shift_tests',
    // logging: true,
    synchronize: true,
    dropSchema: true,
    entities
  })

  storageConfiguration.setStorageInstance(connection)
  storageConfiguration.setStorageModels(modelRegistry)
}


export const disconnectDB = async () => {
  connection.close()
}



export const mutate = async (entity, mutationName, payload, id, context) => {

  const typeName = entity.name
  const entityMutation = entity.getMutationByName(mutationName)
  const source = {}

  const args = {
    input: {
      [typeName]: payload
    }
  }


  if (entityMutation) {
    if (entityMutation.preProcessor) {
      args.input[typeName] = await entityMutation.preProcessor(entity, id, source, args.input[typeName], typeName, entityMutation, context)
    }

    if (entityMutation.type === MUTATION_TYPE_CREATE) {
      args.input[typeName] = await fillDefaultValues(entity, entityMutation, args.input[typeName], context)
    }

    if (entityMutation.type === MUTATION_TYPE_CREATE || entityMutation.type === MUTATION_TYPE_UPDATE) {
      args.input[typeName] = fillSystemAttributesDefaultValues(entity, entityMutation, args.input[typeName], context)
    }

    validateMutationPayload(entity, entityMutation, args.input[typeName], context)

    if (entityMutation.type !== MUTATION_TYPE_DELETE) {
      args.input[typeName] = serializeValues(entity, entityMutation, args.input[typeName], context)
    }
  }

  return await StorageTypePostgres.mutate(entity, id, args.input[typeName], entityMutation, context)
}


export const findOne = async (entity, id, payload, context) => {
  return await StorageTypePostgres.findOne(entity, id, payload, context)
}


export const findOneByValue = async (entity, payload, context) => {
  return await StorageTypePostgres.findOneByValues(entity, payload, context)
}


export const find = async (entity, payload, context, parentConnection) => {
  return await StorageTypePostgres.find(entity, payload, context, parentConnection)
}


export const count = async (entity, payload, context, parentConnection) => {
  return await StorageTypePostgres.count(entity, payload, context, parentConnection)
}
