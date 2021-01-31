import { Entity, Index, INDEX_UNIQUE, Permission } from '../../src';
import { Tag } from './Tag';
import { Website } from './Website';

const readPermissions = [Permission.EVERYONE];

export const WebsiteTag = new Entity({
  name: 'WebsiteTag',
  description: 'A website / tag mapping',

  includeUserTracking: true,

  indexes: [
    new Index({
      type: INDEX_UNIQUE,
      attributes: ['tag', 'website'],
    }),
  ],

  permissions: {
    read: readPermissions,
    mutations: {
      create: new Permission().authenticated(),
    },
  },

  attributes: {
    website: {
      type: Website,
      description: 'a website',
      required: true,
    },

    tag: {
      type: Tag,
      description: 'a tag',
      required: true,
    },
  },
});
