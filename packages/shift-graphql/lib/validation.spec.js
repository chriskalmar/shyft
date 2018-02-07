
import {
  DataTypeString,
  DataTypeInteger,
  Entity,
  buildObjectDataType,
  buildListDataType,
  Mutation,
  MUTATION_TYPE_CREATE,
} from 'shift-engine';

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


  const context = {
    lorem: 'impsum'
  }

  it('should accept valid mutation payloads', () => {

    const payload = {
      someAttribute: 'Lorem',
      team: {
        teamName: 'Falcons United Team'
      }
    }

    validateMutationPayload(entity, mutation, payload, context)
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

})
