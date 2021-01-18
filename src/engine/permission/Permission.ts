import * as _ from 'lodash';
import { passOrThrow, isMap, isArray, isFunction, asyncForEach } from '../util';

import { Action } from '../action/Action';
import { Entity, isEntity } from '../entity/Entity';
import { ViewEntity } from '../entity/ViewEntity';
import { isDataTypeUser } from '../datatype/DataTypeUser';
import {
  MUTATION_TYPE_CREATE,
  isMutation,
  Mutation,
} from '../mutation/Mutation';
import {
  SUBSCRIPTION_TYPE_CREATE,
  // isSubscription,
  Subscription,
} from '../subscription/Subscription';
import { isDataTypeState } from '../datatype/DataTypeState';

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
];

export interface PermissionMap {
  read?: Permission | Permission[];
  find?: Permission | Permission[];
  mutations?: {
    [key: string]: Permission | Permission[];
  };
  subscriptions?: {} | Permission | Permission[];
}

export type PermissionMapGenerator = () => PermissionMap;

export class Permission {
  /* eslint-disable no-undef */

  static EVERYONE = new Permission().everyone();
  static AUTHENTICATED = new Permission().authenticated();

  isEmpty = true;
  everyoneCanAccess = false;
  authenticatedCanAccess = false;
  types = {};
  roles = [];
  userAttributes = [];
  lookups = [];
  values = [];
  states = [];

  /* eslint-enable  no-undef */

  constructor() {
    return this;
  }

  _checkCompatibility(type): void {
    this.types[type] = true;

    const found = compatibilityList.find((list) => {
      let allFound = true;

      Object.keys(this.types).map((key) => {
        if (!list.includes(key)) {
          allFound = false;
        }
      });

      return allFound;
    });

    passOrThrow(
      found,
      () => `Permission type '${type}' is incompatible with other types`,
    );
  }

  everyone(): Permission {
    this.isEmpty = false;
    this._checkCompatibility('everyone');
    this.everyoneCanAccess = true;
    return this;
  }

  authenticated(): Permission {
    this.isEmpty = false;
    this._checkCompatibility('authenticated');
    this.authenticatedCanAccess = true;
    return this;
  }

  role(name: string): Permission {
    this.isEmpty = false;
    this._checkCompatibility('role');

    passOrThrow(name, () => "Permission type 'role' expects a role name");

    this.roles.push(name);

    passOrThrow(
      this.roles.length === _.uniq(this.roles).length,
      () => `Duplicate role '${name}' for permission type 'role'`,
    );

    return this;
  }

  userAttribute(attributeName: string): Permission {
    this.isEmpty = false;
    this._checkCompatibility('userAttribute');

    passOrThrow(
      attributeName,
      () => "Permission type 'userAttribute' expects an attribute name",
    );

    this.userAttributes.push(attributeName);

    passOrThrow(
      this.userAttributes.length === _.uniq(this.userAttributes).length,
      () =>
        `Duplicate attribute name '${attributeName}' for permission type 'userAttribute'`,
    );

    return this;
  }

  lookup(entity: Entity | ViewEntity, lookupMap: object): Permission {
    this.isEmpty = false;
    this._checkCompatibility('lookup');

    passOrThrow(
      isFunction(entity) || isEntity(entity),
      () => "Permission type 'lookup' expects an entity",
    );
    passOrThrow(
      isMap(lookupMap, true),
      () => "Permission type 'lookup' expects a lookupMap",
    );

    this.lookups.push({
      entity,
      lookupMap,
    });

    return this;
  }

  value(attributeName: string, value: any): Permission {
    this.isEmpty = false;
    this._checkCompatibility('value');

    passOrThrow(
      attributeName,
      () => "Permission type 'value' expects an attribute name",
    );
    passOrThrow(
      typeof value !== 'undefined',
      () => "Permission type 'value' expects a value",
    );

    this.values.push({
      attributeName,
      value,
    });

    return this;
  }

  state(stateName: string): Permission {
    this.isEmpty = false;
    this._checkCompatibility('state');

    passOrThrow(
      stateName,
      () => "Permission type 'state' expects a state name",
    );

    this.states.push(stateName);

    return this;
  }

