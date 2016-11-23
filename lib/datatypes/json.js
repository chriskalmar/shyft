
'use strict';

const DataType = require('../data-type')


class DataTypeJson extends DataType {


  constructor (name) {
    super(name || 'json', 'object', 'json')
  }


  getAcceptedJsonSchemaProperties () {
    return [
      'required',
      'schema'
    ]
  }


}


module.exports = DataTypeJson
