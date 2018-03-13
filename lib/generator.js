
import StorageTypePostgres from './StorageTypePostgres';
import _ from 'lodash';
import toposort from 'toposort';
import { generateIndexName } from './util';


import {
  isEntity,
  INDEX_UNIQUE,
  INDEX_GENERIC,
  mapOverProperties,
  isDataTypeEnum,
} from 'shift-engine';

import {
  shaper,
} from 'json-shaper'


const filterOperatorMap = {
  $ne: '$ne',

  $in: '$in',
  $notIn: '$not_in',

  $lt: '$lt',
  $lte: '$lte',

  $gt: '$gt',
  $gte: '$gte',

  $startsWith: '$starts_with',
  $contains: '$contains',
  $endsWith: '$ends_with',

  $notStartsWith: '$not_starts_with',
  $notContains: '$not_contains',
  $notEndsWith: '$not_ends_with',

  $not: '$not',
  $or: '$or',
  $and: '$and',
}


export const loadModels = (schema) => {

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
      const storageAttributeName = attribute.meta && attribute.meta.storageAttributeName
        ? attribute.meta.storageAttributeName
        : _.snakeCase(attribute.name)

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


      if (isDataTypeEnum(attribute.type)) {
        throw new Error('data type `enum` is not yet supported')
        // attributes[ attributeName ] = {
        //   type: storageDataType.nativeDataType,
        //   enum: attribute.type.values,
        //   nullable: !attribute.required,
        // }
      }
      else {
        attributes[ attributeName ] = {
          name: storageAttributeName,
          type: storageDataType.nativeDataType,
          primary: attribute.isPrimary,
          nullable: !attribute.required,
        }

        if (attribute.isPrimary) {
          attributes[attributeName].generated = (storageDataType.name === 'StorageDataTypeUUID')
            ? 'uuid'
            : 'increment'
        }

      }

    })



    const indices = {}

    if (entity.indexes) {

      entity.indexes.map((index) => {

        if (index.type === INDEX_UNIQUE || index.type === INDEX_GENERIC) {

          const indexAttributes = index.attributes.map(_.snakeCase)
          const indexName = generateIndexName(_.snakeCase(entityName), indexAttributes, 'key')

          indices[indexName]={
            target: entityName,
            columns: index.attributes,
            unique: index.type === INDEX_UNIQUE,
          }
        }

      })

    }

    const model = {
      name: entityName,
      columns: attributes,
      table: {
        name: _.snakeCase(entityName),
      },
      indices
    }

    modelRegistry[ entityName ] = {
      model,
      dataShaperMap,
      dataShaper: shaper(dataShaperMap),
      reverseDataShaper: shaper(_.invert(dataShaperMap)),
      filterShaper: shaper(_.extend(filterShaperMap, filterOperatorMap)),
      references,
    }

  })



  _.map(modelRegistry, (entity) => {
    entity.references.map(({sourceAttributeName, targetEntityName}) => {

      entity.model.relations = entity.model.relations || {}
      entity.model.relations[sourceAttributeName] = {
        target: targetEntityName,
        type: 'many-to-one',
        joinColumn: {
          name: entity.model.columns[sourceAttributeName].name,
        },
        onDelete: 'CASCADE'
      }

    })
  })


  return modelRegistry
}



export const generateMockData = async (storageInstance, schema) => {

  const edges = []
  const entities = schema.getEntities()
  const mockInstancesMemory = {}

  _.map(entities, (entity) => {
    _.map(entity.getAttributes(), (attribute) => {
      if (isEntity(attribute.type)) {

        // skip cyclic dependencies
        if (entity.name === attribute.type.name) {
          return
        }

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
        await generateItem(storageInstance, entity, mockInstancesMemory)
      }
    }
    catch(err) {
      console.error(err)
    }

  }

}



async function generateItem(storageInstance, entity, mockInstancesMemory) {

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


  const manager = storageInstance.manager;
  let instance

  const result = await manager
    .createQueryBuilder()
    .insert()
    .into(entityName)
    .values(item)
    .returning('*')
    .execute()

  if (result.length) {
    instance = result[0]

    const { name: primaryAttributeName } = entity.getPrimaryAttribute()

    mockInstancesMemory[ entityName ] = mockInstancesMemory[ entityName ] || []
    mockInstancesMemory[entityName].push(instance[primaryAttributeName])
  }

}