  toString(): string {
    return 'Permission Object';
  }
}

export const isPermission = (obj: unknown): obj is Permission => {
  return obj instanceof Permission;
};

export const isPermissionsArray = (obj: unknown): obj is Permission[] => {
  if (isArray(obj, true)) {
    return obj.reduce(
      (prev, permission) => prev && isPermission(permission),
      true,
    );
  }
  return false;
};

export const findInvalidPermissionAttributes = (
  permission: Permission,
  entity: Entity | ViewEntity,
) => {
  const attributes = entity.getAttributes();

  permission.userAttributes.map((userAttribute) => {
    const attribute = attributes[userAttribute];
    const attributeTypeAsEntity = attribute.type as Entity;
    const entityAsEntity = entity as Entity;

    passOrThrow(
      attribute &&
        (isDataTypeUser(attribute.type) ||
          (entityAsEntity.isUserEntity &&
            entityAsEntity.getPrimaryAttribute() === attribute) ||
          (isEntity(attribute.type) && attributeTypeAsEntity.isUserEntity)),
      () =>
        `Cannot use attribute '${userAttribute}' in '${entity.name}.permissions' as 'userAttribute' as it is not a reference to the User entity`,
    );
  });
};

export const findMissingPermissionAttributes = (
  permission: Permission,
  permissionEntity: Entity | ViewEntity,
  mutation?: Mutation,
): string | boolean => {
  const entityAttributeNames = Object.keys(permissionEntity.getAttributes());

  const missinguserAttribute = permission.userAttributes.find(
    (userAttribute) => !entityAttributeNames.includes(userAttribute),
  );
  if (missinguserAttribute) {
    return missinguserAttribute;
  }

  let missingLookupAttribute: string;
  permission.lookups.map((lookup) => {
    const { entity: _entity, lookupMap } = lookup;
    let entity = _entity;

    if (isFunction(_entity)) {
      entity = lookup.entity = _entity();
    }

    const lookupEntityAttributes = entity.getAttributes();
    const lookupEntityAttributeNames = Object.keys(lookupEntityAttributes);

    _.forEach(lookupMap, (sourceAttribute, targetAttribute) => {
      if (
        !isFunction(sourceAttribute) &&
        !entityAttributeNames.includes(sourceAttribute)
      ) {
        missingLookupAttribute = sourceAttribute;
        return;
      } else if (!lookupEntityAttributeNames.includes(targetAttribute)) {
        missingLookupAttribute = `${entity.name}.${targetAttribute}`;
        return;
      }

      if (
        isMutation(mutation) &&
        mutation.type === MUTATION_TYPE_CREATE &&
        !isFunction(sourceAttribute)
      ) {
        throw new Error(
          `'lookup' type permission used in 'create' type mutation '${mutation.name}' can only have mappings to value functions`,
        );
      }
    });
  });
  if (missingLookupAttribute) {
    return missingLookupAttribute;
  }

  const missingValueAttribute = permission.values.find(
    ({ attributeName }) => !entityAttributeNames.includes(attributeName),
  );
  if (missingValueAttribute) {
    return missingValueAttribute.attributeName;
  }

  return false;
};

export const findMissingPermissionStates = (
  permission: Permission,
  permissionEntity: Entity,
) => {
  const entityStates = permissionEntity.getStates();

  if (entityStates) {
    const missingState = permission.states.find(
      (state) => !entityStates[state],
    );
    if (missingState) {
      return missingState;
    }
  }

  return false;
};

export const validateActionLookupPermission = (
  permission: Permission,
  permissionAction: Action,
): void => {
  permission.lookups.map((lookup) => {
    const { entity: _entity, lookupMap } = lookup;
    let entity = _entity;

    if (isFunction(_entity)) {
      entity = lookup.entity = _entity();
    }

    const lookupEntityAttributes = entity.getAttributes();
    const lookupEntityAttributeNames = Object.keys(lookupEntityAttributes);

    _.forEach(lookupMap, (sourceAttribute, targetAttribute) => {
      passOrThrow(
        isFunction(sourceAttribute),
        () =>
          `Only functions are allowed in '${permissionAction.name}.permissions' for value lookups`,
      );
      passOrThrow(
        lookupEntityAttributeNames.includes(targetAttribute),
        () =>
          `Cannot use attribute '${targetAttribute}' in '${permissionAction.name}.permissions' as it does not exist`,
      );
    });
  });
};

