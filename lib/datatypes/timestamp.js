
import DataType from '../data-type';


class DataTypeTimeStamp extends DataType {


  constructor (name) {
    super(name || 'timestamp', 'string', 'timestamp')
  }


  getAcceptedJsonSchemaProperties () {
    return [
      'required',
      'computedValue'
    ]
  }


}


export default DataTypeTimeStamp
