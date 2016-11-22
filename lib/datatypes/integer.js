
'use strict';

const DataType = require('./data-type')


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
      'exclusiveMinimum'
    ]
  }



}


module.exports = DataTypeInteger
