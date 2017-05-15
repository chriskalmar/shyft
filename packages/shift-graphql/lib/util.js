
import _ from 'lodash';
import pluralize from 'pluralize';



export function generateTypeName(name) {
  return _.camelCase(name)
}


export function pascalCase(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}


export function plural(str) {
  return pluralize.plural(str)
}



export function generateTypeNamePascalCase(name) {
  return pascalCase(
    generateTypeName(name)
  )
}


export function generateTypeNamePlural(name) {
  return pluralize.plural(
    generateTypeName(name)
  )
}


export function generateTypeNamePluralPascalCase(name) {
  return pascalCase(
      pluralize.plural(
        generateTypeName(name)
    )
  )
}


export default {
  generateTypeName,
  pascalCase,
  plural,
  generateTypeNamePascalCase,
  generateTypeNamePlural,
  generateTypeNamePluralPascalCase,
}
