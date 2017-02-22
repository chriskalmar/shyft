
import DataType from '../data-type';


class DataTypeBigInt extends DataType {


  constructor (name) {
    super(name || 'bigint', 'integer', 'bigint')
  }


  getAcceptedJsonSchemaProperties () {
    return [
      'required',
      'maximum',
      'minimum',
      'multipleOf',
      'exclusiveMaximum',
      'exclusiveMinimum'
    ]
  }


}


export default DataTypeBigInt
