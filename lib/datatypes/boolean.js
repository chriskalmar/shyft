
'use strict';

import DataType from '../data-type';


class DataTypeBoolean extends DataType {


  constructor (name) {
    super(name || 'boolean', 'boolean', 'boolean')
  }


  getAcceptedJsonSchemaProperties () {
    return []
  }


}


export default DataTypeBoolean
