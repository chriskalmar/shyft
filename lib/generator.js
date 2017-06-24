
import StorageTypePostgres from './StorageTypePostgres';
import _ from 'lodash';
import toposort from 'toposort';

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
      timestamps: entity.includeTimeTracking,
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



export const generateMockData = async (modelRegistry, schema) => {

  const edges = []
  const entities = schema.getEntities()
  const mockInstancesMemory = {}

  _.map(schema.getEntities(), (entity) => {
    _.map(entity.getAttributes(), (attribute) => {
      if (isEntity(attribute.type)) {
        edges.push([
          attribute.type.name,
          entity.name
        ])
      }
    })
  })


  const dependencySortedEntityNames = toposort(edges)

  for (let e=0; e < dependencySortedEntityNames.length; e++) {
    const entityName = dependencySortedEntityNames[ e ]
    const entity = entities[ entityName ]

    if (String(entity.storageType) !== String(StorageTypePostgres)) {
      return
    }

    for(let i=0; i < _.random(10, 100); i++) {
      await generateItem(modelRegistry, entity, mockInstancesMemory)
    }

  }

}



async function generateItem(modelRegistry, entity, mockInstancesMemory) {

  const entityName = entity.name
  const item = {}

  _.map(entity.getAttributes(), ({ type, isPrimary, required, mock }, name) => {

    if (isPrimary) {
      return
    }

    if (!required && Math.random() > 0.5) {
      return
    }

    if (isEntity(type)) {
      item[ name ] = _.sample(mockInstancesMemory[ type.name ])
    }
    else {
      const mockDataGenerator = mock || type.mock

      if (mockDataGenerator) {
        item[ name ] = mockDataGenerator()
      }
    }
  })


  const model = modelRegistry[ entityName ].model

  const instance = await model.create(item)

  mockInstancesMemory[ entityName ] = mockInstancesMemory[ entityName ] || []
  mockInstancesMemory[ entityName ].push(instance.id)

}
