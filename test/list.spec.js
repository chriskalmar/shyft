import './beforeAll';
import {
  find,
} from './db';

import {
  asAdmin,
  removeListDynamicData,
} from './testUtils';

import { Profile } from './models/Profile';


const orderByIdAsc = {
  orderBy: [{
    attribute: 'id',
    direction: 'ASC'
  }]
}

const orderByIdDesc = {
  orderBy: [{
    attribute: 'id',
    direction: 'DESC'
  }]
}

describe('list', () => {

  it('should fetch lists', async () => {
    const profiles = await find(Profile, { ...orderByIdAsc }, asAdmin())
    profiles.data = removeListDynamicData(Profile, profiles.data)
    expect(profiles).toMatchSnapshot()
  })


  it('should fetch lists using `first`', async () => {
    const profiles = await find(Profile, { ...orderByIdAsc, first: 3 }, asAdmin())
    profiles.data = removeListDynamicData(Profile, profiles.data)
    expect(profiles).toMatchSnapshot()
  })


  it('should fetch lists using `last`', async () => {
    const profiles = await find(Profile, { ...orderByIdAsc, last: 3 }, asAdmin())
    profiles.data = removeListDynamicData(Profile, profiles.data)
    expect(profiles).toMatchSnapshot()
  })


  it('should fetch lists with descending sort', async () => {
    const profiles = await find(Profile, { ...orderByIdDesc }, asAdmin())
    profiles.data = removeListDynamicData(Profile, profiles.data)
    expect(profiles).toMatchSnapshot()
  })


  it('should fetch lists using `first` with descending sort', async () => {
    const profiles = await find(Profile, { ...orderByIdDesc, first: 3 }, asAdmin())
    profiles.data = removeListDynamicData(Profile, profiles.data)
    expect(profiles).toMatchSnapshot()
  })


  it('should fetch lists using `last` with descending sort', async () => {
    const profiles = await find(Profile, { ...orderByIdDesc, last: 3 }, asAdmin())
    profiles.data = removeListDynamicData(Profile, profiles.data)
    expect(profiles).toMatchSnapshot()
  })

})
