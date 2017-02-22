
'use strict';

import Ajv from 'ajv';

const ajv = new Ajv({
  allErrors: true,
  extendRefs: true
})

// load base model json schema
import { schema as baseModelSchema } from './validation/base.js';

// compile validation function
const validateBaseModel = ajv.compile( baseModelSchema );


export default {
  validateBaseModel,
  validatorFromJsonSchema
}



// build a validation function from a json schema
function validatorFromJsonSchema (schema) {
  return ajv.compile( schema );
}


