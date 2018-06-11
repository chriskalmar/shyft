import './setupAndTearDown';
import {
  mutate,
  find,
} from './db';

import {
  asAdmin,
} from './testUtils';

import { Book } from './models/Book';


const orderByIdAsc = {
  orderBy: [ {
    attribute: 'id',
    direction: 'ASC'
  } ]
}

describe('i18n', () => {

  it('should store translations if provided', async () => {

    const payload = {
      title: 'War and Peace',
      'title.i18n': {
        de: 'Krieg und Frieden'
      },
      author: 'Leo Tolstoy',
    }

    const result = await mutate(Book, 'create', payload, null, asAdmin())
    expect(result).toMatchSnapshot()
  })


  it('should reject translations of unknown languages', async () => {

    const payload = {
      title: 'War and Peace',
      'title.i18n': {
        de: 'Krieg und Frieden',
        fr: 'Guerre et Paix',
      },
      author: 'Leo Tolstoy',
    }

    await mutate(Book, 'create', payload, null, asAdmin())
      .catch(e => {
        expect(e).toMatchSnapshot()
      })
  })


  it('should take main value form translations object if provided', async () => {

    const payload = {
      'title.i18n': {
        default: 'War and Peace',
        de: 'Krieg und Frieden',
      },
      author: 'Leo Tolstoy',
    }

    const result = await mutate(Book, 'create', payload, null, asAdmin())
    expect(result).toMatchSnapshot()
  })


  it('should store translations of multiple attributes', async () => {

    const payload = {
      'title.i18n': {
        default: 'War and Peace',
        de: 'Krieg und Frieden',
      },
      shortSummary: 'The novel chronicles the history of ...',
      'shortSummary.i18n': {
        de: 'Krieg und Frieden ist ein historischer Roman des ...',
      },
      author: 'Leo Tolstoy',
    }

    const result = await mutate(Book, 'create', payload, null, asAdmin())
    expect(result).toMatchSnapshot()
  })


  it('should find items by translation', async () => {
    const filter = {
      shortSummary: {
        $contains: 'ein historischer Roman',
      }
    }

    const result = await find(Book, { ...orderByIdAsc, filter }, asAdmin(1, 'de'))
    expect(result).toMatchSnapshot()
  })

})
