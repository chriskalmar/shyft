
import {
  Action,
  DataTypeString,
  DataTypeInteger,
  buildObjectDataType,
  buildListDataType,
} from 'shift-engine';

import {
  generateActions,
} from './action';

import ProtocolGraphQL from './ProtocolGraphQL';
import ProtocolGraphQLConfiguration from './ProtocolGraphQLConfiguration';


ProtocolGraphQL.setProtocolConfiguration(new ProtocolGraphQLConfiguration())


describe('action', () => {

  const simpleAction = new Action({
    name: 'newSimpleAction',
    description: 'do something',
    input: {
      required: true,
      type: buildObjectDataType({
        attributes: {
          firstName: {
            type: DataTypeString,
            description: 'First name',
          },
          lastName: {
            type: DataTypeString,
            description: 'Last name',
            required: true,
          },
        },
      }),
    },
    output: {
      type: buildObjectDataType({
        attributes: {
          luckyNumber: {
            type: DataTypeInteger,
            description: 'The perfect lucky number for the given name'
          }
        }
      })
    },
    resolve() { },
  })

  const noInputAction = new Action({
    name: 'noInputAction',
    description: 'do something',
    output: {
      type: buildObjectDataType({
        attributes: {
          luckyNumber: {
            type: DataTypeInteger,
            description: 'The perfect lucky number for the given name'
          }
        }
      })
    },
    resolve() { },
  })


  const noOutputAction = new Action({
    name: 'noOutputAction',
    description: 'do something',
    input: {
      required: true,
      type: buildObjectDataType({
        attributes: {
          firstName: {
            type: DataTypeString,
            description: 'First name',
          },
          lastName: {
            type: DataTypeString,
            description: 'Last name',
            required: true,
          },
        },
      }),
    },
    resolve() { },
  })


  const player = buildObjectDataType({
    attributes: {
      number: {
        type: DataTypeInteger,
        description: 'Number on the shirt',
        required: true
      },
      firstName: {
        type: DataTypeString,
        description: 'First name',
      },
      lastName: {
        type: DataTypeString,
        description: 'Last name',
        required: true,
      },
    },
  })

  const returnedPlayer = buildObjectDataType({
    attributes: {
      playerId: {
        type: DataTypeInteger,
        description: 'ID of the player',
      },
      lockerId: {
        type: DataTypeInteger,
        description: 'Assigned locker',
      },
    },
  })

  const complexAction = new Action({
    name: 'buildTeam',
    description: 'build a team',
    input: {
      required: true,
      type: buildObjectDataType({
        attributes: {
          teamName: {
            type: DataTypeString,
            description: 'Name of the team',
          },
          players: {
            type: buildObjectDataType({
              attributes: {
                offense: {
                  type: buildListDataType({
                    itemType: player,
                  }),
                  description: 'Offense players',
                },
                defence: {
                  type: buildListDataType({
                    itemType: player,
                  }),
                  description: 'Defence players',
                },
              },
            }),
            description: 'List of player',
          }
        }
      })
    },
    output: {
      type: buildObjectDataType({
        attributes: {
          result: {
            type: buildObjectDataType({
              attributes: {
                offense: {
                  type: buildListDataType({
                    itemType: returnedPlayer,
                  }),
                  description: 'Offense players',
                },
                defence: {
                  type: buildListDataType({
                    itemType: returnedPlayer,
                  }),
                  description: 'Defence players',
                },
              },
            }),
            description: 'List of player',
          }
        }
      })
    },
    resolve() { },
  })


  const actions = [ simpleAction, noInputAction, noOutputAction, complexAction ];

  const graphRegistry = {
    types: {},
    actions: {},
  }

  actions.map(action => {
    graphRegistry.actions[ action.name ] = {
      action
    }
  })



  it('should generate actions', () => {

    const generatedActions = generateActions(graphRegistry)
    expect(generatedActions).toMatchSnapshot();

    const actionNames = Object.keys(generatedActions)
    expect(actionNames.length).toEqual(4)

    actionNames.map(actionName => {
      const action = generatedActions[ actionName ]
      const outputType = action.type

      const outputFields = outputType.getFields()
      expect(outputFields).toMatchSnapshot();

      if (outputFields.result) {
        const outputResultType = outputFields.result.type
        const outputResultFields = outputResultType.getFields()
        expect(outputResultFields).toMatchSnapshot();
      }

      const inputType = action.args.input.type.ofType || action.args.input.type
      const inputFields = inputType.getFields()
      expect(inputFields).toMatchSnapshot();

      if (inputFields.data) {
        const inputDataType = inputFields.data.type.ofType
        const inputDataFields = inputDataType.getFields()
        expect(inputDataFields).toMatchSnapshot();
      }

    })

  })

})
