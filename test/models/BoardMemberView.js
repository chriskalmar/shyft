import { ViewEntity, Permission } from 'shyft';

import { Profile } from './Profile';
import { Board } from './Board';

const readPermissions = () => [
  new Permission().role('admin'),
  new Permission().userAttribute('inviterId'),
  new Permission().lookup(Board, {
    id: 'boardId',
    owner: ({ userId }) => userId,
  }),
];

export const BoardMemberView = new ViewEntity({
  name: 'BoardMemberView',
  description: 'Custom view of board members',

  permissions: () => ({
    read: readPermissions(),
    find: readPermissions(),
  }),

  viewExpression: `
    SELECT
      b.id AS "boardId",
      b.name AS "boardName",
      p.id AS "inviterId",
      p.username AS "username",
      count(*) AS "inviteCount",
      array_agg(bm.invitee) AS "invitees"
    FROM board_member bm
    JOIN profile p
      ON (bm.inviter = p.id)
    JOIN board b
      ON (bm.board = b.id)
    GROUP BY 1, 2, 3, 4
  `,

  attributes: {
    boardId: {
      type: Board,
      description: 'Reference to the board',
      required: true,
    },

    inviterId: {
      type: Profile,
      description: 'The user that invites to a board',
      required: true,
    },

    invitees: {
      type: Profile,
      description: 'The user that participates in the board',
      required: true,
    },
  },
});
