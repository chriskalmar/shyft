
import {
  Action,
  DataTypeString,
  DataTypeInteger,
  buildObjectDataType,
  buildListDataType,
} from 'shift-engine';

import {
  generateInput,
  generateDataInput,
  generateNestedDataInput,
  generateOutput,
  generateDataOutput,
  generateNestedDataOutput,
} from './io';


describe('io', () => {

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

  const playerDef = buildObjectDataType({
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
  })({
    name: 'player',
    description: 'some description',
  })


  it('should generate a nested data input type', () => {

    const type = generateNestedDataInput('AddTeamMember', playerDef, 'player')
    expect(type.name).toEqual('AddTeamMemberPlayerDataInput');

    const fields = type.getFields()
    expect(fields).toMatchSnapshot();
  })


  it('should generate an input type', () => {

    const inputDataInputType = generateDataInput(simpleAction.name, simpleAction.getInput())
    const type = generateInput(simpleAction.name, inputDataInputType)
    expect(type.name).toEqual('NewSimpleActionInput');

    const inputFields = type.getFields()
    expect(inputFields).toMatchSnapshot();

    const dataInputType = inputFields.data.type.ofType
    const dataInputFields = dataInputType.getFields()
    expect(dataInputFields).toMatchSnapshot();
  })


  it('should generate a nested data output type', () => {

    const type = generateNestedDataOutput('AddTeamMember', playerDef, 'player')
    expect(type.name).toEqual('AddTeamMemberPlayerDataOutput');

    const fields = type.getFields()
    expect(fields).toMatchSnapshot();
  })


  it('should generate an output type', () => {

    const outputDataOutputType = generateDataOutput(simpleAction.name, simpleAction.getOutput())
    const type = generateOutput(simpleAction.name, outputDataOutputType)
    expect(type.name).toEqual('NewSimpleActionOutput');

    const outputFields = type.getFields()
    expect(outputFields).toMatchSnapshot();

    const resultOutputType = outputFields.result.type
    const resultOutputFields = resultOutputType.getFields()
    expect(resultOutputFields).toMatchSnapshot();
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


    const inputType = generateDataInput(complexAction.name, complexAction.getInput())
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


    const outputType = generateDataOutput(complexAction.name, complexAction.getOutput())
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
