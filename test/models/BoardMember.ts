import {
  Entity,
  Mutation,
  MUTATION_TYPE_CREATE,
  MUTATION_TYPE_UPDATE,
  MUTATION_TYPE_DELETE,
  Permission,
  Index,
  INDEX_UNIQUE,
  INDEX_GENERIC,
} from '../../src';

import { Profile } from './Profile';
import { Board } from './Board';

const readPermissions = () => [
  new Permission().role('admin'),
  new Permission().userAttribute('inviter').userAttribute('invitee'),
  new Permission().lookup(Board, {
    id: 'board',
    owner: ({ userId }) => userId,
  }),
  // eslint-disable-next-line no-use-before-define
  new Permission().lookup(BoardMember, {
    board: 'board',
    invitee: ({ userId }) => userId,
  }),
];

export const BoardMember = new Entity({
  name: 'BoardMember',
  description: 'BoardMember of a private board',

  includeTimeTracking: true,

  indexes: [
    new Index({
      type: INDEX_UNIQUE,
      attributes: ['board', 'inviter', 'invitee'],
    }),
    new Index({
      type: INDEX_GENERIC,
      attributes: ['board', 'invitee'],
    }),
  ],

  states: {
    invited: 10,
    accepted: 20,
    joined: 50,
  },

  mutations: ({ createMutation }) => [
    createMutation,

    new Mutation({
      name: 'join',
      description: 'join an open board',
      type: MUTATION_TYPE_CREATE,
      toState: 'joined',
      attributes: ['board'],
    }),

    new Mutation({
      name: 'invite',
      description: 'invite a user to a private board',
      type: MUTATION_TYPE_CREATE,
      toState: 'invited',
      attributes: ['board', 'invitee'],
    }),
    new Mutation({
      name: 'accept',
      description: 'accept an invitation to a private board',
      type: MUTATION_TYPE_UPDATE,
      fromState: 'invited',
      toState: 'accepted',
      attributes: [],
    }),
    new Mutation({
      name: 'remove',
      description: 'remove a user from a private board',
      type: MUTATION_TYPE_DELETE,
      fromState: ['joined', 'invited', 'accepted'],
    }),
    new Mutation({
      name: 'leave',
      description: 'leave a board',
      type: MUTATION_TYPE_DELETE,
      fromState: ['joined', 'invited', 'accepted'],
    }),
  ],

  permissions: () => ({
    read: readPermissions(),
    find: readPermissions(),
    mutations: {
      join: [
        new Permission().lookup(Board, {
          id: ({ input }) => input.board,
          isPrivate: () => false,
        }),
      ],
      invite: [
        new Permission().lookup(Board, {
          id: ({ input }) => input.board,
          owner: ({ userId }) => userId,
          isPrivate: () => true,
        }),
      ],
      remove: [
        new Permission().lookup(Board, {
          id: 'board',
          owner: ({ userId }) => userId,
        }),
      ],
      leave: [new Permission().userAttribute('invitee')],
      accept: [new Permission().userAttribute('invitee')],
    },
  }),

  attributes: {
    board: {
      type: Board,
      description: 'Reference to the board',
      required: true,
    },

    inviter: {
      type: Profile,
      description: 'The user that invites to a board',
      required: true,
      defaultValue({ context: { userId } }) {
        return userId;
      },
    },

    invitee: {
      type: Profile,
      description: 'The user that participates in the board',
      required: true,
      defaultValue({ operation: mutation, context: { userId } }) {
        if (mutation.name === 'join') {
          return userId;
        }

        return null;
      },
    },
  },
});
