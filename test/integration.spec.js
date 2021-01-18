import './setupAndTearDown';
import { count } from './db';

import { asAdmin } from './testUtils';

import { counts } from './testSetGenerator';

import { Profile } from './models/Profile';
import { Board } from './models/Board';
import { BoardMember } from './models/BoardMember';
import { StorageTypePostgres } from '../src/storage-connector/StorageTypePostgres';

describe('postgres', () => {
  it('test data imported correctly', async () => {
    const profileCount = await count(Profile, {}, asAdmin());
    expect(profileCount).toEqual(counts.profileCount);

    const boardCount = await count(Board, {}, asAdmin());
    expect(boardCount).toEqual(counts.boardCount);

    const memberCount = await count(BoardMember, {}, asAdmin());
    expect(memberCount).toEqual(counts.joinCount + counts.inviteCount);
  });

  it('should check the generated indexes', async () => {
    const storageInstance = StorageTypePostgres.getStorageInstance();
    const manager = storageInstance.manager;
    const indexes = await manager.query(`
      select
        indexname,
        indexdef ILIKE '%UNIQUE%' AS unique
      from pg_indexes
      where tablename = 'board'
      order by indexname
    `);

    expect(indexes).toMatchSnapshot('indexList');
  });
});
