
import {
  Entity,
  Index,
  INDEX_UNIQUE,
  Permission,
} from 'shift-engine';

import { Profile } from './Profile';
import { Role } from './Role';



export const ProfileRole = new Entity({
  name: 'ProfileRole',
  domain: 'test',
  description: 'Mapping of roles and profiles',


  indexes: [
    new Index({
      type: INDEX_UNIQUE,
      attributes: [ 'profile', 'role' ],
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

    profile: {
      type: Profile,
      description: 'User profile',
      required: true,
    },

    role: {
      type: Role,
      description: 'User role',
      required: true,
    },

  }
})