export const generatePermissionDescription = (
  permissions: Permission | Permission[],
): string | boolean => {
  const descriptions = [];

  const permissionsArray = isArray(permissions as Permission[])
    ? (permissions as Permission[])
    : ([permissions] as Permission[]);

  permissionsArray.map((permission) => {
    const lines = [];

    passOrThrow(
      isPermission(permission),
      () => 'generatePermissionDescription needs a valid permission object',
    );

    if (permission.everyoneCanAccess) {
      lines.push('everyone');
    }

    if (permission.authenticatedCanAccess) {
      lines.push('authenticated');
    }

    if (permission.roles.length > 0) {
      lines.push(`roles: ${permission.roles.join(', ')}`);
    }

    if (permission.userAttributes.length > 0) {
      lines.push(`userAttributes: ${permission.userAttributes.join(', ')}`);
    }

    if (permission.states.length > 0) {
      lines.push(`states: ${permission.states.join(', ')}`);
    }

    if (permission.lookups.length > 0) {
      const lookupBullets = permission.lookups.reduce(
        (lprev, { entity, lookupMap }) => {
          const attributeBullets = _.reduce(
            lookupMap,
            (aprev, target, source) => {
              return `${aprev}\n    - ${source} -> ${
                isFunction(target) ? 'λ' : target
              }`;
            },
            '',
          );

          return `${lprev}\n  - Entity: ${entity} ${attributeBullets}`;
        },
        '',
      );

      lines.push(`lookups: ${lookupBullets}`);
    }

    if (permission.values.length > 0) {
      const valueBullets = permission.values.reduce(
        (prev, { attributeName, value }) => {
          return `${prev}\n  - ${attributeName} = ${value}`;
        },
        '',
      );
      lines.push(`values: ${valueBullets}`);
    }

    if (lines.length > 0) {
      const bullets = lines.reduce((prev, next) => {
        return `${prev}\n- ${next}`;
      }, '');

      descriptions.push(bullets);
    }
  });

  if (descriptions.length > 0) {
    const text = '\n***\n**Permissions:**\n';
    return text + descriptions.join('\n\n---');
  }

  return false;
};

export const checkPermissionSimple = (
  permission: Permission,
  userId = null,
  userRoles = [],
): boolean => {
  passOrThrow(
    isPermission(permission),
    () => 'checkPermissionSimple needs a valid permission object',
  );

  passOrThrow(
    !userRoles || isArray(userRoles),
    () => 'checkPermissionSimple needs a valid list of assigned user roles',
  );

  if (
    !permission.everyoneCanAccess &&
    !permission.authenticatedCanAccess &&
    !permission.roles.length
  ) {
    return true;
  }

  if (userId && userRoles) {
    let foundRole = false;
    permission.roles.map((role) => {
      if (userRoles.includes(role)) {
        foundRole = true;
      }
    });

    if (foundRole) {
      return true;
    }
  }

  if (permission.authenticatedCanAccess && userId && !permission.roles.length) {
    return true;
  }

  if (permission.everyoneCanAccess) {
    return true;
  }

  return false;
};

export const isPermissionSimple = (permission: unknown): boolean => {
  passOrThrow(
    isPermission(permission),
    () => 'isPermissionSimple needs a valid permission object',
  );

  return (
    !permission.userAttributes.length &&
    !permission.states.length &&
    !permission.lookups.length &&
    !permission.values.length
  );
};

export type UserAttributesPermissionFilter = {
  $or?: [{ [attributeName: number]: string | number }];
};

export const buildUserAttributesPermissionFilter = ({
  permission,
  userId,
}: {
  permission: Permission;
  userId: string | number;
}): UserAttributesPermissionFilter | undefined => {
  let where: UserAttributesPermissionFilter;

  if (permission.userAttributes.length > 0) {
    passOrThrow(userId, () => 'missing userId in permission object');
    where = {};

    permission.userAttributes.map((attributeName) => {
      const userAttrFilter = {
        [attributeName]: userId,
      };
      if (!where.$or) {
        where = { $or: [userAttrFilter] };
      } else {
        where.$or.push(userAttrFilter);
      }
    });
  }

  return where;
};

