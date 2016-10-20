
'use strict';

const DataType = require('./data-type')


class Text extends DataType {

  constructor (name) {
    if (name) {
      super(name, 'text')
    }
    else {
      super('text', 'text')
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


module.exports = Text
