
import {
  passOrThrow,
  isArray,
} from '../util';

import { isEntity } from '../entity/Entity';

class Schema {

  constructor (setup = { entities: null }) {

    this._entityMap = {}

    const {
      entities,
    } = setup


    if (entities) {

      passOrThrow(
        isArray(entities),
        () => 'Schema needs \'entities\' to be an array of type Entity'
      )

      entities.map(entity => this.addEntity(entity))
    }

  }


  addEntity (entity) {

    passOrThrow(
      isEntity(entity),
      () => 'Provided object to schema is not an entity'
    )

    passOrThrow(
      !this._entityMap[ entity.name ],
      () => `Entity '${entity.name}' already registered with this schema`
    )

    this._entityMap[ entity.name ] = entity
  }

}


export default Schema
