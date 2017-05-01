
import DataTypeBigInt from './bigint';
import _ from 'lodash';


class DataTypeReference extends DataTypeBigInt {


  constructor (name) {
    super(name || 'reference')
  }


  getAcceptedJsonSchemaProperties () {
    return [
      'required',
      'targetAttributesMap',
      'computedValue'
    ]
  }


  getRequiredJsonSchemaProperties () {
    return _.concat(
      super.getRequiredJsonSchemaProperties(),
      'target'
    )
  }

}


export default DataTypeReference
