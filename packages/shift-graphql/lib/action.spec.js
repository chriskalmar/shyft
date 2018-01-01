
import {
  Action,
  DataTypeString,
  DataTypeInteger,
} from 'shift-engine';

import {
  generateActionDataInput,
  generateActionInput,
} from './action';


describe('action', () => {

  const simpleAction = new Action({
    name: 'newSimpleAction',
    description: 'do something',
    input: {
      firstName: {
        type: DataTypeString,
      },
      lastName: {
        type: DataTypeString,
      },
    },
    output: {
      luckyNumber: {
        type: DataTypeInteger,
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


})
