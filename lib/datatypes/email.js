
'use strict';

const DataTypeString = require('./string')


class DataTypeEmail extends DataTypeString {


  constructor (name) {
    super(name || 'email')
  }


  getAcceptedJsonSchemaProperties () {
    return [
      'required'
    ]
  }


}


module.exports = DataTypeEmail
