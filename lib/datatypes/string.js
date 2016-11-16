
'use strict';

const DataType = require('./data-type')


class String extends DataType {

  constructor (name) {
    if (name) {
      super(name, 'text')
    }
    else {
      super('string', 'text')
    }
  }



  getJsonSchemaDefaults () {
    return {
      type: 'string'
    }
  }


  getAcceptedJsonSchemaProperties () {
    return [
      'maxLength',
      'minLength',
      'pattern',
      'format'
    ]
  }

}


module.exports = String
