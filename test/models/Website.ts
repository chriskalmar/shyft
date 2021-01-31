import { invert } from 'lodash';
import {
  Entity,
  DataTypeString,
  Index,
  INDEX_UNIQUE,
  Mutation,
  MUTATION_TYPE_CREATE,
  Permission,
  DataTypeInteger,
  DataTypeEnum,
  DataTypeBoolean,
  MUTATION_TYPE_UPDATE,
} from '../../src';
import { findOne } from '../db';
import { asUser } from '../testUtils';

export const categoryTypes = {
  NEWS: 10,
  CODING: 20,
  ENTERTAINMENT: 30,
  TUTORIALS: 40,
  MISC: 50,
};

export const categoryTypesInverted = invert(categoryTypes);

export const categoryTypesEnum = new DataTypeEnum({
  name: 'CategoryType',
  values: categoryTypes,
});

const readPermissions = [
  new Permission().role('admin'),
  new Permission().userAttribute('createdBy'),
];

export const Website = new Entity({
  name: 'Website',
  description: 'A website',

  includeUserTracking: true,

  indexes: [
    new Index({
      type: INDEX_UNIQUE,
      attributes: ['url'],
    }),
  ],

  mutations: [
    new Mutation({
      name: 'save',
      description: 'save a new website',
      type: MUTATION_TYPE_CREATE,
      attributes: ['url', 'category'],
      preProcessor({ input }) {
        const url = input.url as string;
        const category = input.category as string;
        const lucky = url === "I'm feeling lucky!";

        if (lucky) {
          return {
            url: 'http://a.random.unsecured.news.website.com',
            category: categoryTypes.NEWS,
          };
        }
        return {
          url,
          ...(category && { category }),
        };
      },
    }),
    new Mutation({
      name: 'visit',
      description: 'visit a website and increase counter',
      type: MUTATION_TYPE_UPDATE,
      attributes: [],
      async preProcessor({ id, context: { userId } }) {
        const result = await findOne(Website, id, {}, asUser(userId));
        return {
          visitCount: result.visitCount + 1,
        };
      },
    }),
  ],

  permissions: {
    read: readPermissions,
    find: readPermissions,
    mutations: {
      save: Permission.EVERYONE,
    },
  },

  attributes: {
    url: {
      type: DataTypeString,
      description: 'Website URL',
      required: true,
      validate: ({ value }) => {
        const url = value as string;

        if (!url.startsWith('http://') && !url.startsWith('https://')) {
          throw new Error('Unknown protocol, should be http:// or https://');
        }
      },
    },

    visitCount: {
      type: DataTypeInteger,
      description: 'Number of times this website was visited',
      required: true,
      defaultValue() {
        return 0;
      },
    },

    category: {
      type: categoryTypesEnum,
      description: 'Category of website',
      required: true,
      defaultValue() {
        return categoryTypes.MISC;
      },
    },

    isSecure: {
      type: DataTypeBoolean,
      description: 'Is it using a secure protocol?',
      resolve: ({ obj }) => {
        const url = obj.url as string;
        return url.startsWith('https://');
      },
    },
  },
});
