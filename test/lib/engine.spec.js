
'use strict';

const engine = require('../../').engine
const fs = require('fs')

const model = require('../fixtures/models/geo.js')




describe('engine', function() {


  describe('should render a complete model into SQL code', function() {

    let sqlResult = fs.readFileSync('./test/fixtures/renders/full.sql').toString()

    it('via callback', function() {

      engine.generateDatabaseSql([model], function(err, result) {
        expect(result.trim()).to.equal(sqlResult)
      })

    })



    it('via return', function() {

      let result = engine.generateDatabaseSql([model]).trim()

      expect(result).to.equal(sqlResult)
    })

  })



  it('reject code generation if "models" is not an array', function() {

    function fn() {
      engine.generateDatabaseSql(model)
    }

    expect(fn).to.throw(/models needs to be an array/);

  })


})
