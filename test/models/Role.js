
import {
  Entity,
  DataTypeString,
  Index,
  INDEX_UNIQUE,
  Permission,
} from 'shift-engine';



export const Role = new Entity({
  name: 'Role',
  domain: 'test',
  description: 'Role of a user',


  indexes: [
    new Index({
      type: INDEX_UNIQUE,
      attributes: [ 'name' ],
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

    name: {
      type: DataTypeString,
      description: 'The name of the role',
      minLength: 1,
      required: true,
    },

  }
})


