
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
} from 'shift-engine';

import { Profile } from './Profile';
import { Board } from './Board';


const readPermissions = () => ([
  new Permission()
    .role('admin'),
  new Permission()
    .userAttribute('inviter')
    .userAttribute('invitee'),
  new Permission()
    .lookup(Board, {
      id: 'board',
      owner: ({ userId }) => userId,
    }),
  new Permission()
    .lookup(Participant, { // eslint-disable-line no-use-before-define
      board: 'board',
      invitee: ({ userId }) => userId,
    }),
])


export const Participant = new Entity({
  name: 'Participant',
  domain: 'test',
  description: 'Participant of a private board',

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

  mutations: [
    new Mutation({
      name: 'join',
      description: 'join an open board',
      type: MUTATION_TYPE_CREATE,
      toState: 'joined',
      attributes: [
        'board',
      ],
    }),

    new Mutation({
      name: 'invite',
      description: 'invite a user to a private board',
      type: MUTATION_TYPE_CREATE,
      toState: 'invited',
      attributes: [
        'board',
        'invitee',
      ],
    }),
    new Mutation({
      name: 'accept',
      description: 'accept an invitation to a private board',
      type: MUTATION_TYPE_UPDATE,
      fromState: 'invited',
      toState: 'accepted',
    }),
    new Mutation({
      name: 'remove',
      description: 'remove a user from a private board',
      type: MUTATION_TYPE_DELETE,
      fromState: [ 'joined', 'invited', 'accepted'],
    }),
    new Mutation({
      name: 'leave',
      description: 'leave a board',
      type: MUTATION_TYPE_DELETE,
      fromState: [ 'joined', 'invited', 'accepted'],
    }),
  ],


  permissions: () => ({
    read: readPermissions(),
    find: readPermissions(),
    mutations: {
      join: [
        new Permission()
          .lookup(Board, {
            id: ({ mutationData }) => mutationData.board,
            isPrivate: () => false,
          }),
      ],
      invite: [
        new Permission()
          .lookup(Board, {
            id: ({ mutationData }) => mutationData.board,
            owner: ({ userId }) => userId,
            isPrivate: () => true,
          }),
      ],
      remove: [
        new Permission()
          .lookup(Board, {
            id: 'board',
            owner: ({ userId }) => userId,
          }),
      ],
      leave: [
        new Permission()
          .userAttribute('invitee'),
      ],
      accept: [
        new Permission()
          .userAttribute('invitee'),
      ]
    }
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
      defaultValue(payload, mutation, entity, { req }) {
        return req.user.id
      }
    },

    invitee: {
      type: Profile,
      description: 'The user that participates in the board',
      required: true,
      defaultValue(payload, mutation, entity, { req }) {
        if (mutation.name === 'join') {
          return req.user.id
        }

        return null
      }
    },

  }
})
