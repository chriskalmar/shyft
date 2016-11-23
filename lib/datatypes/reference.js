
'use strict';

const DataTypeBigInt = require('./bigint')
const _ = require('lodash');


class DataTypeReference extends DataTypeBigInt {


  constructor (name) {
    super(name || 'reference')
  }


  getAcceptedJsonSchemaProperties () {
    return [
      'required',
      'targetAttributesMap'
    ]
  }


  getRequiredJsonSchemaProperties () {
    return _.concat(
      super.getRequiredJsonSchemaProperties(),
      'target'
    )
  }

}


module.exports = DataTypeReference
