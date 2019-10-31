import './setupAndTearDown';
import { find } from './db';

import { asAdmin, removeListDynamicData } from './testUtils';

import { Profile } from './models/Profile';
import { Board } from './models/Board';
import { BoardMember } from './models/BoardMember';

const orderByIdAsc = {
  orderBy: [
    {
      attribute: 'id',
      direction: 'ASC',
    },
  ],
};

const orderByIdDesc = {
  orderBy: [
    {
      attribute: 'id',
      direction: 'DESC',
    },
  ],
};

describe('list', () => {
  it('orderBy', async () => {
    const profiles = await find(Profile, { ...orderByIdAsc }, asAdmin());
    profiles.data = removeListDynamicData(Profile, profiles.data);
    expect(profiles).toMatchSnapshot();
  });

  it('orderBy + first', async () => {
    const profiles = await find(
      Profile,
      { ...orderByIdAsc, first: 3 },
      asAdmin(),
    );
    profiles.data = removeListDynamicData(Profile, profiles.data);
    expect(profiles).toMatchSnapshot();
  });

  it('orderBy + first 0', async () => {
    const profiles = await find(
      Profile,
      { ...orderByIdAsc, first: 0 },
      asAdmin(),
    );
    expect(profiles).toMatchSnapshot();
  });

  it('orderBy + last', async () => {
    const profiles = await find(
      Profile,
      { ...orderByIdAsc, last: 3 },
      asAdmin(),
    );
    profiles.data = removeListDynamicData(Profile, profiles.data);
    expect(profiles).toMatchSnapshot();
  });

  it('descending orderBy', async () => {
    const profiles = await find(Profile, { ...orderByIdDesc }, asAdmin());
    profiles.data = removeListDynamicData(Profile, profiles.data);
    expect(profiles).toMatchSnapshot();
  });

  it('descending orderBy + first', async () => {
    const profiles = await find(
      Profile,
      { ...orderByIdDesc, first: 3 },
      asAdmin(),
    );
    profiles.data = removeListDynamicData(Profile, profiles.data);
    expect(profiles).toMatchSnapshot();
  });

  it('descending orderBy + last', async () => {
    const profiles = await find(
      Profile,
      { ...orderByIdDesc, last: 3 },
      asAdmin(),
    );
    profiles.data = removeListDynamicData(Profile, profiles.data);
    expect(profiles).toMatchSnapshot();
  });

  it('orderBy + offset', async () => {
    const profiles = await find(
      Profile,
      { ...orderByIdAsc, offset: 5 },
      asAdmin(),
    );
    profiles.data = removeListDynamicData(Profile, profiles.data);
    expect(profiles).toMatchSnapshot();
  });

  it('orderBy + first + offset', async () => {
    const profiles = await find(
      Profile,
      { ...orderByIdAsc, first: 3, offset: 5 },
      asAdmin(),
    );
    profiles.data = removeListDynamicData(Profile, profiles.data);
    expect(profiles).toMatchSnapshot();
  });

  it('orderBy + last + offset', async () => {
    const profiles = await find(
      Profile,
      { ...orderByIdAsc, last: 3, offset: 5 },
      asAdmin(),
    );
    profiles.data = removeListDynamicData(Profile, profiles.data);
    expect(profiles).toMatchSnapshot();
  });

  it('descending orderBy + offset', async () => {
    const profiles = await find(
      Profile,
      { ...orderByIdDesc, offset: 5 },
      asAdmin(),
    );
    profiles.data = removeListDynamicData(Profile, profiles.data);
    expect(profiles).toMatchSnapshot();
  });

  it('descending orderBy + first + offset', async () => {
    const profiles = await find(
      Profile,
      { ...orderByIdDesc, first: 3, offset: 5 },
      asAdmin(),
    );
    profiles.data = removeListDynamicData(Profile, profiles.data);
    expect(profiles).toMatchSnapshot();
  });

  it('descending orderBy + last + offset', async () => {
    const profiles = await find(
      Profile,
      { ...orderByIdDesc, last: 3, offset: 5 },
      asAdmin(),
    );
    profiles.data = removeListDynamicData(Profile, profiles.data);
    expect(profiles).toMatchSnapshot();
  });

  it('multi-key orderBy + first + offset', async () => {
    const orderByDesc = {
      orderBy: [
        {
          attribute: 'board',
          direction: 'ASC',
        },
        {
          attribute: 'invitee',
          direction: 'DESC',
        },
      ],
    };
    const result = await find(
      BoardMember,
      { ...orderByDesc, first: 5, offset: 5 },
      asAdmin(),
    );
    result.data = removeListDynamicData(Profile, result.data);
    expect(result).toMatchSnapshot();
  });

  it('filter', async () => {
    const filter = {
      username: 'hazel528',
    };

    const result = await find(Profile, { ...orderByIdAsc, filter }, asAdmin());
    result.data = removeListDynamicData(Profile, result.data);
    expect(result).toMatchSnapshot();
  });

  it('filter with no results', async () => {
    const filter = {
      username: '---not-found---',
    };

    const result = await find(Profile, { ...orderByIdAsc, filter }, asAdmin());
    result.data = removeListDynamicData(Profile, result.data);
    expect(result).toMatchSnapshot();
  });

  it('filter with mutliple attributes', async () => {
    const filter = {
      name: 'Veritatis nihil cum',
      isPrivate: true,
    };

    const result = await find(Board, { ...orderByIdAsc, filter }, asAdmin());
    result.data = removeListDynamicData(Board, result.data);
    expect(result).toMatchSnapshot();
  });

  it('filter with invalid attributes (reject)', async () => {
    const filter = {
      someAttributes: 'Veritatis nihil cum',
    };

    await find(Board, { ...orderByIdAsc, filter }, asAdmin()).catch(e => {
      expect(e).toMatchSnapshot();
    });
  });

  describe('filter with logical operators', () => {
    describe('OR', () => {
      const orderBy = [
        {
          attribute: 'registeredAt',
          direction: 'DESC',
        },
      ];

      const filter = {
        $or: [
          {
            username: 'dana768',
          },
          {
            username: 'weston422',
          },
          {
            username: {
              $starts_with: 'jo',
              $ends_with: '56',
            },
          },
        ],
      };

      it('OR + orderBy', async () => {
        const result = await find(Profile, { orderBy, filter }, asAdmin());
        result.data = removeListDynamicData(Profile, result.data);
        expect(result).toMatchSnapshot();
      });

      it('OR + offset', async () => {
        const result = await find(
          Profile,
          { orderBy, filter, offset: 1 },
          asAdmin(),
        );
        result.data = removeListDynamicData(Profile, result.data);
        expect(result).toMatchSnapshot();
      });

      it('OR + last', async () => {
        const result = await find(
          Profile,
          { orderBy, filter, last: 3 },
          asAdmin(),
        );
        result.data = removeListDynamicData(Profile, result.data);
        expect(result).toMatchSnapshot();
      });
    });

    describe('AND', () => {
      const orderBy = [
        {
          attribute: 'createdAt',
          direction: 'DESC',
        },
      ];

      const filter = {
        $and: [
          {
            board: {
              $gt: 30,
              $lt: 40,
            },
          },
          {
            state: {
              $in: [20, 50],
            },
          },
          {
            inviter: {
              $in: [61, 78],
            },
          },
        ],
      };

      it('AND + orderBy', async () => {
        const result = await find(BoardMember, { orderBy, filter }, asAdmin());
        result.data = removeListDynamicData(BoardMember, result.data);
        expect(result).toMatchSnapshot();
      });

      it('AND + offset', async () => {
        const result = await find(
          BoardMember,
          { orderBy, filter, offset: 4 },
          asAdmin(),
        );
        result.data = removeListDynamicData(BoardMember, result.data);
        expect(result).toMatchSnapshot();
      });

      it('AND + last', async () => {
        const result = await find(
          BoardMember,
          { orderBy, filter, last: 4 },
          asAdmin(),
        );
        result.data = removeListDynamicData(BoardMember, result.data);
        expect(result).toMatchSnapshot();
      });
    });

    describe('filter with nested logical operators', () => {
      const orderBy = [
        {
          attribute: 'board',
          direction: 'ASC',
        },
      ];

      const filter = {
        $and: [
          {
            board: {
              $gt: 30,
              $lt: 40,
            },
          },
          {
            state: {
              $in: [20, 50],
            },
          },
          {
            inviter: {
              $in: [61, 78],
            },
          },
          {
            $or: [
              {
                invitee: 107,
              },
              {
                invitee: 21,
              },
              {
                invitee: 38,
              },
              {
                invitee: {
                  $gt: 60,
                  $lt: 62,
                },
              },
            ],
          },
        ],
      };

      it('AND + OR', async () => {
        const result = await find(BoardMember, { orderBy, filter }, asAdmin());
        result.data = removeListDynamicData(BoardMember, result.data);
        expect(result).toMatchSnapshot();
      });
    });
  });

  it('parentConnection', async () => {
    const parentConnection = {
      id: 60,
      attribute: 'inviter',
    };

    const result = await find(
      BoardMember,
      { ...orderByIdAsc },
      asAdmin(),
      parentConnection,
    );
    result.data = removeListDynamicData(BoardMember, result.data);
    expect(result).toMatchSnapshot();
  });

  it('parentConnection + first', async () => {
    const parentConnection = {
      id: 60,
      attribute: 'inviter',
    };

    const result = await find(
      BoardMember,
      { ...orderByIdAsc, first: 1 },
      asAdmin(),
      parentConnection,
    );
    result.data = removeListDynamicData(BoardMember, result.data);
    expect(result).toMatchSnapshot();
  });

  it('parentConnection with invalid attribute (reject)', async () => {
    const parentConnection = {
      id: 60,
      attribute: 'invalidAttributeName',
    };

    await find(
      BoardMember,
      { ...orderByIdAsc },
      asAdmin(),
      parentConnection,
    ).catch(e => {
      expect(e).toMatchSnapshot();
    });
  });

  it('should utilize data loader', async () => {
    const context = asAdmin();

    const result = await Promise.all([
      find(Profile, { ...orderByIdAsc, first: 2 }, context),
      find(Profile, { ...orderByIdAsc, first: 2 }, context),
    ]);

    expect(
      result.map(profile => removeListDynamicData(Profile, profile.data)),
    ).toMatchSnapshot();
  });

  describe('filter variants', () => {
    const runVariant = async filter => {
      const result = await find(Board, { ...orderByIdAsc, filter }, asAdmin());
      result.data = removeListDynamicData(Board, result.data);
      return result;
    };

    it('equals (null)', async () => {
      const result = await runVariant({
        name: null,
      });

      expect(result).toMatchSnapshot();
    });

    it('$ne', async () => {
      const result = await runVariant({
        name: {
          $ne: 'Reiciendis quaerat',
        },
      });

      expect(result).toMatchSnapshot();
    });

    it('$ne (null)', async () => {
      const result = await runVariant({
        name: {
          $ne: null,
        },
      });
      expect(result).toMatchSnapshot();
    });

    it('$in', async () => {
      const result = await runVariant({
        name: {
          $in: ['Ut et', 'Rerum ad'],
        },
      });

      expect(result).toMatchSnapshot();
    });

    it('$not_in', async () => {
      const result = await runVariant({
        owner: {
          $not_in: [37, 79, 42],
        },
      });

      expect(result).toMatchSnapshot();
    });

    it('$lt', async () => {
      const result = await runVariant({
        id: {
          $lt: 4,
        },
      });

      expect(result).toMatchSnapshot();
    });

    it('$lte', async () => {
      const result = await runVariant({
        id: {
          $lte: 4,
        },
      });

      expect(result).toMatchSnapshot();
    });

    it('$gt', async () => {
      const result = await runVariant({
        id: {
          $gt: 47,
        },
      });

      expect(result).toMatchSnapshot();
    });

    it('$gte', async () => {
      const result = await runVariant({
        id: {
          $gte: 47,
        },
      });

      expect(result).toMatchSnapshot();
    });

    it('$contains', async () => {
      const result = await runVariant({
        name: {
          $contains: 'quia',
        },
      });

      expect(result).toMatchSnapshot();
    });

    it('$starts_with', async () => {
      const result = await runVariant({
        name: {
          $starts_with: 'est',
        },
      });

      expect(result).toMatchSnapshot();
    });

    it('$ends_with', async () => {
      const result = await runVariant({
        name: {
          $ends_with: 'et',
        },
      });

      expect(result).toMatchSnapshot();
    });

    it('$contains + $starts_with + $ends_with', async () => {
      const result = await runVariant({
        name: {
          $starts_with: 'e',
          $contains: 'dol',
          $ends_with: 'e',
        },
      });

      expect(result).toMatchSnapshot();
    });

    it('$not_contains', async () => {
      const result = await runVariant({
        name: {
          $not_contains: 'e',
        },
      });

      expect(result).toMatchSnapshot();
    });

    it('$not_starts_with', async () => {
      const result = await runVariant({
        name: {
          $not_starts_with: 've',
        },
      });

      expect(result).toMatchSnapshot();
    });

    it('$not_ends_with', async () => {
      const result = await runVariant({
        name: {
          $not_ends_with: 't',
        },
      });

      expect(result).toMatchSnapshot();
    });

    it('$not_contains + $not_starts_with + $not_ends_with', async () => {
      const result = await runVariant({
        name: {
          $not_starts_with: 'r',
          $not_contains: 'i',
          $not_ends_with: 'e',
        },
      });

      expect(result).toMatchSnapshot();
    });

    it('$contains + $not_contains', async () => {
      const result = await runVariant({
        name: {
          $contains: 'r',
          $not_contains: 'e',
        },
      });

      expect(result).toMatchSnapshot();
    });

    it('$starts_with + $not_ends_with', async () => {
      const result = await runVariant({
        name: {
          $starts_with: 'su',
          $not_ends_with: 's',
        },
      });

      expect(result).toMatchSnapshot();
    });
  });
});
