
import Sequelize from 'sequelize';

import {
  Schema,
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
} from 'shift-engine';



import { Profile } from './models/Profile';
import { Message } from './models/Message';
import { Participant } from './models/Participant';


const schema = new Schema({

  defaultStorageType: StorageTypePostgres,

  entities: [
    Profile,
    Message,
    Participant,
  ],
})


let sequelize

export const initDB = async () => {
  sequelize = new Sequelize(
    process.env.SHIFT_TEST_DB || 'shift_tests',
    process.env.PGUSER || 'postgres',
    process.env.PGPASSWORD || null, {
      host: process.env.PGHOST || 'localhost',
      port: parseInt(process.env.PGPORT || 5432, 10),
      dialect: 'postgres',
      logging: false,
      pool: {
        max: 5,
        min: 0,
        idle: 10000
      },
    }
  );


  await sequelize.authenticate()

  const modelRegistry = loadModels(sequelize, schema)

  await sequelize.sync({ force: true })

  StorageTypePostgres.setStorageInstance(sequelize)
  StorageTypePostgres.setStorageModels(modelRegistry)

  return {
    modelRegistry,
    sequelize,
  }

}


export const disconnectDB = async () => {
  sequelize.close()
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


  if (entityMutation.preProcessor) {
    args.input[typeName] = await entityMutation.preProcessor(entity, id, source, args.input[typeName], typeName, entityMutation, context)
  }

  if (entityMutation.type === MUTATION_TYPE_CREATE) {
    args.input[typeName] = fillDefaultValues(entity, entityMutation, args.input[typeName], context)
  }

  if (entityMutation.type === MUTATION_TYPE_CREATE || entityMutation.type === MUTATION_TYPE_UPDATE) {
    args.input[typeName] = fillSystemAttributesDefaultValues(entity, entityMutation, args.input[typeName], context)
  }

  validateMutationPayload(entity, entityMutation, args.input[typeName], context)

  args.input[typeName] = serializeValues(entity, entityMutation, args.input[typeName], context)

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
