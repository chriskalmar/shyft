
import DataType from '../data-type';


class DataTypeFloat extends DataType {


  constructor (name) {
    super(name || 'float', 'number', 'numeric')
  }


  getAcceptedJsonSchemaProperties () {
    return [
      'required',
      'maximum',
      'minimum',
      'multipleOf',
      'exclusiveMaximum',
      'exclusiveMinimum',
      'computedValue'
    ]
  }



}


export default DataTypeFloat
