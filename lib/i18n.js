
import StorageTypePostgres from './StorageTypePostgres';
import { CustomError } from 'shift-engine';


export const i18nDataParser = (value, data, entity) => {

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

    const i18nValues = data.i18n
      ? data.i18n[ attributeName ] || {}
      : {}

    languageCodes.map((languageCode, idx) => {
      const languageId = languages[ languageCode ]
      const key = `${attributeName}.i18n`

      data[ key ] = data[ key ] || {}

      if (idx === 0) {
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

    languageCodes.map((languageCode, idx) => {
      const languageId = languages[ languageCode ]

      if (idx === 0) {
        if (typeof data[ attributeName ] === 'undefined') {
          if (data[ key ][ languageCode ]) {
            data[ attributeStorageName ] = data[ key ][ languageCode ]
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

