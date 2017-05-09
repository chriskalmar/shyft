
import { isEntity } from 'shift-engine';
import StorageTypeMemory from './StorageTypeMemory';
import _ from 'lodash';



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

          memoryDB[ entityName ].fieldTransformerMap[ attribute.gqlFieldName ] = attribute.name

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
            field.type = attribute.type
          }

          fields[ attribute.name ] = field;

        });

        return fields
      }
    }



    memoryDB[ entityName ] = {
      data: [],
      model,
      fieldTransformerMap: {},
    }

  })



  _.map(memoryDB, (entity) => {

    // lazy generate fields
    entity.model.fields = entity.model.fields()

  })



  return memoryDB;

}
