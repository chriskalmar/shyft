
'use strict';

const Ajv = require('ajv')
const ajv = new Ajv({
  allErrors: true,
  extendRefs: true
})

// load base model json schema
const baseModelSchema = require('../core/validation/base.js').schema

// compile validation function
const validateBaseModel = ajv.compile( baseModelSchema );


module.exports = {
  validateBaseModel
}


