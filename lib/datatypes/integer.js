
import DataType from '../data-type';


class DataTypeInteger extends DataType {


  constructor (name) {
    super(name || 'integer', 'integer', 'integer')
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


export default DataTypeInteger
