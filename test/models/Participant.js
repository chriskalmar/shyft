
import {
  Entity,
  Mutation,
  MUTATION_TYPE_CREATE,
  MUTATION_TYPE_UPDATE,
  Permission,
} from 'shift-engine';

import { Profile } from './Profile';
import { Group } from './Group';



export const Participant = new Entity({
  name: 'Participant',
  domain: 'test',
  description: 'Participant of a private group',

  includeTimeTracking: true,

  states: {
    invited: 10,
    accepted: 20,
    joined: 50,
  },

  mutations: [
    new Mutation({
      name: 'join',
      description: 'join an open group',
      type: MUTATION_TYPE_CREATE,
      toState: 'joined',
      attributes: [
        'group',
      ],
    }),

    new Mutation({
      name: 'invite',
      description: 'invite a user to a private group',
      type: MUTATION_TYPE_CREATE,
      toState: 'invited',
      attributes: [
        'group',
        'invitee',
      ],
    }),
    new Mutation({
      name: 'accept',
      description: 'accept an invitation to a private group',
      type: MUTATION_TYPE_UPDATE,
      fromState: 'invited',
      toState: 'accepted',
    }),
  ],


  permissions: {
    read:
      new Permission()
        .userAttribute('inviter')
        .userAttribute('invitee'),

    find:
      new Permission()
        .userAttribute('inviter')
        .userAttribute('invitee'),

    mutations: {
      create:
        new Permission()
          .role('admin'),
      update:
        new Permission()
          .role('admin'),
      delete:
        new Permission()
          .role('admin'),
    }
  },


  attributes: {

    group: {
      type: Group,
      description: 'Reference to the group',
      required: true,
    },

    inviter: {
      type: Profile,
      description: 'The user that invites to a group',
      required: true,
      defaultValue(payload, mutation, entity, { req }) {
        return req.user.id
      }
    },

    invitee: {
      type: Profile,
      description: 'The user that participates in the group',
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
