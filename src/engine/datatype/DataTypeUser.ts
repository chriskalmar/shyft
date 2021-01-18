import { DataType } from './DataType';

export class DataTypeUser extends DataType {}

export const isDataTypeUser = (obj: unknown): obj is DataTypeUser => {
  return obj instanceof DataTypeUser;
};
