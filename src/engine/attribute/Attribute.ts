import { ComplexDataType } from '../datatype/ComplexDataType';
import { DataType, DataTypeFunction } from '../datatype/DataType';
import { Entity } from '../entity/Entity';

export type Attribute = {
  /** name of the attribute */
  name: string;

  /** attribute description for documentation purposes */
  description: string;

  /** define data type or provide a function that returns a data type */
  type: DataType | ComplexDataType | Entity | DataTypeFunction;

  /** make attribute non-nullable on the storage level */
  required?: boolean;

  /** make this attribute the primary key on the storage level */
  primary?: boolean;

  /** enforce uniqueness on this attribute on the storage level */
  unique?: boolean;

  /** enable storage level index for faster filtering and lookups */
  index?: boolean;

  /** derives a value from the retrieved row data (attribute is not part of the storage model) */
  resolve?: (row: object) => any;

  /** default value generator for create type mutations */
  defaultValue?: () => any;

  /** custom data serializer function */
  serialize?: () => any;

  /** custom validation function */
  validate?: () => any;

  /** hide the attribute in the protocol (graphql) layer */
  hidden?: boolean;

  /** enable internationalization (extends the given storage model) */
  i18n?: boolean;

  /** a custom mock data generator */
  mock?: () => any;

  /** attribute is an input for a mutation and not part of the storage model */
  mutationInput?: boolean;

  /** place to store custom (project-related) meta data */
  meta?: any;
};

export type AttributesMap = {
  [key: string]: Attribute;
};

export type AttributesMapFunction = () => AttributesMap;

export type AttributeSetup = {};
