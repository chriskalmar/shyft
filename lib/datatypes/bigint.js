
import DataType from '../data-type';


class DataTypeBigInt extends DataType {


  constructor (name) {
    super(name || 'bigint', 'string', 'bigint')
  }


  getAcceptedJsonSchemaProperties () {
    return [
      'required',
      'computedValue'
    ]
  }


}


export default DataTypeBigInt
