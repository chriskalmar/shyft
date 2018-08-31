import DataType from './DataType';

export class DataTypeUser extends DataType {}

export const isDataTypeUser = obj => {
  return obj instanceof DataTypeUser;
};
