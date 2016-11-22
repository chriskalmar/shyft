
'use strict';

const DataType = require('./data-type')


class DataTypeBoolean extends DataType {


  constructor (name) {
    super(name || 'boolean', 'boolean', 'boolean')
  }


  getAcceptedJsonSchemaProperties () {
    return []
  }


}


module.exports = DataTypeBoolean
