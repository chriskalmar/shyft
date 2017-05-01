
import DataType from '../data-type';


class DataTypeBigInt extends DataType {


  constructor (name) {
    super(name || 'bigint', 'string', 'bigint')
  }


  getAcceptedJsonSchemaProperties () {
    return [
      'required'
    ]
  }


}


export default DataTypeBigInt
