import {
  Entity,
  DataTypeID,
  DataTypeInteger,
  DataTypeBigInt,
  DataTypeFloat,
  DataTypeBoolean,
  DataTypeString,
  DataTypeJson,
  DataTypeTimestamp,
  DataTypeTimestampTz,
  DataTypeDate,
  DataTypeTime,
  DataTypeTimeTz,
  DataTypeUUID,
} from 'shyft';

export const DataTypeTester = new Entity({
  name: 'DataTypeTester',
  description: 'An entity with all available data types',

  attributes: {
    typeId: {
      type: DataTypeID,
      description: 'Field of type DataTypeID',
      required: true,
    },
    typeInteger: {
      type: DataTypeInteger,
      description: 'Field of type DataTypeInteger',
      required: true,
    },
    typeBigInt: {
      type: DataTypeBigInt,
      description: 'Field of type DataTypeBigInt',
      required: true,
    },
    typeFloat: {
      type: DataTypeFloat,
      description: 'Field of type DataTypeFloat',
      required: true,
    },
    typeBoolean: {
      type: DataTypeBoolean,
      description: 'Field of type DataTypeBoolean',
      required: true,
    },
    typeString: {
      type: DataTypeString,
      description: 'Field of type DataTypeString',
      required: true,
    },
    typeJson: {
      type: DataTypeJson,
      description: 'Field of type DataTypeJson',
      required: true,
    },
    typeTimestamp: {
      type: DataTypeTimestamp,
      description: 'Field of type DataTypeTimestamp',
      required: true,
    },
    typeTimestampTz: {
      type: DataTypeTimestampTz,
      description: 'Field of type DataTypeTimestampTz',
      required: true,
    },
    typeDate: {
      type: DataTypeDate,
      description: 'Field of type DataTypeDate',
      required: true,
    },
    typeTime: {
      type: DataTypeTime,
      description: 'Field of type DataTypeTime',
      required: true,
    },
    typeTimeTz: {
      type: DataTypeTimeTz,
      description: 'Field of type DataTypeTimeTz',
      required: true,
    },
    typeUuid: {
      type: DataTypeUUID,
      description: 'Field of type DataTypeUUID',
      required: true,
    },
  },
});
