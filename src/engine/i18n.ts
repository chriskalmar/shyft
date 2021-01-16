import { map } from 'lodash';
import { randomJson } from './util';
// import { Entity } from '..';

export const i18nMockGenerator = (
  entity: any,
  _: string,
  { dataShaperMap },
  languages = [],
): object => {
  if (entity) {
    const content = {};

    map(entity.getAttributes(), ({ type, i18n, mock }, attributeName) => {
      const storageAttributeName = dataShaperMap[attributeName];

      if (i18n) {
        if (Math.random() > 0.5) {
          return;
        }

        const attributeContent = (content[storageAttributeName] = {});

        languages.map((language, langIdx) => {
          if (langIdx === 0 || Math.random() > 0.5) {
            return;
          }

          attributeContent[language] = mock ? mock() : type.mock();
        });
      }
    });

    return content;
  }

  return randomJson();
};
