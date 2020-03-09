import { generateGraphQLSchema } from './generator';
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

export const generateTestSchema = async entities => {
  const testEntity = new Entity({
    name: 'FilteredEntityName',
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

  /* eslint-disable no-console */
  const TestStorage = new StorageType({
    name: 'TestStorage',
    description: 'Just some description',
    findOne(entity, id, args, context) {
      console.log('Storage findOne : ', { entity, id, args, context });
      return null;
    },
    findOneByValues(entity, arg, context) {
      console.log('Storage findOneByValues :', {
        entity,
        arg,
        context,
      });
      return null;
    },
    find(entity, args, context, parentConnection) {
      console.log('Storage find : ', {
        entity,
        args,
        context,
        parentConnection,
      });
      // exp;
      return null;
    },
    count(entity, args, context, parentConnection) {
      console.log('Storage count : ', {
        entity,
        args,
        context,
        parentConnection,
      });
    },
    mutate(entity, id, input, entityMutation, context) {
      console.log('Storage mutate : ', {
        entity,
        id,
        input,
        entityMutation,
        context,
      });
      return null;
    },
    checkLookupPermission(entity, where, context) {
      console.log('Storage checkLookupPermission : ', {
        entity,
        where,
        context,
      });
      return true;
    },
  });
  /* eslint-enable no-console */

  TestStorage.addDataTypeMap(DataTypeID, StorageDataTypeString);
  TestStorage.addDataTypeMap(DataTypeInteger, StorageDataTypeAny);
  TestStorage.addDataTypeMap(DataTypeBoolean, StorageDataTypeAny);
  TestStorage.addDataTypeMap(DataTypeString, StorageDataTypeText);

  const schema = new Schema({
    defaultStorageType: TestStorage,
    // defaultStorageType: StorageTypeMemory,
    // defaultActionPermissions: devOnlyPermission,
    // permissionsMap,
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

let configuration;

beforeAll(async () => {
  const setup = await generateTestSchema();
  configuration = setup.configuration;
});

describe('generator', () => {
  describe('test', () => {
    it('should render GraphQL Schema', () => {
      const graphqlSchema = generateGraphQLSchema(configuration);
      expect(typeof graphqlSchema).toEqual('object');
      // console.log('graphqlSchema', { graphqlSchema });
      expect(graphqlSchema).toMatchSnapshot();
    });
  });
});
