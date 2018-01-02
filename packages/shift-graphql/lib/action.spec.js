
import {
  Action,
  DataTypeString,
  DataTypeInteger,
  buildObjectDataType,
  buildListDataType,
} from 'shift-engine';

import {
  generateActionDataInput,
  generateActionInput,
  generateActionDataOutput,
  generateActionOutput,
} from './action';


describe('action', () => {

  const simpleAction = new Action({
    name: 'newSimpleAction',
    description: 'do something',
    input: {
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
    output: {
      luckyNumber: {
        type: DataTypeInteger,
        description: 'The perfect lucky number for the given name'
      }
    },
    resolve() { },
  })


  it('should generate an action data input type', () => {

    const type = generateActionDataInput(simpleAction)
    expect(type.name).toEqual('NewSimpleActionDataInput');

    const fields = type.getFields()
    expect(fields).toMatchSnapshot();
  })


  it('should generate an action input type', () => {

    const inputDataInputType = generateActionDataInput(simpleAction)
    const type = generateActionInput(simpleAction, inputDataInputType)
    expect(type.name).toEqual('NewSimpleActionInput');

    const fields = type.getFields()
    expect(fields).toMatchSnapshot();
  })


  it('should generate an action data output type', () => {

    const type = generateActionDataOutput(simpleAction)
    expect(type.name).toEqual('NewSimpleActionDataOutput');

    const fields = type.getFields()
    expect(fields).toMatchSnapshot();
  })


  it('should generate an action output type', () => {

    const outputDataOutputType = generateActionDataOutput(simpleAction)
    const type = generateActionOutput(simpleAction, outputDataOutputType)
    expect(type.name).toEqual('NewSimpleActionOutput');

    const fields = type.getFields()
    expect(fields).toMatchSnapshot();
  })



  it('should handle nested input and output definitions', () => {

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
      },
      output: {
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
      },
      resolve() { },
    })


    const inputType = generateActionDataInput(complexAction)
    expect(inputType.name).toEqual('BuildTeamDataInput');

    const inputFields = inputType.getFields()
    expect(inputFields).toMatchSnapshot();

    const playersInputType = inputFields.players.type
    const playersInputFields = playersInputType.getFields()
    expect(playersInputFields).toMatchSnapshot();


    const offenseInputType = playersInputFields.offense.type.ofType
    const defenceInputType = playersInputFields.defence.type.ofType
    const offenseInputFields = offenseInputType.getFields()
    const defenceInputFields = defenceInputType.getFields()
    expect(offenseInputFields).toMatchSnapshot();
    expect(defenceInputFields).toMatchSnapshot();


    const outputType = generateActionDataOutput(complexAction)
    expect(outputType.name).toEqual('BuildTeamDataOutput');

    const outputFields = outputType.getFields()
    expect(outputFields).toMatchSnapshot();

    const playersOutputType = outputFields.result.type
    const playersOutputFields = playersOutputType.getFields()
    expect(playersOutputFields).toMatchSnapshot();


    const offenseOutputType = playersOutputFields.offense.type.ofType
    const defenceOutputType = playersOutputFields.defence.type.ofType
    const offenseOutputFields = offenseOutputType.getFields()
    const defenceOutputFields = defenceOutputType.getFields()
    expect(offenseOutputFields).toMatchSnapshot();
    expect(defenceOutputFields).toMatchSnapshot();

  })

})
