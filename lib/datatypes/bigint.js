
'use strict';

const DataType = require('./data-type')



class DataTypeBigInt extends DataType {

  constructor (name) {
    if (name) {
      super(name, 'integer', 'bigint')
    }
    else {
      super('bigint', 'integer', 'bigint')
    }
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


module.exports = DataTypeBigInt
