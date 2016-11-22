
'use strict';

const DataType = require('../data-type')


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
      'format'
    ]
  }


}


module.exports = DataTypeString
