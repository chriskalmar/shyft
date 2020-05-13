import './setupAndTearDown';
import { mutate, find } from './db';

import { asAdmin, removeId } from './testUtils';

import { Book } from './models/Book';

const orderByIdAsc = {
  orderBy: [
    {
      attribute: 'id',
      direction: 'ASC',
    },
  ],
};

describe('i18n', () => {
  it('should store translations if provided', async () => {
    const payload = {
      title: 'War and Peace',
      'title.i18n': {
        de: 'Krieg und Frieden',
      },
      author: 'Leo Tolstoy',
    };

    const result = await mutate(Book, 'create', payload, null, asAdmin());
    expect(removeId(result)).toMatchSnapshot();
  });

  it('should reject translations of unknown languages', async () => {
    const payload = {
      title: 'War and Peace',
      'title.i18n': {
        de: 'Krieg und Frieden',
        fr: 'Guerre et Paix',
      },
      author: 'Leo Tolstoy',
    };

    await mutate(Book, 'create', payload, null, asAdmin()).catch((e) => {
      expect(e).toMatchSnapshot();
    });
  });

  it('should take main value form translations object if provided', async () => {
    const payload = {
      'title.i18n': {
        en: 'War and Peace',
        de: 'Krieg und Frieden',
      },
      author: 'Leo Tolstoy',
    };

    const result = await mutate(Book, 'create', payload, null, asAdmin());
    expect(removeId(result)).toMatchSnapshot();
  });

  it('should store translations of multiple attributes', async () => {
    const payload = {
      'title.i18n': {
        en: 'War and Peace',
        de: 'Krieg und Frieden',
      },
      shortSummary: 'The novel chronicles the history of ...',
      'shortSummary.i18n': {
        de: 'Krieg und Frieden ist ein historischer Roman des ...',
      },
      author: 'Leo Tolstoy',
    };

    const result = await mutate(Book, 'create', payload, null, asAdmin());
    expect(removeId(result)).toMatchSnapshot();
  });

  it('should find items by translation', async () => {
    const filter = {
      shortSummary: {
        $contains: 'ein historischer Roman',
      },
    };

    const result = await find(
      Book,
      { ...orderByIdAsc, filter },
      asAdmin(1, 'de'),
    );
    expect(removeId(result)).toMatchSnapshot();
  });

  it('should merge existing translations with provided translations', async () => {
    let payload = {
      'title.i18n': {
        en: 'War and Peace',
        de: 'Krieg und Frieden',
      },
      author: 'Leo Tolstoy',
    };

    let result = await mutate(Book, 'create', payload, null, asAdmin());
    const { id } = result;

    payload = {
      'shortSummary.i18n': {
        de: '⚔️ & ☮️',
      },
    };

    result = await mutate(Book, 'update', payload, id, asAdmin());
    expect(removeId(result)).toMatchSnapshot();
  });

  it('should merge existing translations with provided translations containing apostrophe', async () => {
    let payload = {
      'title.i18n': {
        en: 'War and Peace',
        de: 'Krieg und Frieden',
      },
      author: 'Leo Tolstoy',
    };

    let result = await mutate(Book, 'create', payload, null, asAdmin());
    const { id } = result;

    payload = {
      'shortSummary.i18n': {
        de: "The author's vision was awesome",
      },
    };

    result = await mutate(Book, 'update', payload, id, asAdmin());
    expect(removeId(result)).toMatchSnapshot();
  });
});
