import { createConnection } from 'typeorm';
import { buildWhereQuery } from './filter';
import { StorageTypePostgres } from './StorageTypePostgres';
import { loadModels } from './generator';
import { Server } from '../test/models/Server';

import {
  Schema,
} from 'shift-engine';


let connection

beforeAll(async () => {

  const schema = new Schema({

    defaultStorageType: StorageTypePostgres,

    entities: [
      Server,
    ],
  })


  const modelRegistry = loadModels(schema)

  const entitySchemas = Object.keys(modelRegistry).map(entityName => {
    return modelRegistry[entityName].model
  })


  connection = await createConnection({
    database: ':memory:',
    type: 'sqlite',
    entitySchemas,
  });
})



describe('filter', () => {

  describe('buildWhereQuery', () => {

    const entityName = 'Server'

    it('empty filter', () => {
      const qBuilder = connection.createQueryBuilder(entityName, entityName)
      const filter = null

      buildWhereQuery(qBuilder, filter, entityName)
      const query = qBuilder.getQueryAndParameters()
      expect(query).toMatchSnapshot()
    })

  })

})
