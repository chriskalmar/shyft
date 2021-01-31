import {
  Entity,
  DataTypeString,
  Index,
  INDEX_UNIQUE,
  Permission,
} from '../../src';
import { Language } from '../../src/engine/models/Language';

const readPermissions = [Permission.EVERYONE];

export const Tag = new Entity({
  name: 'Tag',
  description: 'A tag',

  indexes: [
    new Index({
      type: INDEX_UNIQUE,
      attributes: ['name', 'language'],
    }),
  ],

  permissions: {
    read: readPermissions,
    mutations: {
      create: new Permission().role('admin'),
    },
  },

  attributes: {
    name: {
      type: DataTypeString,
      description: 'Tag name',
      required: true,
    },

    language: {
      type: Language,
      description: 'Tag language',
      required: true,
    },
  },
});
