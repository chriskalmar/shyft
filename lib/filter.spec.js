import { createConnection } from 'typeorm';
import {
  buildWhereQuery,
  purifyFilter,
} from './filter';
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



describe('purifyFilter', () => {

  it('should clean empty filter bocks', () => {
    const filter = {
      $and: [
        {
          username: {
            $contains: 'bot',
            $startsWith: '_system_%'
          },
          language: {
            $in: [],
            $lt: 5,
            $gte: 1,
          },
          $or: [
            {
              'LookupEntity.role': 1
            },
            {
            },
            {
              accessLevel: 1
            }
          ]
        },
        {
          $and: [
            {},
            {}
          ]
        },
        {
          $or: [
            {},
            {
              $and: [
                {
                  username: 'hallo'
                }
              ]
            }
          ]
        }
      ],
      $or: [
        {
          lastname: 'smith',
          firtname: {}
        },
        {
        }
      ]
    }

    const pureFilter = purifyFilter(filter)
    expect(pureFilter).toMatchSnapshot()
  })
})


describe('filter', () => {

  describe('buildWhereQuery', () => {

    const entityNameServer = 'Server'

    it('empty filter', () => {
      const qBuilder = connection.createQueryBuilder(entityNameServer, entityNameServer)
      const filter = null
      const pureFilter = purifyFilter(filter)

      buildWhereQuery(qBuilder, pureFilter, entityNameServer)
      const query = qBuilder.getQueryAndParameters()
      expect(query).toMatchSnapshot()
    })


    it('simple properties filter', () => {
      const qBuilder = connection.createQueryBuilder(entityNameServer, entityNameServer)
      const filter = {
        ip: '127.0.0.1',
        name: 'test-server-1',
      }
      const pureFilter = purifyFilter(filter)

      buildWhereQuery(qBuilder, pureFilter, entityNameServer)
      const query = qBuilder.getQueryAndParameters()
      expect(query).toMatchSnapshot()
    })


    it('logical AND filter', () => {
      const qBuilder = connection.createQueryBuilder(entityNameServer, entityNameServer)
      const filter = {
        '$and': [
          {
            ip: '127.0.0.1',
            name: 'test-server-1',
          },
          {
            clusterZone: 4,
          }
        ]
      }
      const pureFilter = purifyFilter(filter)

      buildWhereQuery(qBuilder, pureFilter, entityNameServer)
      const query = qBuilder.getQueryAndParameters()
      expect(query).toMatchSnapshot()
    })


    it('logical OR filter', () => {
      const qBuilder = connection.createQueryBuilder(entityNameServer, entityNameServer)
      const filter = {
        '$or': [
          {
            ip: '127.0.0.1',
            name: 'test-server-1',
          },
          {
            ip: '127.0.0.1',
            name: 'test-server-2',
          }
        ]
      }
      const pureFilter = purifyFilter(filter)

      buildWhereQuery(qBuilder, pureFilter, entityNameServer)
      const query = qBuilder.getQueryAndParameters()
      expect(query).toMatchSnapshot()
    })


    it('combined logical AND/OR filter', () => {
      const qBuilder1 = connection.createQueryBuilder(entityNameServer, entityNameServer)

      const filter1 = {
        '$and': [
          {
            ip: '127.0.0.1',
            $or: [
              {
                clusterZone: 1,
              },
              {
              },
              {
                clusterZone: 7,
              }
            ]
          },
          {
            name: 'test-server-1',
          }
        ]
      }
      const pureFilter1 = purifyFilter(filter1)

      buildWhereQuery(qBuilder1, pureFilter1, entityNameServer)
      const query1 = qBuilder1.getQueryAndParameters()
      expect(query1).toMatchSnapshot()


      const qBuilder2 = connection.createQueryBuilder(entityNameServer, entityNameServer)

      const filter2 = {
        '$or': [
          {
            ip: '127.0.0.1',
            $and: [
              {
                clusterZone: 1,
              },
              {
              },
              {
                name: 'test-server-110',
              }
            ]
          },
          {
            name: 'test-server-1',
          }
        ]
      }
      const pureFilter2 = purifyFilter(filter2)

      buildWhereQuery(qBuilder2, pureFilter2, entityNameServer)
      const query2 = qBuilder2.getQueryAndParameters()
      expect(query2).toMatchSnapshot()
    })
  })

})
