
'use strict';

class DataType {

  constructor (name, jsonSchemaType, dbType) {

    if (!name) {
      throw new Error ('Missing data type name')
    }

    if (!jsonSchemaType) {
      throw new Error (`Missing json schema type for data type '${this.name}'`)
    }

    if (!dbType) {
      throw new Error (`Missing database type for data type '${this.name}'`)
    }

    // name of the data type used in model definition
    this.name = name

    // json schema data type name
    this.jsonSchemaType = jsonSchemaType

    // native database data type name
    this.dbType = dbType
  }



  getName () {
    return this.name
  }


  getJsonSchemaType () {
    return this.jsonSchemaType
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


  // get a list of required properties for the json schema setup
  getRequiredJsonSchemaProperties () {
    return [
      'name',
      'type',
      'description'
    ]
  }


  generateJsonSchema () {
    return {
      type: this.jsonSchemaType,
      additionalProperties: false,
      required: this.getRequiredJsonSchemaProperties()

    }
  }

}



module.exports = DataType
