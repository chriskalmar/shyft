
'use strict';

const DataTypeString = require('./string')


class DataTypePassword extends DataTypeString {


  constructor (name) {
    super(name || 'password')
  }


  getAcceptedJsonSchemaProperties () {
    return [
      'required',
      'maxLength',
      'minLength',
      'pattern'
    ]
  }


}


module.exports = DataTypePassword
