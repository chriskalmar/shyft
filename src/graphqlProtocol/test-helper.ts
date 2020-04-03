import { ProtocolGraphQLConfiguration } from './ProtocolGraphQLConfiguration';
import { Configuration } from '../engine/configuration/Configuration';
import {
  DataTypeBoolean,
  DataTypeID,
  DataTypeInteger,
  DataTypeString,
} from '../engine/datatype/dataTypes';
import { Entity } from '../engine/entity/Entity';
import { Schema } from '../engine/schema/Schema';
import { StorageType } from '../engine/storage/StorageType';
import { StorageDataType } from '../engine/storage/StorageDataType';
import { Action } from '..';
// import { StorageTypeMemory } from '../memory-connector/StorageTypeMemory';

// const {
//   where: permissionWhere,
//   lookupPermissionEntity,
// } = await buildActionPermissionFilter(
//   permission,
//   userId,
//   userRoles,
//   action,
//   input,
//   context
// );

type GenerateTestSchemaSetup = {
  entities?: Entity[];
  actions?: Action[];
};

export const generateTestSchema = async (
  setup: GenerateTestSchemaSetup = {},
) => {
  const { entities, actions } = setup;

  const testEntity = new Entity({
    name: 'TestEntityName',
    description: 'Just some description',
    attributes: {
      id: {
        // type: DataTypeInteger,
        type: DataTypeID,
        description: 'ID of user',
        primary: true,
      },
      firstName: {
        type: DataTypeString,
        description: 'First name',
      },
      lastName: {
        type: DataTypeString,
        description: 'Last name',
      },
      isActive: {
        type: DataTypeBoolean,
        description: 'User has been active within this month',
      },
    },
  });

  const StorageDataTypeAny = new StorageDataType({
    name: 'StorageDataTypeAny',
    description: 'Just some description',
    nativeDataType: 'text',
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    serialize() {},
    capabilities: ['lt', 'lte', 'gt', 'gte'],
  });

  const StorageDataTypeText = new StorageDataType({
    name: 'StorageDataTypeText',
    description: 'Just some description',
    nativeDataType: 'text',
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    serialize() {},
    capabilities: ['in', 'lt', 'lte', 'gt', 'gte', 'starts_with', 'ends_with'],
  });

  // const StorageDataTypeBoolean = new StorageDataType({
  //   name: 'StorageDataTypeBoolean',
  //   description: 'Data type representing a boolean value',
  //   nativeDataType: Boolean,
  //   isSortable: true,
  //   serialize: value => !!value,
  // });

  // const StorageDataTypeNumber = new StorageDataType({
  //   name: 'StorageDataTypeNumber',
  //   description: 'Data type representing a numeric value',
  //   nativeDataType: Number,
  //   isSortable: true,
  //   serialize: Number,
  // });

  const StorageDataTypeString = new StorageDataType({
    name: 'StorageDataTypeString',
    description: 'Data type representing a text value',
    nativeDataType: String,
    isSortable: true,
    serialize: String,
  });

  const TestStorage = new StorageType({
    name: 'TestStorage',
    description: 'Just some description',
    findOne(entity, id, args, context) {
      ({ entity, id, args, context }); // overcome linter warnings
      // return { resolve: () => {} };
      return {};
    },
    findOneByValues(entity, arg, context) {
      ({ entity, arg, context }); // overcome linter warnings
      return {};
    },

    find(entity, args, context, parentConnection) {
      ({ entity, args, context, parentConnection }); // overcome linter warnings
      return {
        data: [{ id: '1', something: 'something' }],
        pageInfo: {
          startCursor: null,
          endCursor: null,
          hasPreviousPage: false,
          hasNextPage: false,
        },
      };
    },
    count(entity, args, context, parentConnection) {
      ({ entity, args, context, parentConnection }); // overcome linter warnings
      return 0;
    },
    mutate(entity, id, input, entityMutation, context) {
      ({ entity, id, input, entityMutation, context }); // overcome linter warnings
      return {};
    },
    checkLookupPermission(entity, where, context) {
      ({ entity, where, context }); // overcome linter warnings
      return true;
    },
  });

  TestStorage.addDataTypeMap(DataTypeID, StorageDataTypeString);
  TestStorage.addDataTypeMap(DataTypeInteger, StorageDataTypeAny);
  TestStorage.addDataTypeMap(DataTypeBoolean, StorageDataTypeAny);
  TestStorage.addDataTypeMap(DataTypeString, StorageDataTypeText);

  const schema = new Schema({
    defaultStorageType: TestStorage,
    // defaultStorageType: StorageTypeMemory,
    defaultActionPermissions: null,
    permissionsMap: null,
    actions: actions || [],
    entities: entities ? [...entities, testEntity] : [testEntity],
  });

  const configuration = new Configuration({
    languages: ['en'],
    schema,
    protocolConfiguration: new ProtocolGraphQLConfiguration(),
  });

  // console.log('Schema', { schema });
  return { configuration, schema };
};
