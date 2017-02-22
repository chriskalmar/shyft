
import DataType from '../data-type';


class DataTypeJson extends DataType {


  constructor (name) {
    super(name || 'json', 'object', 'json')
  }


  getAcceptedJsonSchemaProperties () {
    return [
      'required',
      'schema'
    ]
  }


}


export default DataTypeJson