export type StatesPermissionFilter = {
  $or?: [{ state: { $in: string[] | number[] } }];
};

export const buildStatesPermissionFilter = ({
  permission,
  entity,
}: {
  permission: Permission;
  entity: Entity;
}): StatesPermissionFilter | undefined => {
  let where: StatesPermissionFilter;

  if (permission.states.length > 0) {
    passOrThrow(entity, () => 'missing entity in permission object');
    where = {};

    const states = entity.getStates();
    const stateIds = permission.states.map((stateName) => {
      const state = states[stateName];

      passOrThrow(
        state,
        () => `unknown state name '${stateName}' used in permission object`,
      );

      return state;
    });

    where.$or = [
      {
        state: {
          $in: stateIds,
        },
      },
    ];
  }

  return where;
};

export type ValuesPermissionFilter = {
  $or?: [{ [attributeName: number]: any }];
};

export const buildValuesPermissionFilter = ({
  permission,
}: {
  permission: Permission;
}): ValuesPermissionFilter | undefined => {
  let where: ValuesPermissionFilter;

  if (permission.values.length > 0) {
    where = {};

    permission.values.map(({ attributeName, value }) => {
      const filter = {
        [attributeName]: value,
      };
      if (!where.$or) {
        where = { $or: [filter] };
      } else {
        where.$or.push(filter);
      }
    });
  }

  return where;
};

// export type LookupsPermissionFilterCondition = {
//   targetAttribute: string;
//   operator: string;
//   value: any;
// };

export type LookupsPermissionFilter = {
  $or?: [
    {
      $sub: {
        entity: string;
        condition: any[];
      };
    },
  ];
};

export const buildLookupsPermissionFilter = async ({
  permission,
  userId,
  userRoles,
  input,
  context,
}: {
  permission: Permission;
  userId?: string | number;
  userRoles?: any;
  input?: any;
  context?: any;
}): Promise<LookupsPermissionFilter | undefined> => {
  let where: LookupsPermissionFilter;

  if (permission.lookups.length > 0) {
    where = {};

    await Promise.all(
      permission.lookups.map(async ({ entity, lookupMap }) => {
        const condition = [];

        const targetAttributes = Object.keys(lookupMap);
        await Promise.all(
          targetAttributes.map(async (targetAttribute) => {
            const sourceAttribute = lookupMap[targetAttribute];
            let operator = '$eq';

            if (isFunction(sourceAttribute)) {
              let value = await sourceAttribute({
                userId,
                userRoles,
                input,
                context,
              });

              const attr = entity.getAttributes();

              if (
                attr &&
                attr[targetAttribute] &&
                isDataTypeState(attr[targetAttribute].type)
              ) {
                const states = entity.getStates();

                value = isArray(value)
                  ? value.map((stateName) => states[stateName] || stateName)
                  : states[value] || value;
              }

              if (isArray(value)) {
                operator = '$in';
              }

              condition.push({
                targetAttribute,
                operator,
                value,
              });
            } else {
              condition.push({
                targetAttribute,
                operator,
                sourceAttribute,
              });
            }
          }),
        );

        const filter = {
          $sub: {
            entity: entity.name,
            condition,
          },
        };
        if (!where.$or) {
          where.$or = [filter];
        } else {
          where.$or.push(filter);
        }
      }),
    );
  }

  return where;
};

export type PermissionFilterSingle = {
  $and?: [
    | UserAttributesPermissionFilter
    | StatesPermissionFilter
    | ValuesPermissionFilter
    | LookupsPermissionFilter,
  ];
};

