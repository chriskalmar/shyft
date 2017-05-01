
import DataType from '../data-type';


class DataTypeTimeStampTz extends DataType {


  constructor (name) {
    super(name || 'timestamptz', 'string', 'timestamptz')
  }


  getAcceptedJsonSchemaProperties () {
    return [
      'required',
      'computedValue'
    ]
  }


}


export default DataTypeTimeStampTz
