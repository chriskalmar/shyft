
'use strict';

module.exports = processor


// return the name of the model domain
function processor(entityModel) {

  return {
    name: entityModel.domain
  }

}



