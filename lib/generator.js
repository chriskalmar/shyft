
import StorageTypePostgres from './StorageTypePostgres';
import _ from 'lodash';

import {
  isEntity,
} from 'shift-engine';

import {
  shaper,
} from 'json-shaper'



export const loadModels = (sequelize, schema) => {

  const modelRegistry = {}

  _.map(schema.getEntities(), (entity, entityName) => {

    if (String(entity.storageType) !== String(StorageTypePostgres)) {
      return
    }

    const attributes = {}
    const references = []
    const dataShaperMap = {}

    _.map(entity.getAttributes(), (attribute) => {

      // skip for computed values
      if (attribute.resolve) {
        return
      }

      const attributeName = attribute.name
      const storageAttributeName = _.snakeCase(attribute.name)

      dataShaperMap[ attributeName ] = storageAttributeName

      let storageDataType

      // it's a reference
      if (isEntity(attribute.type)) {
        const primaryAttribute = attribute.type.getPrimaryAttribute()
        storageDataType = StorageTypePostgres.convertToStorageDataType(primaryAttribute.type)

        references.push({
          attributeName,
          targetEntityName: attribute.type.name,
        })
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
      dataShaper: shaper(dataShaperMap),
      references,
    }

  })



  _.map(modelRegistry, (entity) => {

    entity.references.map(({attributeName, targetEntityName}) => {
      const targetEntity = modelRegistry[ targetEntityName ]
      targetEntity.model.hasMany(entity.model, {
        foreignKey: {
          name: attributeName,
          allowNull: false
        }
      })

    })
  })


  return modelRegistry
}
