
import {
  passOrThrow,
  isArray,
} from '../util';

import DataType from './DataType';


class DataTypeEnum extends DataType {

  constructor (setup = {}) {

    const {
      name,
      description,
      values,
    } = setup

    passOrThrow(
      isArray(values, true),
      () => `'Missing enum values for data type '${name}'`
    )

    super({
      ...setup,
      description: description || `Enumeration set: ${values.join(', ')}`,
      mock() {
        const randomPos = Math.floor( Math.random() * values.length )
        return values[ randomPos ]
      }
    })

    this.values = values
  }


  toString() {
    return this.name
  }

}


export default DataTypeEnum


export const isDataTypeEnum = (obj) => {
  return (obj instanceof DataTypeEnum)
}
