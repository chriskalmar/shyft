
import _ from 'lodash';
import pluralize from 'pluralize';
import constants from './constants';
import { CustomError } from 'shift-engine';


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


export function generateTypeNameUpperCase(name) {
  return _.snakeCase(name).toUpperCase()
}


export const toBase64 = (value) => new Buffer(value.toString()).toString('base64')
export const fromBase64 = (value) => new Buffer(value.toString(), 'base64').toString()


export const serializeCursor = (cursor) => toBase64( JSON.stringify(cursor) )
export const deserializeCursor = (cursor) => {
  try {
    return JSON.parse( fromBase64(cursor) )
  }
  catch(e) {
    // TODO: check
    // should throw error, not return
    // https://github.com/graphql/graphql-js/issues/910
    return new Error('Invalid cursor provided')
  }
}



export const addRelayTypePromoterToInstance = (typeName, instance) => {
  if (!instance) {
    return instance
  }

  instance[constants.RELAY_TYPE_PROMOTER_FIELD] = typeName
  return instance
}

export const addRelayTypePromoterToList = (typeName, list) => {
  return list.map(instance => {
    return addRelayTypePromoterToInstance(typeName, instance)
  })
}

export const addRelayTypePromoterToInstanceFn = (typeName) => {
  return (instance) => {
    return addRelayTypePromoterToInstance(typeName, instance)
  }
}

export const addRelayTypePromoterToListFn = (typeName) => {
  return (list) => {
    return addRelayTypePromoterToList(typeName, list)
  }
}



export const translateInstance = (entity, instance, { i18nLanguage, i18nLanguageDisableFallback }) => {
  if (!instance || !i18nLanguage || i18nLanguage === 'default' || !entity.getI18nAttributeNames()) {
    return instance
  }

  const attributes = entity.getAttributes()
  const i18nAttributeNames = entity.getI18nAttributeNames()

  i18nAttributeNames.map(attributeName => {

    const {
      gqlFieldName,
      gqlFieldNameI18n,
      required,
    } = attributes[ attributeName ]

    const translation = instance[ gqlFieldNameI18n ]
      ? instance[ gqlFieldNameI18n ][ i18nLanguage ]
      : undefined

    instance[ gqlFieldName ] = i18nLanguageDisableFallback
      ? translation
      : translation || instance[ gqlFieldName ]

    if (!translation && i18nLanguageDisableFallback && required) {
      instance[ gqlFieldName ] = new CustomError(`Translation for '${gqlFieldName}' not found`, 'TranslationNotFoundError')
    }
  })

  return instance
}

export const translateList = (entity, list, context) => {
  return list.map(instance => {
    return translateInstance(entity, instance, context)
  })
}

export const translateInstanceFn = (entity, context) => {
  return (instance) => {
    return translateInstance(entity, instance, context)
  }
}

export const translateListFn = (entity, context) => {
  return (list) => {
    return translateList(entity, list, context)
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
