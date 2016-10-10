
'use strict';

const registry = require('../../').registry



describe('registry', function() {

  it('should store core components', function() {

    registry.setCoreComponent('example', function() {}, '/tmp')

    expect(registry.components.core).to.have.property('example')
  })

})