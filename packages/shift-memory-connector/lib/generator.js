
import { isEntity } from 'shift-engine';
import StorageTypeMemory from './StorageTypeMemory';
import _ from 'lodash';

import {
  shaper,
} from 'json-shaper'


export const generateMemoryDB = (schema) => {

  const memoryDB = {}

  _.map(schema.getEntities(), (entity, entityName) => {

    if (String(entity.storageType) !== String(StorageTypeMemory)) {
      return
    }

    const model = {
      name: entityName,
      description: entity.description,

      fields: () => {
        const fields = {}

        _.map(entity.getAttributes(), (attribute) => {

          // skip for computed values
          if (attribute.resolve) {
            return
          }

          const localAttributeName = _.camelCase(attribute.name)

          memoryDB[ entityName ].dataShaperMap[ attribute.name ] = localAttributeName

          const field = {
            description: attribute.description,
          };


          // it's a reference
          if (isEntity(attribute.type)) {

            const targetEntity = attribute.type
            const targetEntityName = targetEntity.name

            field.type = memoryDB[ targetEntityName ].model
          }
          // it's a regular attribute
          else {
            field.type = StorageTypeMemory.convertToStorageDataType(attribute.type)
          }

          fields[ localAttributeName ] = field;

        });

        return fields
      }
    }



    memoryDB[ entityName ] = {
      data: [],
      model,
      dataShaperMap: {},
    }

  })



  _.map(memoryDB, (entity) => {

    // lazy generate fields
    entity.model.fields = entity.model.fields()

    // generate json shaper - translate database attribute names to schema attribute names
    entity.dataShaper = shaper(entity.dataShaperMap)
  })



  return memoryDB;

}
