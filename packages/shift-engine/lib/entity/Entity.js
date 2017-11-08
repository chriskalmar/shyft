
import {
  passOrThrow,
  resolveFunctionMap,
  isMap,
  isArray,
  isFunction,
  mapOverProperties,
} from '../util';

import {
  ATTRIBUTE_NAME_PATTERN,
  attributeNameRegex,
  STATE_NAME_PATTERN,
  stateNameRegex,
} from '../constants';

import { isIndex, INDEX_UNIQUE } from '../index/Index';
import Mutation, {
  isMutation,
  defaultEntityMutations,
  MUTATION_TYPE_CREATE,
} from '../mutation/Mutation';

import {
  isPermission,
  generatePermissionDescription,
  findMissingPermissionAttributes,
  findInvalidPermissionAttributes,
} from '../permission/Permission';

import { isDataType } from '../datatype/DataType';
import { isStorageType } from '../storage/StorageType';
import { StorageTypeNull } from '../storage/StorageTypeNull';

import {
  systemAttributePrimary,
  systemAttributesTimeTracking,
  systemAttributesUserTracking,
  systemAttributeState,
} from './systemAttributes';

import _ from 'lodash';


class Entity {

  constructor (setup = {}) {

    const {
      name,
      description,
      attributes,
      storageType,
      isUserEntity,
      includeTimeTracking,
      includeUserTracking,
      indexes,
      mutations,
      permissions,
      states,
    } = setup

    passOrThrow(name, () => 'Missing entity name')
    passOrThrow(description, () => `Missing description for entity '${name}'`)
    passOrThrow(attributes, () => `Missing attributes for entity '${name}'`)

    passOrThrow(
      isMap(attributes) || isFunction(attributes),
      () => `Entity '${name}' needs an attribute definition as a map or a function returning such a map`
    )

    this.name = name
    this.description = description
    this.isUserEntity = !!isUserEntity
    this.includeTimeTracking = !!includeTimeTracking
    this.includeUserTracking = !!includeUserTracking
    this._attributesMap = attributes
    this._primaryAttribute = null
    this.referencedByEntities = []

    if (storageType) {
      passOrThrow(
        isStorageType(storageType),
        () => `Entity '${name}' needs a valid storage type (defaults to 'StorageTypeNull')`
      )
    }
    else {
      this.storageType = StorageTypeNull
      this.isFallbackStorageType = true
      this._exposeStorageAccess()
    }



    if (indexes) {

      this.indexes = indexes

      passOrThrow(
        isArray(indexes),
        () => `Entity '${name}' indexes definition needs to be an array of indexes`
      )

      indexes.map((index, idx) => {
        passOrThrow(
          isIndex(index),
          () => `Invalid index definition for entity '${name}' at position '${idx}'`
        )

      })
    }


    if (mutations) {

      this.mutations = mutations

      passOrThrow(
        isArray(mutations),
        () => `Entity '${name}' mutations definition needs to be an array of mutations`
      )

      mutations.map((mutation, idx) => {
        passOrThrow(
          isMutation(mutation),
          () => `Invalid mutation definition for entity '${name}' at position '${idx}'`
        )

      })
    }


    if (permissions) {

      this.permissions = permissions

      passOrThrow(
        isMap(permissions),
        () => `Entity '${name}' permissions definition needs to be an object`
      )


      if (permissions.read) {
        passOrThrow(
          isPermission(permissions.read),
          () => `Invalid 'read' permission definition for entity '${name}'`
        )
      }

      if (permissions.find) {
        passOrThrow(
          isPermission(permissions.find),
          () => `Invalid 'find' permission definition for entity '${name}'`
        )
      }

      if (permissions.mutations) {
        passOrThrow(
          isMap(permissions.mutations),
          () => `Entity '${name}' permissions definition for mutations needs to be a map of mutations and permissions`
        )

        const mutationNames = Object.keys(permissions.mutations);
        mutationNames.map((mutationName, idx) => {
          passOrThrow(
            isPermission(permissions.mutations[ mutationName ]),
            () => `Invalid mutation permission definition for entity '${name}' at position '${idx}'`
          )

        })
      }

    }


    if (states) {
      this.states = states

      passOrThrow(
        isMap(states),
        () => `Entity '${name}' states definition needs to be a map of state names and their unique ID`
      )

      const stateNames = Object.keys(states);
      const uniqueIds = []

      stateNames.map(stateName => {
        const stateId = states[ stateName ]
        uniqueIds.push(stateId)

        passOrThrow(
          stateNameRegex.test(stateName),
          () => `Invalid state name '${stateName}' in entity '${name}' (Regex: /${STATE_NAME_PATTERN}/)`
        )

        passOrThrow(
          stateId === parseInt(stateId, 10)  &&  stateId > 0,
          () => `State '${stateName}' in entity '${name}' has an invalid unique ID (needs to be a positive integer)`
        )
      })

      passOrThrow(
        uniqueIds.length === _.uniq(uniqueIds).length,
        () => `Each state defined in entity '${name}' needs to have a unique ID`
      )
    }

  }


