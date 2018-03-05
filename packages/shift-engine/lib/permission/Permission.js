
import {
  passOrThrow,
  isMap,
  isArray,
  isFunction,
} from '../util';

import { isEntity } from '../entity/Entity';
import { isDataTypeUser } from '../datatype/DataTypeUser';
import {
  MUTATION_TYPE_CREATE,
  isMutation,
} from '../mutation/Mutation';
import { isDataTypeState } from '../datatype/DataTypeState';
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

export const isPermissionsArray = (obj) => {
  if (isArray(obj, true)) {
    return obj.reduce((prev, permission) => prev && isPermission(permission), true)
  }
  return false
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


export const findMissingPermissionAttributes = (permission, permissionEntity, mutation) => {

  const entityAttributeNames = Object.keys(permissionEntity.getAttributes())

  const missinguserAttribute = permission.userAttributes.find(userAttribute => !entityAttributeNames.includes(userAttribute))
  if (missinguserAttribute) {
    return missinguserAttribute
  }

  let missingLookupAttribute
  permission.lookups.map(({entity, lookupMap}) => {
    const lookupEntityAttributes = entity.getAttributes()
    const lookupEntityAttributeNames = Object.keys(lookupEntityAttributes)

    _.forEach(lookupMap, (sourceAttribute, targetAttribute) => {
      if (!isFunction(sourceAttribute) && !entityAttributeNames.includes(sourceAttribute)) {
        missingLookupAttribute = sourceAttribute
        return
      }
      else if (!lookupEntityAttributeNames.includes(targetAttribute)) {
        missingLookupAttribute = `${entity.name}.${targetAttribute}`
        return
      }

      if (isMutation(mutation) && mutation.type === MUTATION_TYPE_CREATE && !isFunction(sourceAttribute)) {
        throw new Error(`'lookup' type permission used in 'create' type mutation '${mutation.name}' can only have mappings to value functions`)
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


export const findMissingPermissionStates = (permission, permissionEntity) => {

  const entityStates = permissionEntity.getStates()

  if (entityStates) {
    const missingState = permission.states.find(state => !entityStates[state])
    if (missingState) {
      return missingState
    }
  }

  return false
}


export const generatePermissionDescription = (permissions) => {

  const descriptions = []

  const permissionsArray = isArray(permissions)
    ? permissions
    : [permissions]

  permissionsArray.map(permission => {

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
          return `${aprev}\n    - ${source} -> ${isFunction(target) ? 'λ' : target}`
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
      const bullets = lines.reduce((prev, next) => {
        return `${prev}\n- ${next}`
      }, '')

      descriptions.push(bullets)
    }
  })

  if (descriptions.length > 0) {
    const text = '\n***\n**Permissions:**\n'
    return text + descriptions.join('\n\n---')
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


export const isPermissionSimple = (permission) => {
  passOrThrow(
    isPermission(permission),
    () => 'isPermissionSimple needs a valid permission object'
  )

  return !permission.userAttributes.length &&
    !permission.states.length &&
    !permission.lookups.length &&
    !permission.values.length
}



export const buildUserAttributesPermissionFilter = ({permission, userId}) => {

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



export const buildStatesPermissionFilter = ({permission, entity}) => {

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



export const buildValuesPermissionFilter = ({permission}) => {

  let where

  if (permission.values.length > 0) {

    where = where || {}
    where.$or = where.$or || []

    permission.values.map(({attributeName, value}) => {
      where.$or.push({
        [attributeName]: value
      })
    })
  }

  return where
}


export const buildLookupsPermissionFilter = ({ permission, userId, userRoles, mutationData }) => {

  let where

  if (permission.lookups.length > 0) {

    where = where || {}
    where.$or = where.$or || []

    permission.lookups.map(({ entity, lookupMap }) => {
      const condition = []

      _.forEach(lookupMap, (sourceAttribute, targetAttribute) => {
        let operator = '$eq'

        if (isFunction(sourceAttribute)) {
          let value = sourceAttribute({ userId, userRoles, mutationData })
          const attr = entity.getAttributes()

          if (attr && attr[targetAttribute] && isDataTypeState(attr[targetAttribute].type)) {
            const states = entity.getStates()

            value = isArray(value)
              ? value.map(stateName => states[stateName] || stateName)
              : states[value] || value
          }

          if (isArray(value)) {
            operator = '$in'
          }

          condition.push({
            targetAttribute,
            operator,
            value
          })
        }
        else {
          condition.push({
            targetAttribute,
            operator,
            sourceAttribute
          })
        }
      })

      where.$or.push({
        $sub: {
          entity: entity.name,
          condition
        }
      })
    })
  }

  return where
}



export const buildPermissionFilterSingle = (permission, userId, userRoles, entity, mutationData) => {

  let where

  const params = { permission, userId, userRoles, entity, mutationData }

  const permissionFilters = [
    buildUserAttributesPermissionFilter(params),
    buildStatesPermissionFilter(params),
    buildValuesPermissionFilter(params),
    buildLookupsPermissionFilter(params),
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



export const buildPermissionFilter = (_permissions, userId, userRoles, entity, mutationData) => {

  let where

  if (!_permissions) {
    return where
  }

  const permissions = isArray(_permissions)
    ? _permissions
    : [_permissions]

  let foundSimplePermission = false

  permissions.map(permission => {

    if (foundSimplePermission) {
      return
    }

    const initialPass = checkPermissionSimple(permission, userId, userRoles)

    if (initialPass) {

      // it's a simple permission and permission check passed so let's skip any further checks and give direct access
      if (isPermissionSimple(permission)) {
        foundSimplePermission = true
        where = {}
        return
      }

      const permissionFilter = buildPermissionFilterSingle(permission, userId, userRoles, entity, mutationData)

      if (permissionFilter) {
        where = where || {}
        where.$or = where.$or || []
        where.$or.push(permissionFilter)
      }
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



const validatePermissionAttributesAndStates = (entity, permissions, _mutation) => {

  const permissionsArray = isArray(permissions)
    ? permissions
    : [permissions]

  const mutation = isMutation(_mutation)
    ? _mutation
    : null

  const mutationName = isMutation(_mutation)
    ? _mutation.name
    : String(_mutation)

  permissionsArray.map(permission => {
    const invalidAttribute = findMissingPermissionAttributes(permission, entity, mutation)

    passOrThrow(
      !invalidAttribute,
      () => `Cannot use attribute '${invalidAttribute}' in '${entity.name}.permissions' for '${mutationName}' as it does not exist`
    )

    findInvalidPermissionAttributes(permission, entity)

    const invalidState = findMissingPermissionStates(permission, entity)

    passOrThrow(
      !invalidState,
      () => `Cannot use state '${invalidState}' in '${entity.name}.permissions' for '${mutationName}' as it does not exist`
    )
  })
}


const validatePermissionMutationTypes = (entity, permissions, mutation) => {

  if (mutation.type === MUTATION_TYPE_CREATE) {

    const permissionsArray = isArray(permissions)
      ? permissions
      : [permissions]

    permissionsArray.map(permission => {
      passOrThrow(
        !permission.userAttributes.length &&
        !permission.states.length &&
        !permission.values.length,
        () => `Create type mutation permission '${mutation.name}' in '${entity.name}.permissions' can only be of type 'authenticated', 'everyone', 'role' or 'lookup'`
      )
    })
  }
}


export const processEntityPermissions = (entity, permissions) => {

  passOrThrow(
    isMap(permissions),
    () => `Entity '${entity.name}' permissions definition needs to be an object`
  )


  if (permissions.read) {
    passOrThrow(
      isPermission(permissions.read) || isPermissionsArray(permissions.read),
      () => `Invalid 'read' permission definition for entity '${entity.name}'`
    )
  }

  if (permissions.find) {
    passOrThrow(
      isPermission(permissions.find) || isPermissionsArray(permissions.find),
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
        isPermission(permissions.mutations[mutationName]) || isPermissionsArray(permissions.mutations[mutationName]),
        () => `Invalid mutation permission definition for entity '${entity.name}' at position '${idx}'`
      )

    })
  }


  if (permissions.find) {
    validatePermissionAttributesAndStates(entity, permissions.find, 'find')
  }

  if (permissions.read) {
    validatePermissionAttributesAndStates(entity, permissions.read, 'read')
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
        validatePermissionMutationTypes(entity, permission, mutation)
        validatePermissionAttributesAndStates(entity, permission, mutation)
      }
    })
  }

  return permissions
}
