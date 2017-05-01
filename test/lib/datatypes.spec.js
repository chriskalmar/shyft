
/* eslint consistent-return: [0] */

import _ from 'lodash';
import { registry } from '../../';
import DataType from '../../lib/data-type';
import DataTypeBoolean from '../../lib/datatypes/boolean';


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
  'reference',
  'float'
]



describe('data types', () => {

  it('should have a name', () => {

    function fn() {
      new DataType() // eslint-disable-line no-new
    }

    expect(fn).to.throw(/Missing data type name/);

  })


  it('should have a json schema type', () => {

    function fn() {
      new DataType('example') // eslint-disable-line no-new
    }

    expect(fn).to.throw(/Missing json schema type/);

  })


  it('should have a database type', () => {

    function fn() {
      new DataType('example', 'integer') // eslint-disable-line no-new
    }

    expect(fn).to.throw(/Missing database type/);

  })


  it('should have getAcceptedJsonSchemaProperties() implemented', () => {

    function fn() {
      new DataType('example', 'integer', 'integer') // eslint-disable-line no-new
    }

    expect(fn).to.throw(/Missing implementation of getAcceptedJsonSchemaProperties()/);

  })


  it('should have getters', () => {

    const datatype = new DataTypeBoolean()

    expect(datatype.getName()).to.equal('boolean')
    expect(datatype.getJsonSchemaType()).to.equal('boolean')
    expect(datatype.getDbType()).to.equal('boolean')

  })


  it('should have a definition validator', () => {

    const datatype = new DataTypeBoolean()

    expect(datatype.getDefinitionValidator).to.be.a('function')

  })


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
