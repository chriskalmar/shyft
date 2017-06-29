
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


export const toBase64 = (value) => new Buffer(value.toString()).toString('base64')
export const fromBase64 = (value) => new Buffer(value.toString(), 'base64').toString()


export const serializeCursor = (cursor) => toBase64( JSON.stringify(cursor) )
export const deserializeCursor = (cursor) => {
  try {
    return JSON.parse( fromBase64(cursor) )
  }
  catch(e) {
    throw new Error('Invalid cursor provided')
  }
}


export default {
  generateTypeName,
  pascalCase,
  plural,
  generateTypeNamePascalCase,
  generateTypeNamePlural,
  generateTypeNamePluralPascalCase,
  toBase64,
  fromBase64,
  serializeCursor,
  deserializeCursor,
}
