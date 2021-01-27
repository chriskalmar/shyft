import './setupAndTearDown';
import { testGraphql } from './db';
import { asAdmin, asUser } from './testUtils';
import { gql } from '../src/graphqlProtocol/util';

describe('i18n', () => {
  const createBookMutation = gql`
    mutation createBook($input: CreateBookInput!) {
      createBook(input: $input) {
        book {
          id
          title_i18n {
            en
            de
          }
          title_i18nJson
          shortSummary_i18n {
            en
            de
          }
          shortSummary_i18nJson
          author
          reviews {
            reviewer
            reviewText
            bookAttributes {
              attribute
              value
            }
          }
        }
      }
    }
  `;

  const updateBookMutation = gql`
    mutation updateBookById($input: UpdateBookByIdInput!) {
      updateBookById(input: $input) {
        book {
          id
          title_i18n {
            en
            de
          }
          title_i18nJson
          shortSummary_i18n {
            en
            de
          }
          shortSummary_i18nJson
          author
          reviews {
            reviewer
            reviewText
            bookAttributes {
              attribute
              value
            }
          }
        }
      }
    }
  `;

  const findBookQuery = gql`
    query allBooks($bookFilter: BookFilter) {
      allBooks(filter: $bookFilter) {
        edges {
          node {
            id
            title_i18nJson
            shortSummary_i18nJson
          }
        }
      }
    }
  `;

  it('should store translations if provided', async () => {
    const result = await testGraphql(createBookMutation, asUser(99), {
      input: {
        book: {
          title_i18n: {
            en: 'War and Peace',
            de: 'Krieg und Frieden',
          },
          author: 'Leo Tolstoy',
        },
      },
    });

    expect(result).toMatchSnapshot();
  });

  it('should reject translations of unknown languages', async () => {
    const result = await testGraphql(createBookMutation, asUser(99), {
      input: {
        book: {
          title_i18n: {
            en: 'War and Peace',
            de: 'Krieg und Frieden',
            fr: 'Guerre et Paix',
          },
          author: 'Leo Tolstoy',
        },
      },
    });

    expect(result).toMatchSnapshot();
  });

  it('should take main value form translations object if provided', async () => {
    const result = await testGraphql(createBookMutation, asUser(99), {
      input: {
        book: {
          title_i18n: {
            en: 'War and Peace',
            de: 'Krieg und Frieden',
          },
          author: 'Leo Tolstoy',
        },
      },
    });

    expect(result).toMatchSnapshot();
  });

  it('should store translations of multiple attributes', async () => {
    const result = await testGraphql(createBookMutation, asUser(99), {
      input: {
        book: {
          title_i18n: {
            en: 'War and Peace',
            de: 'Krieg und Frieden',
          },
          shortSummary_i18n: {
            en: 'The novel chronicles the history of ...',
            de: 'Krieg und Frieden ist ein historischer Roman des ...',
          },
          author: 'Leo Tolstoy',
        },
      },
    });

    expect(result).toMatchSnapshot();
  });

  it('should find items by translation', async () => {
    const result = await testGraphql(findBookQuery, asAdmin(1, 'de'), {
      bookFilter: {
        shortSummary__contains: 'ein historischer Roman',
      },
    });

    expect(result).toMatchSnapshot();
  });

  it('should merge existing translations with provided translations', async () => {
    const createResult = await testGraphql(createBookMutation, asUser(99), {
      input: {
        book: {
          title_i18n: {
            en: 'War and Peace',
            de: 'Krieg und Frieden',
          },
          author: 'Leo Tolstoy',
        },
      },
    });

    expect(createResult).toMatchSnapshot('create');

    const bookId = createResult.data.createBook.book.id;

    const updateResult = await testGraphql(updateBookMutation, asUser(99), {
      input: {
        id: bookId,
        book: {
          shortSummary_i18n: {
            de: '⚔️ & ☮️',
          },
        },
      },
    });

    expect(updateResult).toMatchSnapshot('update');
  });

  it('should merge existing translations with provided translations containing apostrophe', async () => {
    const createResult = await testGraphql(createBookMutation, asUser(99), {
      input: {
        book: {
          title_i18n: {
            en: 'War and Peace',
            de: 'Krieg und Frieden',
          },
          author: 'Leo Tolstoy',
        },
      },
    });

    expect(createResult).toMatchSnapshot('create');

    const bookId = createResult.data.createBook.book.id;

    const updateResult = await testGraphql(updateBookMutation, asUser(99), {
      input: {
        id: bookId,
        book: {
          shortSummary_i18n: {
            de: "The author's vision was awesome",
          },
        },
      },
    });

    expect(updateResult).toMatchSnapshot('update');
  });
});
