import './setupAndTearDown';
import { mutate, findOne } from './db';
import { asAdmin } from './testUtils';
import { DataTypeTester } from './models/DataTypeTester';

describe('storageDataTypes', () => {
  it('persist and read data of various types', async () => {
    const payload = {
      typeId: 43455523,
      typeInteger: 729393827,
      typeBigInt: '34567890987654',
      typeFloat: 934234.111243,
      typeBoolean: true,
      typeString: 'Random text',
      typeJson: { simple: 123, nested: { level2: [1, 6, 9] } },
      typeTimestamp: '2000-01-02 11:12:13',
      typeTimestampTz: '2001-02-03 12:13:14+15:16',
      typeDate: '2002-03-04',
      typeTime: '11:12:13',
      typeTimeTz: '12:13:14+15:16',
      typeUuid: '7f7fa058-7072-44a8-a70b-a5846f63b3fd',
    };

    const persist = await mutate(
      DataTypeTester,
      'create',
      payload,
      null,
      asAdmin(),
    );

    expect(persist).toMatchSnapshot();

    // eslint-disable-next-line dot-notation
    const result = await findOne(DataTypeTester, persist['id'], {}, asAdmin());
    expect(result).toMatchSnapshot();
  });
});
