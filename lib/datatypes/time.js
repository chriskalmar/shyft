
'use strict';

const DataType = require('./data-type')


class DataTypeTime extends DataType {


  constructor (name) {
    super(name || 'time', 'string', 'time')
  }


  getAcceptedJsonSchemaProperties () {
    return [
      'required'
    ]
  }


}


module.exports = DataTypeTime
