
import {
  Entity,
  DataTypeString,
  buildListDataType,
  buildObjectDataType,
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

    reviews: {
      type: buildListDataType({
        itemType: buildObjectDataType({
          attributes: {
            reviewer: {
              type: DataTypeString,
              description: 'name of the reviewer',
              required: true,
            },
            reviewText: {
              description: 'the review text',
              required: true,
              type: DataTypeString,
            },
            bookAttributes: {
              description: 'attributes of the book given by the reviewer',
              required: true,
              type: buildListDataType({
                itemType: buildObjectDataType({
                  attributes: {
                    attribute: {
                      type: DataTypeString,
                      description: 'attribute describing the book',
                      required: true,
                    },
                    value: {
                      type: DataTypeString,
                      description: 'attribute value describing the book',
                      required: true,
                    },
                  },
                }),
              }),
            },
          },
        }),
      }),
      description: 'Book reviews',
    }
  }
})

