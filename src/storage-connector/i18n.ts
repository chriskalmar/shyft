import StorageTypePostgres from './StorageTypePostgres';
import { CustomError } from '..';
import {
  StorageDataTypeSerializer,
  StorageDataTypeParser,
} from '../engine/storage/StorageDataType';

export const i18nDataParser: StorageDataTypeParser = (
  _,
  data,
  entity,
  { dataShaperMap },
) => {
  const i18nAttributeNames = entity.getI18nAttributeNames();

  if (!i18nAttributeNames || !data) {
    return data;
  }

  const languages = StorageTypePostgres.getStorageConfiguration()
    .getParentConfiguration()
    .getLanguages();

  i18nAttributeNames.map((attributeName) => {
    const attributeStorageName = dataShaperMap[attributeName];

    const i18nValues = data.i18n ? data.i18n[attributeStorageName] || {} : {};

    languages.map((language, langIdx) => {
      const key = `${attributeName}.i18n`;

      data[key] = data[key] || {};

      if (langIdx === 0) {
        data[key][language] = data[attributeName];
      } else {
        data[key][language] = i18nValues[language];
      }
    });
  });

  return null;
};

export const i18nDataSerializer: StorageDataTypeSerializer = (
  _,
  data,
  entity,
  mutation,
  { dataShaperMap },
): Record<string, unknown> => {
  const i18nAttributeNames = entity.getI18nAttributeNames();

  if (!i18nAttributeNames || !data) {
    return data;
  }

  const result = {};

  const languages = StorageTypePostgres.getStorageConfiguration()
    .getParentConfiguration()
    .getLanguages();

  i18nAttributeNames.map((attributeName) => {
    const key = `${attributeName}.i18n`;
    if (!data[key]) {
      return;
    }

    Object.keys(data[key]).map((language) => {
      if (!languages.includes(language)) {
        throw new CustomError(
          `Unknown language '${language}' provided in translation of mutation '${mutation.name}'`,
          'I18nError',
        );
      }
    });

    const attributeStorageName = dataShaperMap[attributeName];

    languages.map((language, langIdx) => {
      if (langIdx === 0) {
        if (typeof data[attributeName] === 'undefined') {
          if (typeof data[key][language] !== 'undefined') {
            data[attributeName] = data[key][language];
          }
        }
      } else {
        if (typeof data[key][language] !== 'undefined') {
          result[attributeStorageName] = result[attributeStorageName] || {};
          result[attributeStorageName][language] = data[key][language];
        }
      }
    });
  });

  return result;
};

export const i18nTransformFilterAttributeName = (
  context,
  entity,
  modelRegistry,
) => {
  if (!context || !entity || !modelRegistry) {
    return (attributeName) => attributeName;
  }

  const { i18nLanguage, i18nDefaultLanguage } = context;

  const attributes = entity.getAttributes();

  const { reverseDataShaperMap } = modelRegistry[entity.name];

  return (storageAttributeName) => {
    const attributeName = reverseDataShaperMap[storageAttributeName];
    const attribute = attributes[attributeName];

    if (!attribute || !attribute.i18n || i18nLanguage === i18nDefaultLanguage) {
      return storageAttributeName;
    }

    return `i18n->'${storageAttributeName}'->>'${i18nLanguage}'`;
  };
};
