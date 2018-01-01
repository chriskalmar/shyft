
import {
  Action,
  DataTypeString,
  DataTypeInteger,
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


})
