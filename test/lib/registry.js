
'use strict';

const chai = require('chai')
const expect = chai.expect
const registry = require('../../').registry



describe('registry', function() {

  it('should store core components', function() {

    registry.setCoreComponent('example', function() {}, '/tmp')

    expect(registry.components.core).to.have.property('example')
  })

})