export const buildPermissionFilterSingle = async (
  permission: Permission,
  userId?: string | number,
  userRoles?: any,
  entity?: Entity,
  input?: any,
  context?: any,
): Promise<PermissionFilterSingle | undefined> => {
  let where: PermissionFilterSingle;

  const params = { permission, userId, userRoles, entity, input, context };

  const permissionFilters = [
    buildUserAttributesPermissionFilter(params),
    buildStatesPermissionFilter(params),
    buildValuesPermissionFilter(params),
    await buildLookupsPermissionFilter(params),
  ];

  permissionFilters.map((permissionFilter) => {
    if (permissionFilter) {
      where = where || {};
      // where.$and = where.$and || [];
      if (!where.$and) {
        where.$and = [permissionFilter];
      } else {
        where.$and.push(permissionFilter);
      }
    }
  });

  return where;
};

export type PermissionFilter = {
  $or?: [PermissionFilterSingle];
};

export const buildPermissionFilter = async (
  _permissions: Permission | Permission[],
  userId?: string | number,
  userRoles?: any,
  entity?: Entity,
  input?: any,
  context?: any,
): Promise<PermissionFilter | undefined> => {
  let where: PermissionFilter;

  if (!_permissions) {
    return where;
  }

  const permissions = isArray(_permissions as Permission[])
    ? (_permissions as Permission[])
    : ([_permissions] as Permission[]);

  // const permissions = isArray(_permissions as any[])
  //   ? _permissions
  //   : [_permissions];

  let foundSimplePermission = false;

  await asyncForEach(permissions, async (permission) => {
    if (foundSimplePermission) {
      return;
    }

    const initialPass = checkPermissionSimple(permission, userId, userRoles);

    if (initialPass) {
      // it's a simple permission and permission check passed so let's skip any further checks and give direct access
      if (isPermissionSimple(permission)) {
        foundSimplePermission = true;
        where = {};
        return;
      }

      const permissionFilter = await buildPermissionFilterSingle(
        permission,
        userId,
        userRoles,
        entity,
        input,
        context,
      );

      if (permissionFilter) {
        where = where || {};
        // where.$or = where.$or || [];
        if (!where.$or) {
          where.$or = [permissionFilter];
        } else {
          where.$or.push(permissionFilter);
        }
      }
    }
  });

  return where;
};

export type ActionPermissionFilter = {
  $or?: [LookupsPermissionFilter];
};

export const buildActionPermissionFilter = async (
  _permissions: Function | Permission | Permission[],
  userId = null,
  userRoles = [],
  action: Action | Subscription,
  // action: Action,
  input?: any,
  context?: any,
): Promise<
  { where: ActionPermissionFilter; lookupPermissionEntity: Entity } | undefined
> => {
  let where: ActionPermissionFilter;
  let lookupPermissionEntity: Entity;

  if (!_permissions) {
    // return where;
    return undefined;
  }

  let permissions: Permission[];
  if (isFunction(_permissions)) {
    const permissionFn = _permissions as Function;
    const permissionResult = permissionFn();
    permissions = isArray(permissionResult)
      ? permissionResult
      : [permissionResult];
  } else if (isArray(_permissions as Permission[])) {
    permissions = _permissions as Permission[];
  } else {
    permissions = [_permissions] as Permission[];
  }

  // const permissions = isArray(_permissions as Permission[])
  //   ? (_permissions as Permission[])
  //   : ([_permissions] as Permission[]);

  let foundSimplePermission = false;

  await Promise.all(
    permissions.map(async (permission) => {
      if (foundSimplePermission) {
        return;
      }

      const initialPass = checkPermissionSimple(permission, userId, userRoles);

      if (initialPass) {
        // it's a simple permission and permission check passed so let's skip any further checks and give direct access
        if (isPermissionSimple(permission)) {
          foundSimplePermission = true;
          where = {};
          return;
        }

        const params = {
          permission,
          userId,
          userRoles,
          action,
          input,
          context,
        };
        const permissionFilter = await buildLookupsPermissionFilter(params);

        if (permissionFilter) {
          where = where || {};
          // where.$or = where.$or || [];
          if (!where.$or) {
            where.$or = [permissionFilter];
          } else {
            where.$or.push(permissionFilter);
          }

          lookupPermissionEntity = permission.lookups[0].entity;
        }
      }
    }),
  );

  return {
    where,
    lookupPermissionEntity,
  };
};

