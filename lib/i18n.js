
import StorageTypePostgres from './StorageTypePostgres';
import { CustomError } from 'shift-engine';


export const i18nDataParser = (value, data, entity, { dataShaperMap }) => {

  const i18nAttributeNames = entity.getI18nAttributeNames()

  if (!i18nAttributeNames || !data) {
    return data
  }

  const languages = StorageTypePostgres
    .getStorageConfiguration()
    .getParentConfiguration()
    .getLanguages()


  const languageCodes = Object.keys(languages)

  i18nAttributeNames.map(attributeName => {

    const attributeStorageName = dataShaperMap[ attributeName ]

    const i18nValues = data.i18n
      ? data.i18n[ attributeStorageName ] || {}
      : {}

    languageCodes.map((languageCode) => {
      const languageId = languages[ languageCode ]
      const key = `${attributeName}.i18n`

      data[ key ] = data[ key ] || {}

      if (languageCode === 'default') {
        data[ key ][ languageCode ] = data[ attributeName ]
      }
      else {
        data[ key ][ languageCode ] = i18nValues[ languageId ]
      }

    })
  })

  return null
}



export const i18nDataSerializer = (value, data, entity, mutation, { dataShaperMap }) => {

  const i18nAttributeNames = entity.getI18nAttributeNames()

  if (!i18nAttributeNames || !data) {
    return data
  }

  const result = {}

  const languages = StorageTypePostgres
    .getStorageConfiguration()
    .getParentConfiguration()
    .getLanguages()

  const languageCodes = Object.keys(languages)

  i18nAttributeNames.map(attributeName => {

    const key = `${attributeName}.i18n`
    if (!data[ key ]) {
      return
    }

    Object.keys(data[ key ]).map(languageCode => {
      if (!languageCodes.includes(languageCode)) {
        throw new CustomError(`Unknown language '${languageCode}' provided in translation of mutation '${mutation.name}'`, 'I18nError')
      }
    })

    const attributeStorageName = dataShaperMap[ attributeName ]

    languageCodes.map((languageCode) => {
      const languageId = languages[ languageCode ]

      if (languageCode === 'default') {
        if (typeof data[ attributeName ] === 'undefined') {
          if (typeof data[ key ][ languageCode ] !== 'undefined') {
            data[ attributeName ] = data[ key ][ languageCode ]
          }
        }
      }
      else {
        if (typeof data[ key ][ languageCode ] !== 'undefined') {
          result[ attributeStorageName ] = result[ attributeStorageName ] || {}
          result[ attributeStorageName ][ languageId ] = data[ key ][ languageCode ]
        }
      }

    })
  })

  return result
}



export const i18nTransformFilterAttributeName = (context) => {
  if (!context) {
    return (attributeName) => attributeName
  }

  const { i18nLanguage } = context

  const languages = StorageTypePostgres
    .getStorageConfiguration()
    .getParentConfiguration()
    .getLanguages()

  return (attributeName) => {

    if (i18nLanguage === 'default') {
      return attributeName
    }

    const isoCode = languages[ i18nLanguage ]

    return `i18n->'${attributeName}'->>'${isoCode}'`
  }

}