  _injectStorageTypeBySchema (storageType) {

    passOrThrow(
      isStorageType(storageType),
      () => `Provided storage type to entity '${this.name}' is invalid`
    )

    if (this.isFallbackStorageType) {
      this.storageType = storageType
      this._exposeStorageAccess()
    }
  }


  _exposeStorageAccess () {
    this.findOne = this.storageType.findOne
    this.find = this.storageType.find
  }



  getAttributes () {
    if (this._attributes) {
      return this._attributes
    }

    const ret = this._attributes = this._processAttributeMap()
    this._processIndexes()
    this._processMutations()
    this._processPermissions()
    return ret
  }


  getMutations () {
    return this.mutations
  }

  getMutationByName (name) {
    return this.mutations.find( mutation => String(mutation) === name )
  }


  getPermissions () {
    return this.permissions
  }


  getIndexes () {
    return this.indexes
  }


  getStates () {
    return this.states
  }

  hasStates () {
    return !!this.states
  }


  _collectSystemAttributes (attributeMap) {

    const list = []

    if (!this.getPrimaryAttribute()) {
      this._checkSystemAttributeNameCollision(attributeMap, systemAttributePrimary.name)
      attributeMap[ systemAttributePrimary.name ] = systemAttributePrimary
      list.push(systemAttributePrimary.name)
    }

    if (this.includeTimeTracking) {
      systemAttributesTimeTracking.map(attribute => {
        this._checkSystemAttributeNameCollision(attributeMap, attribute.name)
        attributeMap[ attribute.name ] = attribute
        list.push(attribute.name)
      })
    }

    if (this.includeUserTracking && !this.isUserEntity) {
      systemAttributesUserTracking.map(attribute => {
        this._checkSystemAttributeNameCollision(attributeMap, attribute.name)
        attributeMap[ attribute.name ] = attribute
        list.push(attribute.name)
      })
    }

    if (this.hasStates()) {
      this._checkSystemAttributeNameCollision(attributeMap, systemAttributeState.name)
      attributeMap[ systemAttributeState.name ] = systemAttributeState
      list.push(systemAttributeState.name)
    }

    return list
  }



  _checkSystemAttributeNameCollision (attributeMap, attributeName) {
    passOrThrow(
      !attributeMap[ attributeName ],
      () => `Attribute name collision with system attribute '${attributeName}' in entity '${this.name}'`
    )
  }


  _processAttribute (rawAttribute, attributeName) {

    passOrThrow(
      attributeNameRegex.test(attributeName),
      () => `Invalid attribute name '${attributeName}' in entity '${this.name}' (Regex: /${ATTRIBUTE_NAME_PATTERN}/)`
    )

    const attribute = {
      ...rawAttribute,
      isPrimary: !!rawAttribute.isPrimary,
      isUnique: !!rawAttribute.isPrimary,
      required: !!rawAttribute.required,
      hidden: !!rawAttribute.hidden,
      name: attributeName
    }

    passOrThrow(attribute.description, () => `Missing description for '${this.name}.${attributeName}'`)

    passOrThrow(
      isDataType(attribute.type) || (attribute.type instanceof Entity),
      () => `'${this.name}.${attributeName}' has invalid data type '${String(attribute.type)}'`
    )

    if (attribute.targetAttributesMap) {
      passOrThrow(
        attribute.type instanceof Entity,
        () => `'${this.name}.${attributeName}' cannot have a targetAttributesMap as it is not a reference`
      )

      passOrThrow(
        isMap(attribute.targetAttributesMap),
        () => `targetAttributesMap for '${this.name}.${attributeName}' needs to be a map`
      )

      const localAttributeNames = Object.keys(attribute.targetAttributesMap);
      localAttributeNames.map(localAttributeName => {
        const targetAttribute = attribute.targetAttributesMap[ localAttributeName ]

        passOrThrow(
          isMap(targetAttribute) && targetAttribute.name && targetAttribute.type,
          () => `targetAttributesMap for '${this.name}.${attributeName}' needs to be a map between local and target attributes`
        )

        // check if attribute is found in target entity
        attribute.type.referenceAttribute(targetAttribute.name)
      })
    }

    if (attribute.isPrimary) {
      passOrThrow(
        !this._primaryAttribute,
        () => `'${this.name}.${attributeName}' cannot be set as primary attribute,` +
          `'${this._primaryAttribute.name}' is already the primary attribute`
      )

      passOrThrow(
        isDataType(attribute.type),
        () => `Primary attribute '${this.name}.${attributeName}' has invalid data type '${String(attribute.type)}'`
      )

      this._primaryAttribute = attribute
    }

    passOrThrow(
      !attribute.resolve || isFunction(attribute.resolve),
      () => `'${this.name}.${attributeName}' has an invalid resolve function'`
    )

    passOrThrow(
      !attribute.defaultValue || isFunction(attribute.defaultValue),
      () => `'${this.name}.${attributeName}' has an invalid defaultValue function'`
    )

    passOrThrow(
      !attribute.validate || isFunction(attribute.validate),
      () => `'${this.name}.${attributeName}' has an invalid validate function'`
    )

    return attribute
  }


