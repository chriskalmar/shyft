
'use strict';


const _ = require('lodash')
const registry = require('../../').registry

const dataTypeNames = [
  'string'
]



describe('data types', function() {

  _.map(dataTypeNames, function(dataTypeName) {

    let fixtures = require(`../fixtures/datatypes/${dataTypeName}`)
    let dataType = registry.getDataType(dataTypeName)
    let definitionValidator = dataType.getDefinitionValidator()

    describe(dataTypeName, function() {

      _.map(fixtures.valid, function(validDefinition) {

        it('should accept a valid definition', function() {

          let valid

          valid = definitionValidator( validDefinition )

          expect(valid).to.be.true

        })

      })


      _.map(fixtures.invalid, function(invalid) {

        it('should reject an invalid definition', function() {

          let valid

          function fn() {
            valid = definitionValidator( invalid.setup )

            if (!valid) {
              throw new Error(JSON.stringify(definitionValidator.errors, null, 2))
            }
          }

          _.map(invalid.errorContent, function(errorContent) {
            expect(fn).to.throw(errorContent)
          })

        })

      })

    })

  })

  // describe('should render a complete model into SQL code', function() {

  //   let sqlResult = fs.readFileSync('./test/fixtures/renders/full.sql').toString()

  //   it('via callback', function() {

  //     engine.generateDatabaseSql([model], function(err, result) {
  //       expect(result.trim()).to.equal(sqlResult)
  //     })

  //   })



  //   it('via return', function() {

  //     let result = engine.generateDatabaseSql([model]).trim()

  //     expect(result).to.equal(sqlResult)
  //   })

  // })



  // it('reject code generation if "models" is not an array', function() {

  //   function fn() {
  //     engine.generateDatabaseSql(model)
  //   }

  //   expect(fn).to.throw(/models needs to be an array/);

  // })



  // it('should load domain models', function() {

  //   registry.clearAllDomainModel()
  //   engine.loadDomainModels(domainModels)

  //   expect(registry.components.models).to.have.deep.property('geo.country')
  // })




  // it('throw an error if domain models are provided in wrong format', function() {

  //   function fn1() {
  //     engine.loadDomainModels()
  //   }

  //   function fn2() {
  //     engine.loadDomainModels([{}])
  //   }

  //   expect(fn1).to.throw(/domainModels needs to be an array/);
  //   expect(fn2).to.throw(/each domainModel needs to have a filePath and a model property/);

  // })



  // it('should load domain models from a given path', function() {

  //   registry.clearAllDomainModel()
  //   engine.loadDomainModelsFromFilePath(domainModelsFilePath)

  //   expect(registry.components.models).to.have.deep.property('geo.country')
  // })


})
