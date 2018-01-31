
import {
  passOrThrow,
  isArray,
  isMap,
} from '../util';

import { isEntity } from '../entity/Entity';
import { isAction } from '../action/Action';
import { isDataTypeUser } from '../datatype/DataTypeUser';
import { isStorageType } from '../storage/StorageType';


class Schema {

  constructor (setup = { entities: null, defaultStorageType: null, actions: null }) {

    this._entityMap = {}
    this._actionMap = {}
    this._isValidated = false
    this._userEntity = null

    const {
      entities,
      defaultStorageType,
      actions,
    } = setup


    if (defaultStorageType) {
      passOrThrow(
        isStorageType(defaultStorageType),
        () => 'Provided default storage type is invalid'
      )
    }

    this.defaultStorageType = defaultStorageType


    if (entities) {

      passOrThrow(
        isArray(entities, true),
        () => 'Schema needs \'entities\' to be an array of type Entity'
      )

      entities.map(entity => this.addEntity(entity))
    }


    if (actions) {

      passOrThrow(
        isArray(actions),
        () => 'Schema needs \'actions\' to be an array of type Action'
      )

      actions.map(entity => this.addAction(entity))
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

    if (entity.isUserEntity) {
      passOrThrow(
        !this._userEntity,
        () => `Entity '${entity.name}' cannot be set as user entity, ` +
          `'${this._userEntity.name}' is already the user entity`
      )

      this._userEntity = entity
    }


    if (this.defaultStorageType) {
      entity._injectStorageTypeBySchema(this.defaultStorageType)
    }


    entity._isRegistered = true
    this._entityMap[ entity.name ] = entity
    this._isValidated = false
  }


  getUserEntity (throwIfMissing) {

    passOrThrow(
      !throwIfMissing || this._userEntity,
      () => 'There is no user entity registered yet'
    )

    return this._userEntity
  }



  _lazyLoadMissingEntities () {

    let foundMissingCount = 0

    const entityNames = Object.keys(this._entityMap);

    entityNames.forEach((entityName) => {

      const entity = this._entityMap[ entityName ]
      const attributes = entity.getAttributes()

      const attributeNames = Object.keys(attributes);

      attributeNames.forEach((attributeName) => {

        const attribute = attributes[ attributeName ]

        if (isEntity(attribute.type)) {

          const targetEntity = attribute.type

          if (this._entityMap[ targetEntity.name ]) {
            passOrThrow(
              targetEntity._isRegistered,
              () => `Referenced entity '${targetEntity.name}' already registered with this schema`
            )
          }
          else {
            this.addEntity(targetEntity)
            foundMissingCount++
          }

        }
      })
    })

    if (foundMissingCount > 0) {
      this._lazyLoadMissingEntities()
    }
  }



  validate () {

    if (this._isValidated) {
      return
    }

    passOrThrow(
      isMap(this._entityMap, true),
      () => 'Schema has no entities'
    )

    this._lazyLoadMissingEntities()

    const entityNames = Object.keys(this._entityMap);

    entityNames.forEach((entityName) => {

      const entity = this._entityMap[ entityName ]
      const attributes = entity.getAttributes()

      const attributeNames = Object.keys(attributes);

      entity.getPermissions();

      attributeNames.forEach((attributeName) => {

        const attribute = attributes[ attributeName ]

        if (isEntity(attribute.type)) {

          const targetEntity = attribute.type

          passOrThrow(
            this._entityMap[ targetEntity.name ],
            () => `Entity '${targetEntity.name}' (referenced by '${entity.name}') ` +
              'needs to be registered with this schema'
          )

          // keep track of references
          targetEntity.referencedBy(entity.name, attributeName)

        }
        else if (isDataTypeUser(attribute.type)) {
          // replace with actual user entity
          attribute.type = this.getUserEntity(true)
        }
      })
    })

    this._isValidated = true
  }


  getEntities () {

    this.validate()

    return this._entityMap
  }



  addAction (action) {
    passOrThrow(
      isAction(action),
      () => 'Provided object to schema is not an action'
    )

    passOrThrow(
      !this._actionMap[ action.name ],
      () => `Action '${action.name}' already registered with this schema`
    )

    this._actionMap[ action.name ] = action
    this._isValidated = false
  }


  getActions () {
    return this._actionMap
  }


}


export default Schema
