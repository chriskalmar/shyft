
'use strict';

const DataType = require('./data-type')


class DataTypeTimeTz extends DataType {


  constructor (name) {
    super(name || 'timetz', 'string', 'timetz')
  }


  getAcceptedJsonSchemaProperties () {
    return [
      'required'
    ]
  }


}


module.exports = DataTypeTimeTz