  _processAttributeMap () {

    // if it's a function, resolve it to get that map
    const attributeMap = resolveFunctionMap(this._attributesMap);

    passOrThrow(
      isMap(attributeMap),
      () => `Attribute definition function for entity '${this.name}' does not return a map`
    )


    const attributeNames = Object.keys(attributeMap);
    passOrThrow(
      attributeNames.length > 0,
      () => `Entity '${this.name}' has no attributes defined`
    )

    const resultAttributes = {}

    attributeNames.forEach((attributeName) => {
      resultAttributes[ attributeName ] = this._processAttribute(attributeMap[ attributeName ], attributeName)
    })

    attributeNames.forEach((attributeName) => {
      const attribute = resultAttributes[ attributeName ]

      if (attribute.targetAttributesMap) {
        const localAttributeNames = Object.keys(attribute.targetAttributesMap);
        localAttributeNames.map(localAttributeName => {
          passOrThrow(
            resultAttributes[ localAttributeName ],
            () => `Unknown local attribute '${localAttributeName}' used in targetAttributesMap ` +
              `for '${this.name}.${attributeName}'`
          )

        })
      }
    })


    const systemAttributeNames = this._collectSystemAttributes(attributeMap)

    systemAttributeNames.forEach((attributeName) => {
      resultAttributes[ attributeName ] = this._processAttribute(attributeMap[ attributeName ], attributeName)
      resultAttributes[ attributeName ].isSystemAttribute = true
    })

    return resultAttributes
  }


  getPrimaryAttribute () {
    return this._primaryAttribute
  }


  referenceAttribute (attributeName) {
    const attributes = this.getAttributes()

    passOrThrow(
      attributes[ attributeName ],
      () => `Cannot reference attribute '${this.name}.${attributeName}' as it does not exist`
    )

    return attributes[ attributeName ]
  }


  _processIndexes () {
    if (this.indexes) {

      this.indexes.map((index) => {
        index.attributes.map((attributeName) => {

          passOrThrow(
            this._attributes[ attributeName ],
            () => `Cannot use attribute '${this.name}.${attributeName}' in index as it does not exist`
          )

          if (index.type === INDEX_UNIQUE && index.attributes.length === 1) {
            this._attributes[ attributeName ].isUnique = true
          }

        })
      })
    }
  }


