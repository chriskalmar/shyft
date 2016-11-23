
'use strict';

const DataType = require('../data-type')


class DataTypeTimeStampTz extends DataType {


  constructor (name) {
    super(name || 'timestamptz', 'string', 'timestamptz')
  }


  getAcceptedJsonSchemaProperties () {
    return [
      'required'
    ]
  }


}


module.exports = DataTypeTimeStampTz
