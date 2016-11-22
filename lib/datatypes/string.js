
'use strict';

const DataType = require('./data-type')


class DataTypeString extends DataType {

  constructor (name) {
    if (name) {
      super(name, 'string', 'text')
    }
    else {
      super('string', 'string', 'text')
    }
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
