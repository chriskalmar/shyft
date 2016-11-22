
'use strict';

const DataType = require('../data-type')


class DataTypeTimeStamp extends DataType {


  constructor (name) {
    super(name || 'timestamp', 'string', 'timestamp')
  }


  getAcceptedJsonSchemaProperties () {
    return [
      'required'
    ]
  }


}


module.exports = DataTypeTimeStamp
