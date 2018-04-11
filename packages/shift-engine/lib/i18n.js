
import { randomJson } from './util';
import _ from 'lodash';

export const i18nMockGenerator = (entity, name, { dataShaperMap }, languages={}) => {

  if (entity) {
    const content = {}

    _.map(entity.getAttributes(), ({ type, i18n, mock }, attributeName) => {
      const storageAttributeName = dataShaperMap[ attributeName ]

      if (i18n) {
        if (Math.random() > 0.5) {
          return
        }

        const attributeContent = content[ storageAttributeName ] = {}

        Object.values(languages).map((languageId, idx) => {
          if (idx === 0 || Math.random() > 0.5) {
            return
          }

          attributeContent[ languageId ] = mock
            ? mock()
            : type.mock()
        })
      }
    })

    return content
  }

  return randomJson()
}
