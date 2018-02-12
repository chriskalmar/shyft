
import {
  passOrThrow,
  isMap,
  isArray,
} from '../util';

import { isEntity } from '../entity/Entity';
import { isDataTypeUser } from '../datatype/DataTypeUser';
import _ from 'lodash';


/*
  all permission rules are ...
  - combined with OR on the same type level
  - combined with AND among all types
  - combined with OR among Permission objects
*/


const compatibilityList = [
  ['everyone', 'lookup', 'value', 'state'],
  ['authenticated', 'role', 'userAttribute', 'lookup', 'value', 'state'],
  ['role', 'userAttribute', 'lookup', 'value', 'state'],
]



class Permission {

  static EVERYONE = (new Permission()).everyone()
  static AUTHENTICATED = (new Permission()).authenticated()

  everyoneCanAccess = false
  authenticatedCanAccess = false
  types = {}
  roles = []
  userAttributes = []
  lookups = []
  values = []
  states = []


  constructor () {
    return this
  }


  _checkCompatibility(type) {

    this.types[ type ] = true

    const found = compatibilityList.find(list => {
      let allFound = true

      Object.keys(this.types).map(key => {
        if (!list.includes(key)) {
          allFound = false
        }
      })

      return allFound
    })

    passOrThrow(
      found,
      () => `Permission type '${type}' is incompatible with other types`
    )
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
      () => 'Permission type \'role\' expects a role name'
    )

    this.roles.push(name)

    passOrThrow(
      this.roles.length === _.uniq(this.roles).length,
      () => `Duplicate role '${name}' for permission type \'role\'`
    )

    return this
  }



  userAttribute (attributeName) {
    this._checkCompatibility('userAttribute')

    passOrThrow(
      attributeName,
      () => 'Permission type \'userAttribute\' expects an attribute name'
    )

    this.userAttributes.push(attributeName)

    passOrThrow(
      this.userAttributes.length === _.uniq(this.userAttributes).length,
      () => `Duplicate attribute name '${attributeName}' for permission type \'userAttribute\'`
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


  state (stateName) {
    this._checkCompatibility('state')

    passOrThrow(
      stateName,
      () => 'Permission type \'state\' expects a state name'
    )

    this.states.push(stateName)

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

  permission.userAttributes.map(userAttribute => {
    const attribute = attributes[ userAttribute ]

    passOrThrow(
      attribute && (
        isDataTypeUser(attribute.type) ||
        ( isEntity(attribute.type) && attribute.type.isUserEntity )
      ),
      () => `Cannot use attribute '${userAttribute}' in '${entity.name}.permissions' as 'userAttribute' as it is not a reference to the User entity`
    )
  })

}


export const findMissingPermissionAttributes = (permission, permissionEntity) => {

  const entityAttributeNames = Object.keys(permissionEntity.getAttributes())

  const missinguserAttribute = permission.userAttributes.find(userAttribute => !entityAttributeNames.includes(userAttribute))
  if (missinguserAttribute) {
    return missinguserAttribute
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

  if (permission.userAttributes.length > 0) {
    lines.push(`userAttributes: ${permission.userAttributes.join(', ')}`)
  }

  if (permission.states.length > 0) {
    lines.push(`states: ${permission.states.join(', ')}`)
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

  if (!permission.everyoneCanAccess && !permission.authenticatedCanAccess && !permission.roles.length) {
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

  if (permission.authenticatedCanAccess && userId && !permission.roles.length) {
    return true
  }

  if (permission.everyoneCanAccess) {
    return true
  }

  return false
}



export const buildUserAttributesPermissionFilter = (permission, userId) => {

  let where

  if (permission.userAttributes.length > 0) {

    passOrThrow(
      userId,
      () => 'missing userId in permission object'
    )

    where = where || {}
    where.$or = where.$or || []

    permission.userAttributes.map((attributeName) => {
      where.$or.push({
        [ attributeName ]: userId
      })
    })
  }

  return where
}



export const buildStatesPermissionFilter = (permission, entity) => {

  let where

  if (permission.states.length > 0) {

    passOrThrow(
      entity,
      () => 'missing entity in permission object'
    )

    where = where || {}
    where.$or = where.$or || []

    const states = entity.getStates()
    const stateIds = permission.states.map((stateName) => {
      const state = states[stateName]

      passOrThrow(
        state,
        () => `unknown state name '${stateName}' used in permission object`
      )

      return state
    })

    where.$or.push({
      state: {
        $in: stateIds
      }
    })

  }

  return where
}



export const buildPermissionFilterSingle = (permission, userId, userRoles, entity) => {

  let where

  const permissionFilters = [
    buildUserAttributesPermissionFilter(permission, userId),
    buildStatesPermissionFilter(permission, entity),
  ]

  permissionFilters.map(permissionFilter => {
    if (permissionFilter) {
      where = where || {}
      where.$and = where.$and || []
      where.$and.push(permissionFilter)
    }
  })

  return where
}



export const checkPermissionAdvanced = (data, permission, userId = null) => {

  passOrThrow(
    isPermission(permission),
    () => 'checkPermissionAdvanced needs a valid permission object'
  )

  if (permission.userAttributes.length > 0) {

    if (!userId) {
      return false
    }

    const matchesUser = permission.userAttributes.find((attributeName) => {
      return data[attributeName] === userId
    })

    return matchesUser
  }

  return false
}



const validatePermissionAttributes = (entity, permission, mutationName) => {

  const invalidAttribute = findMissingPermissionAttributes(permission, entity)

  passOrThrow(
    !invalidAttribute,
    () => `Cannot use attribute '${invalidAttribute}' in '${entity.name}.permissions' for '${mutationName}' as it does not exist`
  )

  findInvalidPermissionAttributes(permission, entity)
}


export const processEntityPermissions = (entity, permissions) => {

  passOrThrow(
    isMap(permissions),
    () => `Entity '${entity.name}' permissions definition needs to be an object`
  )


  if (permissions.read) {
    passOrThrow(
      isPermission(permissions.read),
      () => `Invalid 'read' permission definition for entity '${entity.name}'`
    )
  }

  if (permissions.find) {
    passOrThrow(
      isPermission(permissions.find),
      () => `Invalid 'find' permission definition for entity '${entity.name}'`
    )
  }

  if (permissions.mutations) {
    passOrThrow(
      isMap(permissions.mutations),
      () => `Entity '${entity.name}' permissions definition for mutations needs to be a map of mutations and permissions`
    )

    const mutationNames = Object.keys(permissions.mutations);
    mutationNames.map((mutationName, idx) => {
      passOrThrow(
        isPermission(permissions.mutations[ mutationName ]),
        () => `Invalid mutation permission definition for entity '${entity.name}' at position '${idx}'`
      )

    })
  }


  if (permissions.find) {
    validatePermissionAttributes(entity, permissions.find, 'find')
  }

  if (permissions.read) {
    validatePermissionAttributes(entity, permissions.read, 'read')
  }


  const entityMutations = entity.getMutations()

  if (permissions.mutations && entityMutations) {
    const permissionMutationNames = Object.keys(permissions.mutations);

    const mutationNames = entityMutations.map((mutation) => mutation.name)

    permissionMutationNames.map(permissionMutationName => {
      passOrThrow(
        mutationNames.includes(permissionMutationName),
        () => `Unknown mutation '${permissionMutationName}' used for permissions in entity '${entity.name}'`
      )
    })

    entityMutations.map((mutation) => {
      const mutationName = mutation.name
      const permission = permissions.mutations[ mutationName ]

      if (permission) {
        validatePermissionAttributes(entity, permission, mutationName)
      }
    })
  }

  return permissions
}
