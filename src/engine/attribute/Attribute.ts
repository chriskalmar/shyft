import { ComplexDataType } from '../datatype/ComplexDataType';
import { DataType, DataTypeFunction } from '../datatype/DataType';
import { Entity } from '../entity/Entity';

export type Attribute = {
  name?: string;
  description: string;
  type: DataType | ComplexDataType | Entity | DataTypeFunction;
  required?: boolean;
  primary?: boolean;
  unique?: boolean;
  index?: boolean;
  resolve?: () => any;
  defaultValue?: () => any;
  serialize?: () => any;
  validate?: () => any;
  hidden?: boolean;
  i18n?: boolean;
  mock?: () => any;
  mutationInput?: boolean;
  meta?: any;
};

export type AttributesMap = {
  [key: string]: Attribute;
};

export type AttributesMapFunction = () => AttributesMap;

export type AttributeSetup = {};
