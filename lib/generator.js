
import StorageTypePostgres from './StorageTypePostgres';
import _ from 'lodash';
import {
  isEntity,
} from 'shift-engine';



export const loadModels = (sequelize, schema) => {

  const modelRegistry = {}

  _.map(schema.getEntities(), (entity, entityName) => {

    if (String(entity.storageType) !== String(StorageTypePostgres)) {
      return
    }

    const attributes = {}

    _.map(entity.getAttributes(), (attribute) => {

      // skip for computed values
      if (attribute.resolve) {
        return
      }

      const attributeName = attribute.name
      const storageAttributeName = _.snakeCase(attribute.name)

      let storageDataType

      // it's a reference
      if (isEntity(attribute.type)) {
      }
      // it's a regular attribute
      else {
        storageDataType = StorageTypePostgres.convertToStorageDataType(attribute.type)
      }


      attributes[ attributeName ] = {
        field: storageAttributeName,
        type: storageDataType.nativeDataType,
        primaryKey: attribute.isPrimary,
        autoIncrement: attribute.isPrimary,
        allowNull: !attribute.required,
      }

    })


    const model = sequelize.define(entityName, attributes, {
      comment: entity.description,
      underscored: true,
      tableName: _.snakeCase(entityName),
      timestamps: true,
    })


    modelRegistry[ entityName ] = {
      model,
      dataShaperMap: {},
    }

  })


  return modelRegistry
}
