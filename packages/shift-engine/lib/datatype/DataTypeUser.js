
import DataType from './DataType';


export default class DataTypeUser extends DataType {}

export const isDataTypeUser = (obj) => {
  return (obj instanceof DataTypeUser)
}
