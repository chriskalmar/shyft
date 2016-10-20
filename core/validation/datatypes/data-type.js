
'use strict';

class DataType {

  constructor (name, dbType) {

    if (!name) {
      throw new Error ('Missing data type name')
    }

    if (!dbType) {
      throw new Error (`Missing database type for data type '${this.name}'`)
    }

    // name of the data type used in model definition
    this.name = name

    // native database data type name
    this.dbType = dbType
  }



  getName () {
    return this.name
  }


  getDbType () {
    return this.dbType
  }


  // get default settings for json schema setup
  getJsonSchemaDefaults () {
    throw new Error (`Missing implementation of getJsonSchemaDefaults() for data type '${this.name}'`)
  }


  // get a list of properties that will be copied from the model definition into the json schema setup
  getAcceptedJsonSchemaProperties () {
    throw new Error (`Missing implementation of getAcceptedJsonSchemaProperties() for data type '${this.name}'`)
  }

}



module.exports = DataType
