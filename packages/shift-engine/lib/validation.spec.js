
import {
  DataTypeString,
  DataTypeInteger,
} from './datatype/dataTypes';

import Entity from './entity/Entity';
import Action from './action/Action';
import Mutation, {
  MUTATION_TYPE_CREATE,
} from './mutation/Mutation';

import { buildObjectDataType, } from './datatype/ObjectDataType';
import { buildListDataType, } from './datatype/ListDataType';


import {
  validateActionPayload,
  validateMutationPayload,
} from './validation';


describe('validation', () => {

  const player = buildObjectDataType({
    attributes: {
      number: {
        type: DataTypeInteger,
        description: 'Number on the shirt',
        required: true,
        validate(value) {
          if (value % 2 === 1) {
            throw new Error(`Players need to have even numbers (got ${value})`)
          }
        }
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

  const team = buildObjectDataType({
    attributes: {
      teamName: {
        type: DataTypeString,
        description: 'Name of the team',
        validate(value, row, source, context) {
          if (value.indexOf('Team') === -1) {
            throw new Error('Missing "Team" in team name')
          }
          if (!context) {
            throw new Error('Missing context')
          }
        }
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



  const entity = new Entity({
    name: 'SomeEntityName',
    description: 'Just some description',
    attributes: {
      someAttribute: {
        type: DataTypeString,
        description: 'Just some description',
        validate(value, row, source, context) {
          if (value.length < 3) {
            throw new Error('Too short')
          }
          if (value.length > 10) {
            throw new Error('Too long')
          }
          if (!context) {
            throw new Error('Missing context')
          }
        }
      },
      team: {
        type: team,
        description: 'a team',
      }
    }
  })

  const mutation = new Mutation({
    type: MUTATION_TYPE_CREATE,
    name: 'build',
    description: 'build something',
    attributes: ['someAttribute', 'team']
  })

  const action1 = new Action({
    name: 'displayTeam',
    description: 'do something',
    input: {
      type: team
    },
    output: {},
    resolve() { },
  })

  const action2 = new Action({
    name: 'setPercentage',
    description: 'set a percentage',
    input: {
      type: DataTypeString,
      description: 'percentage value',
      validate(value, row, source, context) {
        if (value <= 0.0 || value >= 1.0) {
          throw new Error(`Value needs to be between 0.0 and 1.0 (got: ${value})`)
        }
        if (!context) {
          throw new Error('Missing context')
        }
      }
    },
    output: {},
    resolve() { },
  })


  const action3 = new Action({
    name: 'setPlayers',
    description: 'set a list of players',
    input: {
      type: buildListDataType({
        itemType: player,
      }),
      description: 'players',
    },
    output: {},
    resolve() { },
  })


  const context = {
    lorem: 'impsum'
  }

  it('should accept valid mutation payloads', () => {

    const payload1 = {
      someAttribute: 'Lorem',
      team: {
        teamName: 'Falcons United Team'
      }
    }

    validateMutationPayload(entity, mutation, payload1, context)


    const payload2 = {
      someAttribute: 'Lorem',
      team: {
        teamName: 'Falcons United Team',
        players: {
          offense: [{
            number: 2,
            lastName: 'Iverson',
          }]
        }
      }
    }

    validateMutationPayload(entity, mutation, payload2, context)
  })


  it('should reject payloads based on attribute level validation', () => {

    const payload1 = {
      someAttribute: 'Lo',
    }

    const fn1 = () => validateMutationPayload(entity, mutation, payload1, context)
    expect(fn1).toThrowErrorMatchingSnapshot();


    const payload2 = {
      someAttribute: 'Lorem Ipsum',
    }

    const fn2 = () => validateMutationPayload(entity, mutation, payload2, context)
    expect(fn2).toThrowErrorMatchingSnapshot();


    const payload3 = {
      someAttribute: 'Lorem',
      team: {
        teamName: 'Falcons United Team'
      }
    }

    const fn3 = () => validateMutationPayload(entity, mutation, payload3)
    expect(fn3).toThrowErrorMatchingSnapshot();


    const payload4 = 4.7

    const fn4 = () => validateActionPayload(action2.getInput(), payload4, action2, context)
    expect(fn4).toThrowErrorMatchingSnapshot();
  })


  it('should reject payloads based on attribute level validation of nested attributes', () => {

    const payload1 = {
      someAttribute: 'Lorem',
      team: {
        teamName: 'Falcons United'
      }
    }

    const fn1 = () => validateMutationPayload(entity, mutation, payload1, context)
    expect(fn1).toThrowErrorMatchingSnapshot();


    const payload2 = {
      someAttribute: 'Lorem',
      team: {
        teamName: 'Falcons United Team',
        players: {
          offense: [{
            number: 5,
            lastName: 'Iverson',
          }]
        }
      }
    }

    const fn2 = () => validateMutationPayload(entity, mutation, payload2, context)
    expect(fn2).toThrowErrorMatchingSnapshot();


    const payload3 = [{
      number: 9,
      lastName: 'Iverson',
    }]

    const fn3 = () => validateActionPayload(action3.getInput(), payload3, action3, context)
    expect(fn3).toThrowErrorMatchingSnapshot();
  })


  it('should reject payloads based on data type level validation', () => {

    const payload1 = {
      someAttribute: 'Lorem',
      team: {
        teamName: 'Falcons United Team',
        players: {
          offense: ['lorem']
        }
      }
    }

    const fn1 = () => validateMutationPayload(entity, mutation, payload1, context)
    expect(fn1).toThrowErrorMatchingSnapshot();


    const payload2 = {
      someAttribute: 'Lorem',
      team: {
        teamName: 'Falcons United Team',
        players: {
          offense: {
            lorem: 'ipsum'
          }
        }
      }
    }

    const fn2 = () => validateMutationPayload(entity, mutation, payload2, context)
    expect(fn2).toThrowErrorMatchingSnapshot();
  })



  it('should accept valid action payloads', () => {

    const payload1 = {
      teamName: 'Falcons United Team'
    }

    validateActionPayload(action1.getInput(), payload1, action1, context)


    const payload2 = {
      teamName: 'Falcons United Team',
      players: {
        offense: [{
          number: 2,
          lastName: 'Iverson',
        }]
      }
    }

    validateActionPayload(action1.getInput(), payload2, action1, context)


    const payload3 = 0.6

    validateActionPayload(action2.getInput(), payload3, action2, context)


    const payload4 = [{
      number: 8,
      lastName: 'Iverson',
    }]

    validateActionPayload(action3.getInput(), payload4, action3, context)
  })

})
