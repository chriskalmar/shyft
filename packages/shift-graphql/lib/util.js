
import { constants } from 'shift-engine';
import _ from 'lodash';


// generate a type name from a model
export function generateTypeName(entityModel) {

  let name = entityModel.domain

  // if it's not the local provider use it for the node name (unique naming)
  if (constants.localProviderName !== entityModel.provider) {
    name = `${entityModel.provider}_${name}`
  }

  // add entity name
  name += `_${entityModel.name}`

  return _.camelCase(name)
}


export default {
  generateTypeName,
}
