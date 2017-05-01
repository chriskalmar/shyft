
import DataType from '../data-type';


class DataTypeTime extends DataType {


  constructor (name) {
    super(name || 'time', 'string', 'time')
  }


  getAcceptedJsonSchemaProperties () {
    return [
      'required',
      'computedValue'
    ]
  }


}


export default DataTypeTime
