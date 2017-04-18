
import { constants } from 'shift-engine';
import _ from 'lodash';


// generate a type name from a model
export function generateTypeName(entityModel) {

  if (!entityModel || !_.isObject(entityModel)) {
    throw new Error('generateTypeName() entityModel needs to be defined')
  }

  if (!entityModel.name || !entityModel.domain) {
    throw new Error('generateTypeName() entityModel needs a name and a domain')
  }

  let name = entityModel.domain

  // if it's not the local provider use it for the node name (unique naming)
  if (constants.localProviderName !== entityModel.provider) {
    name = `${entityModel.provider}_${name}`
  }

  // add entity name
  name += `_${entityModel.name}`

  return _.camelCase(name)
}


export function upperCaseFirst(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}



export function generateTypeNameUpperCase(entityModel) {
  return upperCaseFirst(
    generateTypeName(entityModel)
  )
}


export default {
  generateTypeName,
  upperCaseFirst,
  generateTypeNameUpperCase,
}
