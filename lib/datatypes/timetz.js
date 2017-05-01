
import DataType from '../data-type';


class DataTypeTimeTz extends DataType {


  constructor (name) {
    super(name || 'timetz', 'string', 'timetz')
  }


  getAcceptedJsonSchemaProperties () {
    return [
      'required',
      'computedValue'
    ]
  }


}


export default DataTypeTimeTz