export const checkPermissionAdvanced = (
  data: any,
  permission: Permission,
  userId = null,
): boolean => {
  passOrThrow(
    isPermission(permission),
    () => 'checkPermissionAdvanced needs a valid permission object',
  );

  if (permission.userAttributes.length > 0) {
    if (!userId) {
      return false;
    }

    const matchesUser = permission.userAttributes.find((attributeName) => {
      return data[attributeName] === userId;
    });

    return matchesUser;
  }

  return false;
};

const validatePermissionAttributesAndStates = (
  entity: Entity | ViewEntity,
  permissions: Permission | Permission[],
  _mutation: Mutation | string,
): void => {
  // const permissionsArray = isArray(permissions) ? permissions : [permissions];
  const permissionsArray = isArray(permissions as Permission[])
    ? (permissions as Permission[])
    : ([permissions] as Permission[]);

  const mutation = isMutation(_mutation) ? (_mutation as Mutation) : null;

  const mutationAsMutation = _mutation as Mutation;
  const mutationName = isMutation(_mutation)
    ? mutationAsMutation.name
    : String(_mutation);

  permissionsArray.map((permission) => {
    const invalidAttribute = findMissingPermissionAttributes(
      permission,
      entity,
      mutation,
    );

    passOrThrow(
      !invalidAttribute,
      () =>
        `Cannot use attribute '${invalidAttribute}' in '${entity.name}.permissions' for '${mutationName}' as it does not exist`,
    );

    findInvalidPermissionAttributes(permission, entity);

    const entityAsEntity = entity as Entity;
    if (entityAsEntity.getStates) {
      const invalidState = findMissingPermissionStates(
        permission,
        entity as Entity,
      );

      passOrThrow(
        !invalidState,
        () =>
          `Cannot use state '${invalidState}' in '${entity.name}.permissions' for '${mutationName}' as it does not exist`,
      );
    }
  });
};

const validatePermissionMutationTypes = (
  entity: Entity,
  permissions: Permission | Permission[],
  mutation: Mutation,
): void => {
  if (mutation.type === MUTATION_TYPE_CREATE) {
    // const permissionsArray = isArray(permissions) ? permissions : [permissions];
    const permissionsArray = isArray(permissions as Permission[])
      ? (permissions as Permission[])
      : ([permissions] as Permission[]);

    permissionsArray.map((permission) => {
      passOrThrow(
        !permission.userAttributes.length &&
          !permission.states.length &&
          !permission.values.length,
        () =>
          `Create type mutation permission '${mutation.name}' in '${entity.name}.permissions' can only be of type 'authenticated', 'everyone', 'role' or 'lookup'`,
      );
    });
  }
};

const validatePermissionSubscriptionTypes = (
  entity: Entity,
  permissions: Permission | Permission[],
  subscription: Subscription,
): void => {
  if (subscription.type === SUBSCRIPTION_TYPE_CREATE) {
    const permissionsArray = isArray(permissions as Permission[])
      ? (permissions as Permission[])
      : ([permissions] as Permission[]);

    permissionsArray.map((permission) => {
      passOrThrow(
        !permission.userAttributes.length &&
          !permission.states.length &&
          !permission.values.length,
        () =>
          `Create type subscription permission '${subscription.name}' in '${entity.name}.permissions' can only be of type 'authenticated', 'everyone', 'role' or 'lookup'`,
      );
    });
  }
};

export const hasEmptyPermissions = (
  _permissions: Permission | Permission[],
): boolean => {
  if (isPermissionsArray(_permissions)) {
    const permissions = _permissions as Permission[];
    const foundEmpty = permissions.find(({ isEmpty }) => isEmpty);
    return !!foundEmpty;
  }
  const permission = _permissions as Permission;
  return permission.isEmpty;
};

