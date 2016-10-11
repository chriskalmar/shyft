
'use strict';

const engine = require('../../').engine
const fs = require('fs')

const model = require('../fixtures/models/geo.js')




describe('engine', function() {


  it('should render a complete model into SQL code', function() {

    const sqlResult = fs.readFileSync('./test/fixtures/renders/full.sql').toString()
    const result = engine.generateDatabaseSql([model]).trim()

    expect(result).to.equal(sqlResult)
  })


})