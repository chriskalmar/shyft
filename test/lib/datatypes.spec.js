
/* eslint consistent-return: [0] */

'use strict';


import _ from 'lodash';
import { registry } from '../../';

const dataTypeNames = [
  'string',
  'integer',
  'bigint',
  'boolean',
  'email',
  'date',
  'time',
  'timetz',
  'timestamp',
  'timestamptz',
  'json',
  'password',
  'reference'
]



describe('data types', () => {

  _.map(dataTypeNames, (dataTypeName) => {

    const fixtures = require(`../fixtures/datatypes/${dataTypeName}`).default
    const dataType = registry.getDataType(dataTypeName)
    const definitionValidator = dataType.getDefinitionValidator()

    describe(dataTypeName, () => {

      if (fixtures.skip) {
        return it.skip('TODO')
      }

      if (!fixtures.valid || !fixtures.valid.length) {
        throw new Error('Test fixture is broken')
      }


      it('should accept valid definitions', () => {

        _.map(fixtures.valid, (validDefinition) => {

          const valid = definitionValidator( validDefinition )

          expect(valid).to.be.true

        })

      })


      describe('should reject definition when', () => {

        if (!fixtures.invalid || !fixtures.invalid.length) {
          throw new Error('Test fixture is broken')
        }

        _.map(fixtures.invalid, (invalid) => {

          if (!invalid.errors || !invalid.errors.length) {
            throw new Error('Test fixture is broken')
          }

          _.map(invalid.errors, (error) => {

            it(error.reason, () => {

              let valid
              let forwardError

              function fn() {
                valid = definitionValidator( invalid.setup )

                if (!valid) {
                  forwardError = new Error('Validation Error')
                  forwardError.validationErrors = definitionValidator.errors
                  throw forwardError
                }
              }

              expect(fn).to.throw().and.to.satisfy((err) => {
                let matched = false

                _.map(err.validationErrors, (validationError) => {

                  if (JSON.stringify(validationError).match(error.msg)) {
                    matched = true
                  }
                })

                return matched
              });

            })

          })

        })

      })

    })

  })

})