export const findEmptyEntityPermissions = (permissions): string[] => {
  const emptyPermissionsIn = [];

  if (permissions.read && hasEmptyPermissions(permissions.read)) {
    emptyPermissionsIn.push('read');
  }

  if (permissions.find && hasEmptyPermissions(permissions.find)) {
    emptyPermissionsIn.push('find');
  }

  if (permissions.mutations) {
    const mutationNames = Object.keys(permissions.mutations);
    mutationNames.map((mutationName) => {
      if (
        permissions.mutations[mutationName] &&
        hasEmptyPermissions(permissions.mutations[mutationName])
      ) {
        emptyPermissionsIn.push(`mutations.${mutationName}`);
      }
    });
  }

  if (permissions.subscriptions) {
    const subscriptionNames = Object.keys(permissions.subscriptions);
    subscriptionNames.map((subscriptionName) => {
      if (
        permissions.subscriptions[subscriptionName] &&
        hasEmptyPermissions(permissions.subscriptions[subscriptionName])
      ) {
        emptyPermissionsIn.push(`subscriptions.${subscriptionName}`);
      }
    });
  }

  return emptyPermissionsIn;
};

export const processEntityPermissions = (
  entity: Entity,
  permissions: PermissionMap,
  defaultPermissions?,
): PermissionMap => {
  passOrThrow(
    isMap(permissions),
    () =>
      `Entity '${entity.name}' permissions definition needs to be an object`,
  );

  if (permissions.read) {
    passOrThrow(
      isPermission(permissions.read) || isPermissionsArray(permissions.read),
      () => `Invalid 'read' permission definition for entity '${entity.name}'`,
    );
  } else if (defaultPermissions) {
    permissions.read = defaultPermissions.read;
  }

  if (permissions.find) {
    passOrThrow(
      isPermission(permissions.find) || isPermissionsArray(permissions.find),
      () => `Invalid 'find' permission definition for entity '${entity.name}'`,
    );
  } else if (defaultPermissions) {
    permissions.find = defaultPermissions.find;
  }

  const entityMutations = entity.getMutations();

  if (!permissions.mutations && defaultPermissions) {
    permissions.mutations = {};
  }

  if (permissions.mutations) {
    passOrThrow(
      isMap(permissions.mutations),
      () =>
        `Entity '${entity.name}' permissions definition for mutations needs to be a map of mutations and permissions`,
    );

    const mutationNames = Object.keys(permissions.mutations);
    mutationNames.map((mutationName, idx) => {
      passOrThrow(
        isPermission(permissions.mutations[mutationName]) ||
          isPermissionsArray(permissions.mutations[mutationName]),
        () =>
          `Invalid mutation permission definition for entity '${entity.name}' at position '${idx}'`,
      );
    });

    if (defaultPermissions) {
      entityMutations.map(({ name: mutationName }) => {
        if (defaultPermissions.mutations) {
          permissions.mutations[mutationName] =
            permissions.mutations[mutationName] ||
            defaultPermissions.mutations[mutationName] ||
            defaultPermissions.mutations._default;
        }
      });
    }
  }

  const entitySubscriptions = entity.getSubscriptions();

  if (!permissions.subscriptions && defaultPermissions) {
    permissions.subscriptions = {};
  }

  if (permissions.subscriptions) {
    passOrThrow(
      isMap(permissions.subscriptions),
      () =>
        `Entity '${entity.name}' permissions definition for subscriptions needs to be a map of subscriptions and permissions`,
    );

    const subscriptionNames = Object.keys(permissions.subscriptions);
    subscriptionNames.map((subscriptionName, idx) => {
      passOrThrow(
        isPermission(permissions.subscriptions[subscriptionName]) ||
          isPermissionsArray(permissions.subscriptions[subscriptionName]),
        () =>
          `Invalid subscription permission definition for entity '${entity.name}' at position '${idx}'`,
      );
    });

    if (defaultPermissions) {
      entitySubscriptions.map(({ name: subscriptionName }) => {
        if (defaultPermissions.subscriptions) {
          permissions.subscriptions[subscriptionName] =
            permissions.subscriptions[subscriptionName] ||
            defaultPermissions.subscriptions[subscriptionName] ||
            defaultPermissions.subscriptions._default;
        }
      });
    }
  }

  if (permissions.find) {
    validatePermissionAttributesAndStates(entity, permissions.find, 'find');
  }

  if (permissions.read) {
    validatePermissionAttributesAndStates(entity, permissions.read, 'read');
  }

  if (permissions.mutations && entityMutations) {
    const permissionMutationNames = Object.keys(permissions.mutations);

    const mutationNames = entityMutations.map((mutation) => mutation.name);

    permissionMutationNames.map((permissionMutationName) => {
      passOrThrow(
        mutationNames.includes(permissionMutationName),
        () =>
          `Unknown mutation '${permissionMutationName}' used for permissions in entity '${entity.name}'`,
      );
    });

    entityMutations.map((mutation) => {
      const mutationName = mutation.name;
      const permission = permissions.mutations[mutationName];

      if (permission) {
        validatePermissionMutationTypes(entity, permission, mutation);
        validatePermissionAttributesAndStates(entity, permission, mutation);
      }
    });
  }

  if (permissions.subscriptions && entitySubscriptions) {
    const permissionSubscriptionNames = Object.keys(permissions.subscriptions);

    const subscriptionNames = entitySubscriptions.map(
      (subscription) => subscription.name,
    );

    permissionSubscriptionNames.map((permissionSubscriptionName) => {
      passOrThrow(
        subscriptionNames.includes(permissionSubscriptionName),
        () =>
          `Unknown subscription '${permissionSubscriptionName}' used for permissions in entity '${entity.name}'`,
      );
    });

    entitySubscriptions.map((subscription) => {
      const subscriptionName = subscription.name;
      const permission = permissions.subscriptions[subscriptionName];
      if (permission) {
        // not sure it's needed for subscription
        validatePermissionSubscriptionTypes(entity, permission, subscription);
        validatePermissionAttributesAndStates(
          entity,
          permission,
          subscription.type,
        );
      }
    });
  }

  const emptyPermissionsIn = findEmptyEntityPermissions(permissions);

  passOrThrow(
    emptyPermissionsIn.length === 0,
    () =>
      `Entity '${
        entity.name
      }' has one or more empty permission definitions in: ${emptyPermissionsIn.join(
        ', ',
      )}`,
  );

  return permissions;
};

