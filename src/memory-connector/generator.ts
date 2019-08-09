import { StorageTypeMemory } from './StorageTypeMemory';
import * as _ from 'lodash';
import * as casual from 'casual';

import { shaper } from 'json-shaper';
import { isEntity } from '../engine/entity/Entity';

export const generateMemoryDB = schema => {
  const memoryDB = {};

  _.map(schema.getEntities(), (entity, entityName) => {
    if (String(entity.storageType) !== String(StorageTypeMemory)) {
      return;
    }

    const model = {
      name: entityName,
      description: entity.description,

      fields: () => {
        const fields = {};

        _.map(entity.getAttributes(), attribute => {
          // skip for computed values
          if (attribute.resolve) {
            return;
          }

          const localAttributeName = _.camelCase(attribute.name);

          memoryDB[entityName].dataShaperMap[
            attribute.name
          ] = localAttributeName;

          const field = {
            description: attribute.description,
            required: attribute.required,
          };

          // it's a reference
          if (isEntity(attribute.type)) {
            field.type = attribute.type;
          }
          // it's a regular attribute
          else {
            field.type = StorageTypeMemory.convertToStorageDataType(
              attribute.type,
            );
            field.dataGenerator =
              attribute.fake || convertDataTypeToCasualFunction(attribute.type);
          }

          fields[localAttributeName] = field;
        });

        return fields;
      },
    };

    memoryDB[entityName] = {
      data: [],
      model,
      dataShaperMap: {},
    };
  });

  _.map(memoryDB, entity => {
    // lazy generate fields
    entity.model.fields = entity.model.fields();

    // generate json shaper - translate database attribute names to schema attribute names
    entity.dataShaper = shaper(entity.dataShaperMap);
  });

  return memoryDB;
};

export const generateData = memoryDB => {
  // generate basic data
  _.forEach(memoryDB, entity => {
    _.times(_.random(10, 100), () => {
      generateItem(entity);
    });
  });

  // generate references
  _.forEach(memoryDB, ({ data, model }) => {
    _.forEach(model.fields, ({ type }, name) => {
      if (isEntity(type)) {
        if (memoryDB[type.name]) {
          const referencingData = memoryDB[type.name].data;

          const primaryAttribute = type.getPrimaryAttribute();
          const primaryAttributeName = primaryAttribute.gqlFieldName;

          data.map(item => {
            item[name] = _.sample(referencingData)[primaryAttributeName];
          });
        }
 else {
          data.map(item => {
            item[name] = null;
          });
        }
      }
    });
  });
};

function generateItem(entity) {
  const model = entity.model;
  const nextId = (entity.data.length + 1).toString();

  const item = {};

  _.forEach(model.fields, ({ required, dataGenerator }, name) => {
    if (!required && Math.random() > 0.5) {
      item[name] = null;
      return;
    }

    if (dataGenerator) {
      item[name] = dataGenerator();
    }
  });

  const primaryAttribute = model.getPrimaryAttribute();
  const primaryAttributeName = primaryAttribute.gqlFieldName;

  item[primaryAttributeName] = nextId;

  entity.data.push(item);

  return nextId;
}

const casualDataTypeMap = {
  DataTypeID: () => casual.integer(2 ^ 20, 2 ^ 31).toString(),
  DataTypeInteger: () => casual.integer(-2 ^ 10, 2 ^ 10),
  DataTypeBigInt: () => casual.integer(2 ^ 20, 2 ^ 31).toString(),
  DataTypeFloat: () => casual.double(-2 ^ 10, 2 ^ 10),
  DataTypeBoolean: () => casual.boolean,
  DataTypeString: () => casual.title,
  DataTypeJson: randomJson,
  DataTypeTimestamp: () => new Date(casual.unix_time * 1000),
  DataTypeTimestampTz: () => new Date(casual.unix_time * 1000),
  DataTypeDate: () => new Date(casual.unix_time * 1000),
  DataTypeTime: () => new Date(casual.unix_time * 1000),
  DataTypeTimeTz: () => new Date(casual.unix_time * 1000),
};

function convertDataTypeToCasualFunction(dataType) {
  return (
    casualDataTypeMap[String(dataType)] || casualDataTypeMap.DataTypeString
  );
}

function randomJson() {
  const ret = {};

  _.times(3, () => {
    const key = _.camelCase(casual.words(2));
    const value = Math.random() > 0.5 ? casual.title : casual.integer;

    ret[key] = value;
  });

  return ret;
}
