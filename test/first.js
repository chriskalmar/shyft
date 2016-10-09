
'use strict';

const chai = require('chai')
const expect = chai.expect
const shift = require('../')



describe('demo function', function() {

  it('should return true if value > 100', function() {
    let result = shift.over100(123)

    expect(result).to.be.true
  })

})