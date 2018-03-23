
import StorageTypePostgres from './StorageTypePostgres';

export const i18nDataShaper = (entity, data) => {

  const i18nAttributeNames = entity.getI18nAttributeNames()

  if (!i18nAttributeNames || !data) {
    return data
  }

  const result = {
    ...data
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

      result[ key ] = result[ key ] || {}

      if (idx === 0) {
        result[ key ][ languageCode ] = data[ attributeName ]
      }
      else {
        result[ key ][ languageCode ] = i18nValues[ languageId ]
      }

    })
  })

  return result
}



export const i18nDataMapShaper = (entity, data) => {
  return data.map(row => i18nDataShaper(entity, row))
}
