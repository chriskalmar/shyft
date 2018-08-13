import {
  Entity,
  Mutation,
  MUTATION_TYPE_CREATE,
  Permission,
  DataTypeString,
  DataTypeTimestampTz,
} from 'shift-engine';

import { Profile } from './Profile';
import { Board } from './Board';
import { BoardMember } from './BoardMember';

const readPermissions = [
  new Permission().role('admin'),
  new Permission().userAttribute('author'),
  new Permission()
    .lookup(BoardMember, {
      board: 'board',
      invitee: ({ userId }) => userId,
      state: () => [ 'joined', 'accepted' ],
    })
    .lookup(Board, {
      id: 'board',
      owner: ({ userId }) => userId,
    }),
];

const writePermissions = [
  new Permission().role('admin'),
  new Permission()
    .lookup(BoardMember, {
      board: ({ input }) => input.board,
      invitee: ({ userId }) => userId,
      state: () => [ 'joined', 'accepted' ],
    })
    .lookup(Board, {
      id: ({ input }) => input.board,
      owner: ({ userId }) => userId,
    }),
];

export const Message = new Entity({
  name: 'Message',
  description: 'Chat message in a board',

  includeTimeTracking: true,

  mutations: [
    new Mutation({
      name: 'write',
      description: 'write a message',
      type: MUTATION_TYPE_CREATE,
      attributes: [ 'board', 'content', 'writtenAt' ],
    }),
  ],

  permissions: {
    read: readPermissions,
    find: readPermissions,
    mutations: {
      write: writePermissions,
    },
  },

  attributes: {
    board: {
      type: Board,
      description: 'Reference to the board',
      required: true,
    },

    author: {
      type: Profile,
      description: 'The user that writes the message',
      required: true,
      defaultValue(payload, mutation, entity, { userId }) {
        return userId;
      },
    },

    content: {
      type: DataTypeString,
      description: 'Message content',
      required: true,
    },

    writtenAt: {
      type: DataTypeTimestampTz,
      description: 'Message timestamp',
      required: true,
    },
  },
});
