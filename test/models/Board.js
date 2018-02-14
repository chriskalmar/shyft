
import {
  Entity,
  DataTypeString,
  DataTypeBoolean,
  Mutation,
  MUTATION_TYPE_CREATE,
  MUTATION_TYPE_UPDATE,
  Permission,
} from 'shift-engine';


import { Profile } from './Profile';



export const Board = new Entity({
  name: 'Board',
  domain: 'test',
  description: 'A chat board',

  includeUserTracking: true,
  includeTimeTracking: true,


  mutations: [
    new Mutation({
      name: 'build',
      description: 'build a new board',
      type: MUTATION_TYPE_CREATE,
      attributes: [
        'name',
        'isPrivate',
      ],
    }),
    new Mutation({
      name: 'update',
      description: 'update a board',
      type: MUTATION_TYPE_UPDATE,
      attributes: [
        'name',
        'isPrivate',
      ],
    }),
  ],


  permissions: {

    read:
      new Permission()
        .userAttribute('owner'),

    find:
      new Permission()
        .userAttribute('owner'),


    mutations: {

      build: Permission.AUTHENTICATED,

      create:
        new Permission()
          .role('admin'),

      delete:
        new Permission()
          .userAttribute('owner'),

      update:
        new Permission()
          .userAttribute('owner'),

    }
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
      defaultValue(payload, mutation, entity, { req }) {
        return req.user.id
      }
    },

    isPrivate: {
      type: DataTypeBoolean,
      description: 'It is a private board',
    },

  }
})

