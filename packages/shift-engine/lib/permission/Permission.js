
import {
  passOrThrow,
  isMap,
} from '../util';

import { isEntity } from '../entity/Entity';
import _ from 'lodash';


/*
  all permission rules are combined with OR
*/


const compatibilityList = [
  [ 'everyone', ],
  [ 'authenticated', ],
  [ 'role', 'lookup', 'value' ],
]



class Permission {

  static EVERYONE = (new Permission()).everyone()
  static AUTHENTICATED = (new Permission()).authenticated()

  types = {}
  roles = []
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
    return this
  }


  authenticated () {
    this._checkCompatibility('authenticated')
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
      () => 'Permission type \'value\' expects an attributeName'
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
