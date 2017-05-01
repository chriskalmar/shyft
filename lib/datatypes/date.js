
import DataType from '../data-type';


class DataTypeDate extends DataType {


  constructor (name) {
    super(name || 'date', 'string', 'date')
  }


  getAcceptedJsonSchemaProperties () {
    return [
      'required',
      'computedValue'
    ]
  }


}


export default DataTypeDate
