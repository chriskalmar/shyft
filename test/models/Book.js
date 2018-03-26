
import {
  Entity,
  DataTypeString,
} from 'shift-engine';


export const Book = new Entity({
  name: 'Book',
  description: 'A book',

  attributes: {

    title: {
      type: DataTypeString,
      description: 'Book title',
      required: true,
      i18n: true,
    },

    shortSummary: {
      type: DataTypeString,
      description: 'Book summary',
      i18n: true,
    },

    author: {
      type: DataTypeString,
      description: 'Author of the book',
      required: true,
    },

  }
})

