
import {
  Entity,
  Mutation,
  MUTATION_TYPE_CREATE,
  Permission,
  DataTypeString,
} from 'shift-engine';

import { Profile } from './Profile';
import { Board } from './Board';



export const Message = new Entity({
  name: 'Message',
  domain: 'test',
  description: 'Chat message in a board',

  includeTimeTracking: true,

  mutations: [
    new Mutation({
      name: 'write',
      description: 'write a message',
      type: MUTATION_TYPE_CREATE,
      attributes: [
        'board',
        'content',
      ],
    }),
  ],


  permissions: {
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

    board: {
      type: Board,
      description: 'Reference to the board',
      required: true,
    },

    author: {
      type: Profile,
      description: 'The user that writes the message',
      required: true,
      defaultValue(payload, mutation, entity, { req }) {
        return req.user.id
      }
    },

    content: {
      type: DataTypeString,
      description: 'Message content',
      required: true,
    },

  }
})
