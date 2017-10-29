
import {
  passOrThrow,
  isMap,
  isArray,
} from '../util';

import { isEntity } from '../entity/Entity';
import { isDataTypeUser } from '../datatype/DataTypeUser';
import _ from 'lodash';


/*
  all permission rules are combined with OR
*/


const compatibilityList = [
  [ 'everyone', ],
  [ 'authenticated', ],
  [ 'role', 'ownerAttribute', 'lookup', 'value' ],
]



class Permission {

  static EVERYONE = (new Permission()).everyone()
  static AUTHENTICATED = (new Permission()).authenticated()

  everyoneCanAccess = false
  authenticatedCanAccess = false
  types = {}
  roles = []
  ownerAttributes = []
  lookups = []
  values = []


  constructor () {
    return this
  }


  _checkCompatibility(type) {
    this.types[ type ] = true

    compatibilityList.map(list => {
      let found = 0
      let notFound = 0

      Object.keys(this.types).map(key => {
        if (list.includes(key)) {
          found++
        }
        else {
          notFound++
        }
      })

      passOrThrow(
        (found > 0 && notFound === 0) || (found === 0 && notFound > 0),
        () => `Permission type '${type}' is incompatible with other types`
      )
    })
  }


  everyone () {
    this._checkCompatibility('everyone')
    this.everyoneCanAccess = true
    return this
  }


  authenticated () {
    this._checkCompatibility('authenticated')
    this.authenticatedCanAccess = true
    return this
  }


  role (name) {
    this._checkCompatibility('role')

    passOrThrow(
      name,
      () => 'Permission type \'role\' expects an role name'
    )

    this.roles.push(name)

    passOrThrow(
      this.roles.length === _.uniq(this.roles).length,
      () => `Duplicate role '${name}' for permission type \'role\'`
    )

    return this
  }



  ownerAttribute (attributeName) {
    this._checkCompatibility('ownerAttribute')

    passOrThrow(
      attributeName,
      () => 'Permission type \'ownerAttribute\' expects an attribute name'
    )

    this.ownerAttributes.push(attributeName)

    passOrThrow(
      this.ownerAttributes.length === _.uniq(this.ownerAttributes).length,
      () => `Duplicate attribute name '${attributeName}' for permission type \'ownerAttribute\'`
    )

    return this
  }


  lookup (entity, lookupMap) {
    this._checkCompatibility('lookup')

    passOrThrow(
      isEntity(entity),
      () => 'Permission type \'lookup\' expects an entity'
    )
    passOrThrow(
      isMap(lookupMap, true),
      () => 'Permission type \'lookup\' expects a lookupMap'
    )

    this.lookups.push({
      entity,
      lookupMap,
    })

    return this
  }


  value (attributeName, value) {
    this._checkCompatibility('value')

    passOrThrow(
      attributeName,
      () => 'Permission type \'value\' expects an attribute name'
    )
    passOrThrow(
      typeof value !== 'undefined',
      () => 'Permission type \'value\' expects a value'
    )

    this.values.push({
      attributeName,
      value,
    })

    return this
  }



  toString() {
    return 'Permission Object'
  }

}


export default Permission


export const isPermission = (obj) => {
  return (obj instanceof Permission)
}


export const findInvalidPermissionAttributes = (permission, entity) => {

  const attributes = entity.getAttributes()

  permission.ownerAttributes.map(ownerAttribute => {
    const attribute = attributes[ ownerAttribute ]

    passOrThrow(
      attribute && (
        isDataTypeUser(attribute.type) ||
        ( isEntity(attribute.type) && attribute.type.isUserEntity )
      ),
      () => `Cannot use attribute '${ownerAttribute}' in '${entity.name}.permissions' as 'ownerAttribute' as it is not a reference to the User entity`
    )
  })

}


export const findMissingPermissionAttributes = (permission, permissionEntity) => {

  const entityAttributeNames = Object.keys(permissionEntity.getAttributes())

  const missingOwnerAttribute = permission.ownerAttributes.find(ownerAttribute => !entityAttributeNames.includes(ownerAttribute))
  if (missingOwnerAttribute) {
    return missingOwnerAttribute
  }

  let missingLookupAttribute
  permission.lookups.map(({entity, lookupMap}) => {
    const lookupEntityAttributes = entity.getAttributes()
    const lookupEntityAttributeNames = Object.keys(lookupEntityAttributes)

    _.forEach(lookupMap, (targetAttribute, sourceAttribute) => {
      if (!entityAttributeNames.includes(sourceAttribute)) {
        missingLookupAttribute = sourceAttribute
        return
      }
      else if (!lookupEntityAttributeNames.includes(targetAttribute)) {
        missingLookupAttribute = `${entity.name}.${targetAttribute}`
        return
      }
    })
  })
  if (missingLookupAttribute) {
    return missingLookupAttribute
  }

  const missingValueAttribute = permission.values.find(({attributeName}) => !entityAttributeNames.includes(attributeName))
  if (missingValueAttribute) {
    return missingValueAttribute.attributeName
  }

  return false
}


export const generatePermissionDescription = (permission) => {

  const lines = []

  passOrThrow(
    isPermission(permission),
    () => 'generatePermissionDescription needs a valid permission object'
  )

  if (permission.everyoneCanAccess) {
    lines.push('everyone')
  }

  if (permission.authenticatedCanAccess) {
    lines.push('authenticated')
  }

  if (permission.roles.length > 0) {
    lines.push(`roles: ${permission.roles.join(', ')}`)
  }

  if (permission.ownerAttributes.length > 0) {
    lines.push(`ownerAttributes: ${permission.ownerAttributes.join(', ')}`)
  }

  if (permission.lookups.length > 0) {
    const lookupBullets = permission.lookups.reduce((lprev, {entity, lookupMap}) => {

      const attributeBullets = _.reduce(lookupMap, (aprev, target, source) => {
        return `${aprev}\n    - ${source} -> ${target}`
      }, '')

      return `${lprev}\n  - Entity: ${entity} ${attributeBullets}`
    }, '')

    lines.push(`lookups: ${lookupBullets}`)
  }

  if (permission.values.length > 0) {
    const valueBullets = permission.values.reduce((prev, {attributeName, value}) => {
      return `${prev}\n  - ${attributeName} = ${value}`
    }, '')
    lines.push(`values: ${valueBullets}`)
  }

  if (lines.length > 0) {
    const text = '\n***\nPermissions:\n'
    const bullets = lines.reduce((prev, next) => {
      return `${prev}\n- ${next}`
    }, '')

    return text + bullets
  }

  return false
}



export const checkPermissionSimple = (permission, userId = null, userRoles = []) => {

  passOrThrow(
    isPermission(permission),
    () => 'checkPermissionSimple needs a valid permission object'
  )

  passOrThrow(
    !userRoles || isArray(userRoles),
    () => 'checkPermissionSimple needs a valid list of assigned user roles'
  )

  if (permission.everyoneCanAccess) {
    return true
  }

  if (permission.authenticatedCanAccess && userId) {
    return true
  }

  if (userId && userRoles) {
    let foundRole = false
    permission.roles.map(role => {
      if (userRoles.includes(role)) {
        foundRole = true
      }
    })

    if (foundRole) {
      return true
    }
  }

  return false
}



export const buildPermissionFilter = (permission, userId = null) => {

  let where

  if (permission.ownerAttributes.length > 0) {

    where = where || {}
    where.$or = where.$or || []

    permission.ownerAttributes.map((attributeName) => {
      where.$or.push({
        [ attributeName ]: userId
      })
    })
  }


  // TODO: other permission types as well


  return where
}
