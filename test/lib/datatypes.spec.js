
'use strict';


const _ = require('lodash')
const registry = require('../../').registry

const dataTypeNames = [
  'string',
  'integer'
]



describe('data types', function() {

  _.map(dataTypeNames, function(dataTypeName) {

    let fixtures = require(`../fixtures/datatypes/${dataTypeName}`)
    let dataType = registry.getDataType(dataTypeName)
    let definitionValidator = dataType.getDefinitionValidator()

    describe(dataTypeName, function() {

      if (!fixtures.valid || !fixtures.valid.length) {
        throw new Error('Test fixture is broken')
      }


      it('should accept valid definitions', function() {

        _.map(fixtures.valid, function(validDefinition) {

          let valid

          valid = definitionValidator( validDefinition )

          expect(valid).to.be.true

        })

      })


      describe('should reject definition when', function() {

        if (!fixtures.invalid || !fixtures.invalid.length) {
          throw new Error('Test fixture is broken')
        }

        _.map(fixtures.invalid, function(invalid) {

          if (!invalid.errors || !invalid.errors.length) {
            throw new Error('Test fixture is broken')
          }

          _.map(invalid.errors, function(error) {

            it(error.reason, function() {

              let valid

              function fn() {
                valid = definitionValidator( invalid.setup )

                if (!valid) {
                  throw new Error(JSON.stringify(definitionValidator.errors, null, 2))
                }
              }

              expect(fn).to.throw(error.msg || '----')

            })

          })

        })

      })

    })

  })

})