  _processMutations () {
    const _self = this

    const coreAttributeNames = []
    const requiredAttributeNames = []

    mapOverProperties(_self.getAttributes(), (attribute, attributeName) => {
      if (!attribute.isSystemAttribute) {
        coreAttributeNames.push(attributeName)

        if (attribute.required && !attribute.defaultValue) {
          requiredAttributeNames.push(attributeName)
        }
      }
    })


    if (!this.mutations) {
      this.mutations = []
    }

    const mutationNames = []

    this.mutations.map((mutation) => {

      passOrThrow(
        !mutationNames.includes(mutation.name),
        () => `Duplicate mutation name '${mutation.name}' found in '${this.name}'`
      )

      mutationNames.push(mutation.name)

      if (mutation.attributes) {
        mutation.attributes.map((attributeName) => {
          passOrThrow(
            this._attributes[ attributeName ],
            () => `Cannot use attribute '${this.name}.${attributeName}' in mutation '${this.name}.${mutation.name}' as it does not exist`
          )
        })

        if (mutation.type === MUTATION_TYPE_CREATE) {
          const missingAttributeNames = requiredAttributeNames.filter(requiredAttributeName => {
            return !mutation.attributes.includes(requiredAttributeName)
          })

          passOrThrow(
            missingAttributeNames.length === 0,
            () => `Missing required attributes in mutation '${this.name}.${mutation.name}' need to have a defaultValue() function: [ ${missingAttributeNames.join(', ')} ]`
          )
        }
      }


      const checkMutationStates = (stateStringOrArray) => {

        const stateNames = isArray(stateStringOrArray)
          ? stateStringOrArray
          : [ stateStringOrArray ]

        const states = _self.getStates()

        stateNames.map(stateName => {
          passOrThrow(
            states[ stateName ],
            () => `Unknown state '${stateName}' used in mutation '${this.name}.${mutation.name}'`
          )
        })
      }


      if (mutation.fromState) {
        passOrThrow(
          _self.hasStates(),
          () => `Mutation '${this.name}.${mutation.name}' cannot define fromState as the entity is stateless`
        )

        checkMutationStates(mutation.fromState)
      }


      if (mutation.toState) {
        passOrThrow(
          _self.hasStates(),
          () => `Mutation '${this.name}.${mutation.name}' cannot define toState as the entity is stateless`
        )

        checkMutationStates(mutation.toState)
      }
    })


    defaultEntityMutations.map(defaultMutation => {
      if (!mutationNames.includes(defaultMutation.name)) {
        this.mutations.push(new Mutation({
          name: defaultMutation.name,
          type: defaultMutation.type,
          description: defaultMutation.description(this.name),
          attributes: coreAttributeNames
        }))
      }
    })

  }



  _validatePermissionAttributes (permission, mutationName) {

    const invalidAttribute = findMissingPermissionAttributes(permission, this)

    passOrThrow(
      !invalidAttribute,
      () => `Cannot use attribute '${invalidAttribute}' in '${this.name}.permissions' for '${mutationName}' as it does not exist`
    )

    findInvalidPermissionAttributes(permission, this)
  }


  _processPermissions () {

    if (this.permissions) {

      if (this.permissions.find) {
        this.descriptionPermissionsFind = generatePermissionDescription(this.permissions.find)
        this._validatePermissionAttributes(this.permissions.find, 'find')
      }

      if (this.permissions.read) {
        this.descriptionPermissionsRead = generatePermissionDescription(this.permissions.read)
        this._validatePermissionAttributes(this.permissions.read, 'read')
      }

      if (this.permissions.mutations && this.mutations) {
        const permissionMutationNames = Object.keys(this.permissions.mutations);

        const mutationNames = this.mutations.map((mutation) => mutation.name)

        permissionMutationNames.map(permissionMutationName => {
          passOrThrow(
            mutationNames.includes(permissionMutationName),
            () => `Unknown mutation '${permissionMutationName}' used for permissions in entity '${this.name}'`
          )
        })

        this.mutations.map((mutation) => {
          const mutationName = mutation.name
          const permission = this.permissions.mutations[ mutationName ]

          if (permission) {

            this._validatePermissionAttributes(permission, mutationName)

            const descriptionPermissions = generatePermissionDescription(permission)
            if (descriptionPermissions) {
              mutation.description += descriptionPermissions
            }
          }
        })
      }
    }
  }



  referencedBy (sourceEntityName, sourceAttributeName) {
    passOrThrow(
      sourceEntityName,
      () => `Entity '${this.name}' expects an entity to be referenced by`
    )

    passOrThrow(
      sourceAttributeName,
      () => `Entity '${this.name}' expects a source attribute to be referenced by`
    )

    let found = false;

    this.referencedByEntities.map(entry => {
      if (entry.sourceEntityName === sourceEntityName  &&  entry.sourceAttributeName === sourceAttributeName ) {
        found = true
      }
    })

    if (!found) {
      this.referencedByEntities.push({
        sourceEntityName,
        sourceAttributeName,
      })
    }
  }


  getStorageType () {
    return this.storageType
  }


  toString() {
    return this.name
  }

}


export default Entity


export const isEntity = (obj) => {
  return (obj instanceof Entity)
}
