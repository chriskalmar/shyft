
import { assert } from 'chai';
import {
  Action,
  DataTypeString,
} from 'shift-engine';

import {
  generateActionDataInput,
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
    output: {},
    resolve() { },
  })


  it('should generate an action data input type', () => {

    const type = generateActionDataInput(simpleAction)
    assert.strictEqual(type.name, 'NewSimpleActionDataInput');

    const fields = type.getFields()
    assert.deepProperty(fields, 'firstName')
    assert.deepProperty(fields, 'lastName')
  })


})
