import { createConnection } from 'typeorm';
import { buildWhereQuery, purifyFilter } from './filter';
import { StorageTypePostgres } from './StorageTypePostgres';
import { loadModels } from './generator';
import { Server } from '../test/models/Server';
import StoragePostgresConfiguration from './StoragePostgresConfiguration';
import { Schema, Configuration } from 'shyft';

let connection;
let modelRegistry;

beforeAll(async () => {
  const schema = new Schema({
    defaultStorageType: StorageTypePostgres,

    entities: [Server],
  });

  const storageConfiguration = new StoragePostgresConfiguration();

  const configuration = new Configuration({
    schema,
    storageConfiguration,
  });

  modelRegistry = loadModels(configuration);

  const entities = Object.keys(modelRegistry).map(entityName => {
    return modelRegistry[entityName].model;
  });

  connection = await createConnection({
    database: ':memory:',
    type: 'sqlite',
    entities,
  });
});

describe('filter', () => {
  describe('purifyFilter', () => {
    it('should clean empty filter blocks', () => {
      const filter = {
        $and: [
          {
            username: {
              $contains: 'bot',
              $startsWith: '_system_%',
            },
            language: {
              $in: [],
              $lt: 5,
              $gte: 1,
            },
            $or: [
              {
                'LookupEntity.role': 1,
              },
              {},
              {
                accessLevel: 1,
              },
            ],
          },
          {
            $and: [{}, {}],
          },
          {
            $or: [
              {},
              {
                $and: [
                  {
                    username: 'hallo',
                  },
                ],
              },
            ],
          },
        ],
        $or: [
          {
            lastname: 'smith',
            firstname: {},
            age: null,
          },
          {},
        ],
      };

      const pureFilter = purifyFilter(filter);
      expect(pureFilter).toMatchSnapshot();
    });
  });

  describe('buildWhereQuery', () => {
    const entityNameServer = 'Server';
    const storageTableNameServer = 'server';

    it('empty filter', () => {
      const qBuilder = connection.createQueryBuilder(
        storageTableNameServer,
        entityNameServer,
      );
      const filter = null;

      buildWhereQuery(qBuilder, filter, entityNameServer, modelRegistry);
      const query = qBuilder.getQueryAndParameters();
      expect(query).toMatchSnapshot();
    });

    it('simple properties filter', () => {
      const qBuilder = connection.createQueryBuilder(
        storageTableNameServer,
        entityNameServer,
      );
      const filter = {
        ip: '127.0.0.1',
        name: 'test-server-1',
      };

      buildWhereQuery(qBuilder, filter, entityNameServer, modelRegistry);
      const query = qBuilder.getQueryAndParameters();
      expect(query).toMatchSnapshot();
    });

    it('accept null as value', () => {
      const qBuilder = connection.createQueryBuilder(
        storageTableNameServer,
        entityNameServer,
      );
      const filter = {
        ip: '127.0.0.1',
        name: null,
        clusterZone: {
          $ne: null,
        },
      };

      buildWhereQuery(qBuilder, filter, entityNameServer, modelRegistry);
      const query = qBuilder.getQueryAndParameters();
      expect(query).toMatchSnapshot();
    });

    it('logical AND filter', () => {
      const qBuilder = connection.createQueryBuilder(
        storageTableNameServer,
        entityNameServer,
      );
      const filter = {
        $and: [
          {
            ip: '127.0.0.1',
            name: 'test-server-1',
          },
          {
            clusterZone: 4,
          },
        ],
      };

      buildWhereQuery(qBuilder, filter, entityNameServer, modelRegistry);
      const query = qBuilder.getQueryAndParameters();
      expect(query).toMatchSnapshot();
    });

    it('logical OR filter', () => {
      const qBuilder = connection.createQueryBuilder(
        storageTableNameServer,
        entityNameServer,
      );
      const filter = {
        $or: [
          {
            ip: '127.0.0.1',
            name: 'test-server-1',
          },
          {
            ip: '127.0.0.1',
            name: 'test-server-2',
          },
        ],
      };

      buildWhereQuery(qBuilder, filter, entityNameServer, modelRegistry);
      const query = qBuilder.getQueryAndParameters();
      expect(query).toMatchSnapshot();
    });

    it('combined logical AND/OR filter', () => {
      const qBuilder1 = connection.createQueryBuilder(
        storageTableNameServer,
        entityNameServer,
      );

      const filter1 = {
        $and: [
          {
            ip: '127.0.0.1',
            $or: [
              {
                clusterZone: 1,
              },
              {},
              {
                clusterZone: 7,
              },
            ],
          },
          {
            name: 'test-server-1',
          },
        ],
      };

      buildWhereQuery(qBuilder1, filter1, entityNameServer, modelRegistry);
      const query1 = qBuilder1.getQueryAndParameters();
      expect(query1).toMatchSnapshot();

      const qBuilder2 = connection.createQueryBuilder(
        storageTableNameServer,
        entityNameServer,
      );

      const filter2 = {
        $or: [
          {
            ip: '127.0.0.1',
            $and: [
              {
                clusterZone: 1,
              },
              {},
              {
                name: 'test-server-110',
              },
            ],
          },
          {
            name: 'test-server-1',
          },
        ],
      };

      buildWhereQuery(qBuilder2, filter2, entityNameServer, modelRegistry);
      const query2 = qBuilder2.getQueryAndParameters();
      expect(query2).toMatchSnapshot();
    });

    it('reject if unknown operators are used', () => {
      const qBuilder = connection.createQueryBuilder(
        storageTableNameServer,
        entityNameServer,
      );

      const filter = {
        $or: [
          {
            name: {
              $unknownOp: 123,
            },
          },
        ],
      };

      const fn = () => {
        buildWhereQuery(qBuilder, filter, entityNameServer, modelRegistry);
      };

      expect(fn).toThrowErrorMatchingSnapshot();
    });

    it('reject if AND is not provided with an array', () => {
      const qBuilder = connection.createQueryBuilder(
        storageTableNameServer,
        entityNameServer,
      );

      const filter = {
        $and: {
          name: {
            $unknownOp: 123,
          },
        },
      };

      const fn = () => {
        buildWhereQuery(qBuilder, filter, entityNameServer, modelRegistry);
      };

      expect(fn).toThrowErrorMatchingSnapshot();
    });

    it('reject if OR is not provided with an array', () => {
      const qBuilder = connection.createQueryBuilder(
        storageTableNameServer,
        entityNameServer,
      );

      const filter = {
        $or: 123,
      };

      const fn = () => {
        buildWhereQuery(qBuilder, filter, entityNameServer, modelRegistry);
      };

      expect(fn).toThrowErrorMatchingSnapshot();
    });

    it('reject if operator is used without an attribute', () => {
      const qBuilder = connection.createQueryBuilder(
        storageTableNameServer,
        entityNameServer,
      );

      const filter = {
        $and: [
          {
            $lt: 123,
          },
        ],
      };

      const fn = () => {
        buildWhereQuery(qBuilder, filter, entityNameServer, modelRegistry);
      };

      expect(fn).toThrowErrorMatchingSnapshot();
    });

    it('reject if $not operator is used without a filter', () => {
      const qBuilder = connection.createQueryBuilder(
        storageTableNameServer,
        entityNameServer,
      );

      const filter = {
        $and: [
          {
            $not: 123,
          },
        ],
      };

      const fn = () => {
        buildWhereQuery(qBuilder, filter, entityNameServer, modelRegistry);
      };

      expect(fn).toThrowErrorMatchingSnapshot();
    });

    it('treat $in operator with empty value list as mistake and return no results', () => {
      const qBuilder = connection.createQueryBuilder(
        storageTableNameServer,
        entityNameServer,
      );

      const filter = {
        $and: [
          {
            ip: {
              $in: [],
            },
          },
        ],
      };

      buildWhereQuery(qBuilder, filter, entityNameServer, modelRegistry);
      const query = qBuilder.getQueryAndParameters();
      expect(query).toMatchSnapshot();
    });

    it('treat $notIn operator with empty value list as mistake and return no results', () => {
      const qBuilder = connection.createQueryBuilder(
        storageTableNameServer,
        entityNameServer,
      );

      const filter = {
        $and: [
          {
            ip: {
              $notIn: [],
            },
          },
        ],
      };

      buildWhereQuery(qBuilder, filter, entityNameServer, modelRegistry);
      const query = qBuilder.getQueryAndParameters();
      expect(query).toMatchSnapshot();
    });

    it('complex and nested filter with various operators', () => {
      const qBuilder = connection.createQueryBuilder(
        storageTableNameServer,
        entityNameServer,
      );

      const filter = {
        $or: [
          {
            ip: {
              $in: ['127.0.0.1', '192.168.0.1'],
            },
            name: {
              $startsWith: 'test-',
            },
          },
          {},
          {
            ip: '10.0.0.1',
          },
          {
            name: {
              $contains: 'open',
              $startsWith: 'demo',
              $endsWith: 'server',
            },
            $or: [
              {
                clusterZone: {
                  $in: [6, 7],
                },
              },
              {
                clusterZone: {
                  $gt: 10,
                  $lt: 100,
                  $ne: 50,
                  $notIn: [44],
                },
              },
            ],
            $and: [
              {
                $or: [
                  {
                    clusterZone: 88,
                  },
                  {
                    clusterZone: {
                      $lte: 40,
                      $gte: 30,
                    },
                  },
                  {
                    clusterZone: {
                      $noResult: true,
                    },
                  },
                ],
              },
              {
                name: {
                  $notContains: 'open',
                  $notStartsWith: 'demo',
                  $notEndsWith: 'server',
                },
              },
            ],
          },
        ],
        $and: [
          {
            name: 'secret-server',
          },
          {},
        ],
      };

      buildWhereQuery(qBuilder, filter, entityNameServer, modelRegistry);
      const query = qBuilder.getQueryAndParameters();
      expect(query).toMatchSnapshot();
    });

    it('sub query with complex filter', () => {
      const qBuilder = connection.createQueryBuilder(
        storageTableNameServer,
        entityNameServer,
      );

      const filter = {
        $and: [
          {
            ip: {
              $in: ['127.0.0.1', '192.168.0.1'],
            },
            name: {
              $startsWith: 'test-',
            },
          },
          {
            $sub: {
              entity: 'ClusterZone',
              condition: [
                {
                  targetAttribute: 'id',
                  operator: '$eq',
                  sourceAttribute: 'clusterZone',
                },
                {
                  targetAttribute: 'ip',
                  operator: '$in',
                  value: ['127.0.0.1', '192.168.0.1'],
                },
              ],
            },
          },
        ],
      };

      buildWhereQuery(qBuilder, filter, entityNameServer, modelRegistry, false);
      const query1 = qBuilder.getQueryAndParameters();
      expect(query1).toMatchSnapshot('without isGetMany');

      buildWhereQuery(qBuilder, filter, entityNameServer, modelRegistry, true);
      const query2 = qBuilder.getQueryAndParameters();
      expect(query2).toMatchSnapshot('with isGetMany');
    });
  });
});
