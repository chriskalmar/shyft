
import StorageTypePostgres from './StorageTypePostgres';
import _ from 'lodash';
import toposort from 'toposort';
import { generateIndexName } from './util';

import {
  isEntity,
  INDEX_UNIQUE,
  mapOverProperties,
} from 'shift-engine';

import {
  shaper,
} from 'json-shaper'



const filterOperatorMap = {
  $ne: '$not',

  $in: '$in',
  $notIn: '$not_in',

  $lt: '$lt',
  $lte: '$lte',

  $gt: '$gt',
  $gte: '$gte',

  $iLike: (data) => {
    const iLikes = []

    if (data.$contains) {
      iLikes.push(`%${data.$contains}%`)
    }

    if (data.$starts_with) {
      iLikes.push(`${data.$starts_with}%`)
    }

    if (data.$ends_with) {
      iLikes.push(`%${data.$ends_with}`)
    }

    if (iLikes.length > 1) {
      return {
        $all: iLikes
      }
    }
    else if (iLikes.length === 1) {
      return iLikes[0]
    }

    return undefined
  },

  $notILike: (data) => {
    const notILikes = []
    if (data.$not_contains) {
      notILikes.push(`%${data.$not_contains}%`)
    }

    if (data.$not_starts_with) {
      notILikes.push(`${data.$not_starts_with}%`)
    }

    if (data.$not_ends_with) {
      notILikes.push(`%${data.$not_ends_with}`)
    }

    if (notILikes.length > 1) {
      return {
        $all: notILikes
      }
    }
    else if (notILikes.length === 1) {
      return notILikes[0]
    }

    return undefined
  },

  $or: '$or',
  $and: '$and',
}


export const loadModels = (sequelize, schema) => {

  const modelRegistry = {}

  _.map(schema.getEntities(), (entity, entityName) => {

    if (String(entity.storageType) !== String(StorageTypePostgres)) {
      return
    }

    const attributes = {}
    const references = []
    const dataShaperMap = {}
    const filterShaperMap = {}

    _.map(entity.getAttributes(), (attribute) => {

      // skip for computed values
      if (attribute.resolve) {
        return
      }

      const attributeName = attribute.name
      const storageAttributeName = _.snakeCase(attribute.name)

      dataShaperMap[ attributeName ] = storageAttributeName
      filterShaperMap[ attributeName ] = attributeName

      let storageDataType

      // it's a reference
      if (isEntity(attribute.type)) {
        const primaryAttribute = attribute.type.getPrimaryAttribute()
        storageDataType = StorageTypePostgres.convertToStorageDataType(primaryAttribute.type)

        if (attribute.targetAttributesMap) {
          // sequelize doesn't support composite foreign keys yet (so this has no impact):
          // https://github.com/sequelize/sequelize/issues/311
          mapOverProperties(attribute.targetAttributesMap, (targetAttribute, sourceAttributeName) => {
            references.push({
              sourceAttributeName,
              targetAttributeName: targetAttribute.name,
              targetEntityName: attribute.type.name,
            })
          })
        }
        else {
          references.push({
            sourceAttributeName: attributeName,
            targetAttributeName: primaryAttribute.name,
            targetEntityName: attribute.type.name,
          })
        }
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


    const indexes = []

    if (entity.indexes) {

      entity.indexes.map((index) => {

        if (index.type === INDEX_UNIQUE) {

          const indexAttributes = index.attributes.map(_.snakeCase)

          indexes.push({
            name: generateIndexName(_.snakeCase(entityName), indexAttributes, 'key'),
            type: 'UNIQUE',
            fields: indexAttributes,
          })

        }

      })

    }


    const model = sequelize.define(entityName, attributes, {
      comment: entity.description,
      underscored: true,
      tableName: _.snakeCase(entityName),
      timestamps: false,
      indexes,
    })


    modelRegistry[ entityName ] = {
      model,
      dataShaper: shaper(dataShaperMap),
      reverseDataShaper: shaper(_.invert(dataShaperMap)),
      filterShaper: shaper(_.extend(filterShaperMap, filterOperatorMap)),
      references,
    }

  })



  _.map(modelRegistry, (entity) => {
    entity.references.map(({sourceAttributeName, targetAttributeName, targetEntityName}) => {
      const targetEntity = modelRegistry[ targetEntityName ]

      targetEntity.model.hasMany(entity.model, {
        sourceKey: targetAttributeName,
        foreignKey: {
          name: sourceAttributeName,
          allowNull: false
        }
      })

      entity.model.belongsTo(targetEntity.model, {
        targetKey: targetAttributeName,
        foreignKey: {
          name: sourceAttributeName,
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

  _.map(entities, (entity) => {
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

  // add independent entities
  _.map(entities, (entity) => {
    if (dependencySortedEntityNames.indexOf(entity.name) === -1) {
      dependencySortedEntityNames.push(entity.name)
    }
  })

  for (let e=0; e < dependencySortedEntityNames.length; e++) {
    const entityName = dependencySortedEntityNames[ e ]
    const entity = entities[ entityName ]

    if (String(entity.storageType) !== String(StorageTypePostgres)) {
      return
    }

    try {
      for(let i=0; i < _.random(10, 100); i++) {
        await generateItem(modelRegistry, entity, mockInstancesMemory)
      }
    }
    catch(err) {
      console.error(err)
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
