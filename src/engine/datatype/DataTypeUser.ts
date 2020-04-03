import { DataType } from './DataType';

export class DataTypeUser extends DataType {}

export const isDataTypeUser = (obj: any): boolean => {
  return obj instanceof DataTypeUser;
};
