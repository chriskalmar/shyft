import {
  Entity,
  DataTypeString,
  DataTypeBoolean,
  Mutation,
  MUTATION_TYPE_CREATE,
  MUTATION_TYPE_UPDATE,
  Permission,
  Index,
  INDEX_UNIQUE,
  INDEX_GENERIC,
  buildObjectDataType,
  buildListDataType,
  DataTypeJson,
} from '../../src';

import { Profile } from './Profile';

const readPermissions = [
  new Permission().role('admin'),
  new Permission().value('isPrivate', false),
  new Permission().userAttribute('owner'),
  new Permission().lookup(() => require('./BoardMember').BoardMember, {
    board: 'id',
    invitee: ({ userId }) => userId,
    state: () => ['invited', 'accepted'],
  }),
];

export const Board = new Entity({
  name: 'Board',
  description: 'A chat board',

  includeUserTracking: true,
  includeTimeTracking: true,

  indexes: [
    new Index({
      type: INDEX_UNIQUE,
      attributes: ['name'],
    }),
    new Index({
      type: INDEX_GENERIC,
      attributes: ['isPrivate'],
    }),
    new Index({
      type: INDEX_GENERIC,
      attributes: ['owner'],
    }),
    new Index({
      type: INDEX_UNIQUE,
      attributes: ['vip'],
    }),
  ],

  mutations: ({ createMutation }) => [
    createMutation,
    new Mutation({
      name: 'build',
      description: 'build a new board',
      type: MUTATION_TYPE_CREATE,
      attributes: ['name', 'isPrivate', 'vip'],
    }),
    new Mutation({
      name: 'update',
      description: 'update a board',
      type: MUTATION_TYPE_UPDATE,
      attributes: ['name', 'isPrivate', 'vip'],
    }),
  ],

  permissions: {
    read: readPermissions,
    find: readPermissions,
    mutations: {
      build: Permission.AUTHENTICATED,
    },
  },

  attributes: {
    name: {
      type: DataTypeString,
      description: 'Name of the board',
      required: true,
    },

    owner: {
      type: Profile,
      description: 'Owner of the board',
      required: true,
      defaultValue(payload, mutation, entity, { userId }) {
        return userId;
      },
    },

    vip: {
      type: Profile,
      description: 'VIP guest of the board',
      required: true,
    },

    isPrivate: {
      type: DataTypeBoolean,
      description: 'It is a private board',
    },

    metaData: {
      type: buildObjectDataType({
        attributes: {
          description: {
            type: DataTypeString,
            description: 'Board description',
          },
          externalLinks: {
            type: DataTypeJson,
            description: 'External links',
          },
        },
      }),
      description: 'Meta data',
    },

    mods: {
      type: buildListDataType({
        itemType: DataTypeString,
      }),
      description: 'List of moderators',
    },
  },
});
