
'use strict';

const DataType = require('../data-type')


class DataTypeDate extends DataType {


  constructor (name) {
    super(name || 'date', 'string', 'date')
  }


  getAcceptedJsonSchemaProperties () {
    return [
      'required'
    ]
  }


}


module.exports = DataTypeDate
