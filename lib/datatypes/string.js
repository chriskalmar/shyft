
import DataType from '../data-type';


class DataTypeString extends DataType {


  constructor (name) {
    super(name || 'string', 'string', 'text')
  }


  getAcceptedJsonSchemaProperties () {
    return [
      'required',
      'maxLength',
      'minLength',
      'pattern',
      'format',
      'computedValue'
    ]
  }


}


export default DataTypeString
