
import DataTypeString from './string';


class DataTypePassword extends DataTypeString {


  constructor (name) {
    super(name || 'password')
  }


  getAcceptedJsonSchemaProperties () {
    return [
      'required',
      'maxLength',
      'minLength',
      'pattern',
      'computedValue'
    ]
  }


}


export default DataTypePassword
