
import {
  Action,
  DataTypeString,
  DataTypeInteger,
  buildObjectDataType,
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
  })({
    name: 'player',
    description: 'some description',
  })


  it('should generate a nested data input type', () => {

    const type = generateNestedDataInput('AddTeamMember', player, 'player')
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

    const type = generateNestedDataOutput('AddTeamMember', player, 'player')
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


})
