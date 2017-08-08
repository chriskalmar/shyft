
import {
  passOrThrow,
  resolveFunctionMap,
  isMap,
  isArray,
  isFunction,
} from '../util';

import {
  ATTRIBUTE_NAME_PATTERN,
  attributeNameRegex,
} from '../constants';

import { isIndex, INDEX_UNIQUE } from '../index/Index';
import { isMutation } from '../mutation/Mutation';
import { isDataType } from '../datatype/DataType';
import { isStorageType } from '../storage/StorageType';
import { StorageTypeNull } from '../storage/StorageTypeNull';

import {
  systemAttributePrimary,
  systemAttributesTimeTracking,
  systemAttributesUserTracking,
} from './systemAttributes';



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
          () => `Invalid index defintion for entity '${name}' at position '${idx}'`
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
          () => `Invalid mutation defintion for entity '${name}' at position '${idx}'`
        )

      })
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
    const ret = this._attributes || (this._attributes = this._processAttributeMap())
    this._processIndexes()
    this._processMutations()
    return ret
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
    if (this.mutations) {

      this.mutations.map((mutation) => {
        mutation.attributes.map((attributeName) => {

          passOrThrow(
            this._attributes[ attributeName ],
            () => `Cannot use attribute '${this.name}.${attributeName}' in mutation as it does not exist`
          )

        })
      })
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


  toString() {
    return this.name
  }

}


export default Entity


export const isEntity = (obj) => {
  return (obj instanceof Entity)
}