export const processViewEntityPermissions = (
  entity: ViewEntity,
  permissions: PermissionMap,
  defaultPermissions?,
): PermissionMap => {
  passOrThrow(
    isMap(permissions),
    () =>
      `ViewEntity '${entity.name}' permissions definition needs to be an object`,
  );

  if (permissions.read) {
    passOrThrow(
      isPermission(permissions.read) || isPermissionsArray(permissions.read),
      () => `Invalid 'read' permission definition for entity '${entity.name}'`,
    );
  } else if (defaultPermissions) {
    permissions.read = defaultPermissions.read;
  }

  if (permissions.find) {
    passOrThrow(
      isPermission(permissions.find) || isPermissionsArray(permissions.find),
      () => `Invalid 'find' permission definition for entity '${entity.name}'`,
    );
  } else if (defaultPermissions) {
    permissions.find = defaultPermissions.find;
  }

  if (permissions.find) {
    validatePermissionAttributesAndStates(entity, permissions.find, 'find');
  }

  if (permissions.read) {
    validatePermissionAttributesAndStates(entity, permissions.read, 'read');
  }

  const emptyPermissionsIn = findEmptyEntityPermissions(permissions);

  passOrThrow(
    emptyPermissionsIn.length === 0,
    () =>
      `ViewEntity '${
        entity.name
      }' has one or more empty permission definitions in: ${emptyPermissionsIn.join(
        ', ',
      )}`,
  );

  return permissions;
};

export const processActionPermissions = (
  action: Action,
  permissions: Permission | Permission[],
): Permission | Permission[] => {
  passOrThrow(
    isPermission(permissions) || isPermissionsArray(permissions),
    () => `Invalid permission definition for action '${action.name}'`,
  );

  // const permissionsArray = isArray(permissions) ? permissions : [permissions];
  const permissionsArray = isArray(permissions as Permission[])
    ? (permissions as Permission[])
    : ([permissions] as Permission[]);

  permissionsArray.map((permission) => {
    passOrThrow(
      !permission.userAttributes.length &&
        !permission.values.length &&
        !permission.states.length,
      () => `Incompatible permission definition for action '${action.name}'`,
    );

    validateActionLookupPermission(permission, action);
  });

  passOrThrow(
    !hasEmptyPermissions(permissions),
    () =>
      `Action '${action.name}' has one or more empty permission definitions`,
  );

  return permissions;
};
