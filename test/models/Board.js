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
} from 'shyft';

import { Profile } from './Profile';

const readPermissions = [
  new Permission().role('admin'),
  new Permission().value('isPrivate', false),
  new Permission().userAttribute('owner'),
  new Permission().lookup(() => require('./BoardMember').BoardMember, {
    board: 'id',
    invitee: ({ userId }) => userId,
    state: () => [ 'invited', 'accepted' ],
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
      attributes: [ 'name' ],
    }),
    new Index({
      type: INDEX_GENERIC,
      attributes: [ 'isPrivate' ],
    }),
    new Index({
      type: INDEX_GENERIC,
      attributes: [ 'owner' ],
    }),
  ],

  mutations: ({ createMutation }) => [
    createMutation,
    new Mutation({
      name: 'build',
      description: 'build a new board',
      type: MUTATION_TYPE_CREATE,
      attributes: [ 'name', 'isPrivate' ],
    }),
    new Mutation({
      name: 'update',
      description: 'update a board',
      type: MUTATION_TYPE_UPDATE,
      attributes: [ 'name', 'isPrivate' ],
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

    isPrivate: {
      type: DataTypeBoolean,
      description: 'It is a private board',
    },
  },
});
