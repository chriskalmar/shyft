
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


  it('should generate an action data input type', () => {

    const type = generateNestedDataInput('AddTeamMember', player, 'player')
    expect(type.name).toEqual('AddTeamMemberPlayerDataInput');

    const fields = type.getFields()
    expect(fields).toMatchSnapshot();
  })


  it('should generate an action input type', () => {

    const inputDataInputType = generateDataInput(simpleAction.name, simpleAction.getInput())
    const type = generateInput(simpleAction.name, inputDataInputType)
    expect(type.name).toEqual('NewSimpleActionInput');

    const inputFields = type.getFields()
    expect(inputFields).toMatchSnapshot();

    const dataInputType = inputFields.data.type.ofType
    const dataInputFields = dataInputType.getFields()
    expect(dataInputFields).toMatchSnapshot();
  })


})
