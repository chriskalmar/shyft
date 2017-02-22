
import DataTypeString from './string';


class DataTypeEmail extends DataTypeString {


  constructor (name) {
    super(name || 'email')
  }


  getAcceptedJsonSchemaProperties () {
    return [
      'required'
    ]
  }


}


export default DataTypeEmail
