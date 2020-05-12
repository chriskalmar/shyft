import { passOrThrow, isArray, isMap } from '../util';

import { Entity, isEntity } from '../entity/Entity';
import { Action, isAction } from '../action/Action';
import { isDataTypeUser } from '../datatype/DataTypeUser';
import { StorageType, isStorageType } from '../storage/StorageType';
import {
  isPermission,
  isPermissionsArray,
  Permission,
} from '../permission/Permission';
import { isViewEntity, ViewEntity } from '../entity/ViewEntity';
import { isShadowEntity } from '../entity/ShadowEntity';

export type SchemaSetup = {
  entities?: Entity[] | null;
  defaultStorageType?: StorageType | null;
  actions?: Action[] | null;
  defaultActionPermissions?: null;
  permissionsMap?: PermissionsMap | null;
};

type EntityPermission = {
  // todo: improve typing
  [key: string]: any;
  // [entityName: string]: Permission;
  // _defaultPermissions: Permission | Permission[] | null;
};

type PermissionsMap = {
  entities: EntityPermission;
};

type SchemaEntity = Entity & {
  _isRegistered: boolean;
};

type SchemaViewEntity = ViewEntity & {
  _isRegistered: boolean;
};

type EntityMap = {
  [entityName: string]: SchemaEntity | SchemaViewEntity;
};

type ActionMap = {
  [actionName: string]: Action;
};

export class Schema {
  private _entityMap: EntityMap = {};
  private _actionMap: ActionMap = {};
  private _isValidated: boolean;
  private _userEntity = null;

  defaultStorageType: StorageType;
  permissionsMap: PermissionsMap | null;
  defaultActionPermissions;

  constructor(
    setup: SchemaSetup = {
      entities: null,
      defaultStorageType: null,
      actions: null,
      defaultActionPermissions: null,
      permissionsMap: null,
    },
  ) {
    this._entityMap = {};
    this._actionMap = {};
    this._isValidated = false;
    this._userEntity = null;

    const {
      entities,
      defaultStorageType,
      actions,
      permissionsMap,
      defaultActionPermissions,
    } = setup;

    if (defaultStorageType) {
      passOrThrow(
        isStorageType(defaultStorageType),
        () => 'Provided default storage type is invalid',
      );
    }

    this.defaultStorageType = defaultStorageType;

    if (permissionsMap) {
      passOrThrow(
        isMap(permissionsMap),
        () => 'Provided permissionsMap is invalid',
      );

      const permissionsMapKeys = Object.keys(permissionsMap);
      permissionsMapKeys.map(key => {
        passOrThrow(
          ['entities', 'actions'].includes(key),
          () =>
            'Unknown property used in permissionsMap (allowed: entities, actions)',
        );
      });

      if (permissionsMap.entities) {
        passOrThrow(
          isMap(permissionsMap.entities),
          () => 'Provided permissionsMap.entities is invalid',
        );

        const entityNames = Object.keys(permissionsMap.entities);

        entityNames.map(entityName => {
          const entityPermissions = permissionsMap.entities[entityName];

          if (entityPermissions) {
            passOrThrow(
              isMap(entityPermissions),
              () => `Provided permissionsMap for '${entityName}' is invalid`,
            );

            if (entityPermissions.read) {
              passOrThrow(
                isPermission(entityPermissions.read) ||
                  isPermissionsArray(entityPermissions.read),
                () =>
                  `Invalid 'read' permission definition in permissionsMap for '${entityName}'`,
              );
            }

            if (entityPermissions.find) {
              passOrThrow(
                isPermission(entityPermissions.find) ||
                  isPermissionsArray(entityPermissions.find),
                () =>
                  `Invalid 'find' permission definition in permissionsMap for '${entityName}'`,
              );
            }

            if (entityPermissions.mutations) {
              passOrThrow(
                isMap(entityPermissions.mutations),
                () =>
                  `Definition of mutations in permissionsMap for '${entityName}' needs to be a map of mutations and permissions`,
              );

              const mutationNames = Object.keys(entityPermissions.mutations);
              mutationNames.map(mutationName => {
                passOrThrow(
                  isPermission(entityPermissions.mutations[mutationName]) ||
                    isPermissionsArray(
                      entityPermissions.mutations[mutationName],
                    ),
                  () =>
                    `Invalid mutation permission definition in permissionsMap for '${entityName}.${mutationName}'`,
                );
              });
            }
          }
        });
      }

      this.permissionsMap = permissionsMap;
    }

    if (defaultActionPermissions) {
      passOrThrow(
        isPermission(defaultActionPermissions) ||
          isPermissionsArray(defaultActionPermissions),
        () => 'Invalid permission definition for defaultActionPermissions',
      );

      this.defaultActionPermissions = defaultActionPermissions;
    }

    if (entities) {
      passOrThrow(
        isArray(entities, true),
        () => "Schema needs 'entities' to be an array of type Entity",
      );

      entities.map(entity => this.addEntity(entity));
    }

    if (actions) {
      passOrThrow(
        isArray(actions),
        () => "Schema needs 'actions' to be an array of type Action",
      );

      actions.map(action => this.addAction(action));
    }
  }

  addEntity(entity) {
    passOrThrow(
      isEntity(entity) || isViewEntity(entity) || isShadowEntity(entity),
      () =>
        'Provided object to schema is not an entity or view entity or shadow entity',
    );

    passOrThrow(
      !this._entityMap[entity.name],
      () => `Entity '${entity.name}' already registered with this schema`,
    );

    if (entity.isUserEntity) {
      passOrThrow(
        !this._userEntity,
        () =>
          `Entity '${entity.name}' cannot be set as user entity, ` +
          `'${this._userEntity.name}' is already the user entity`,
      );

      this._userEntity = entity;
    }

    if (this.defaultStorageType) {
      entity._injectStorageTypeBySchema(this.defaultStorageType);
    }

    if (this.permissionsMap && this.permissionsMap.entities) {
      const entityDefaultPermissions =
        this.permissionsMap.entities[entity.name] || {};
      entityDefaultPermissions.mutations =
        entityDefaultPermissions.mutations || ({} as Permission);
      entityDefaultPermissions.subscriptions =
        entityDefaultPermissions.subscriptions || ({} as Permission);

      const defaultPermissions = this.permissionsMap.entities
        ._defaultPermissions;
      defaultPermissions.mutations = defaultPermissions.mutations || {};
      defaultPermissions.subscriptions = defaultPermissions.subscriptions || {};

      const newDefaultPermissions = {
        read: entityDefaultPermissions.read || defaultPermissions.read,
        find: entityDefaultPermissions.find || defaultPermissions.find,
        mutations: {
          ...defaultPermissions.mutations,
          ...entityDefaultPermissions.mutations,
        },
        subscriptions: {
          ...defaultPermissions.subscriptions,
          ...entityDefaultPermissions.subscriptions,
        },
      };

      if (isEntity(entity) || isViewEntity(entity)) {
        entity._injectDefaultPermissionsBySchema(newDefaultPermissions);
      }
    }

    entity._isRegistered = true;
    this._entityMap[entity.name] = entity;
    this._isValidated = false;
  }

  getUserEntity(throwIfMissing) {
    passOrThrow(
      !throwIfMissing || this._userEntity,
      () => 'There is no user entity registered yet',
    );

    return this._userEntity;
  }

  _lazyLoadMissingEntities(): void {
    let foundMissingCount = 0;

    const entityNames = Object.keys(this._entityMap);

    entityNames.forEach(entityName => {
      const entity = this._entityMap[entityName];
      const attributes = entity.getAttributes();

      const attributeNames = Object.keys(attributes);

      attributeNames.forEach(attributeName => {
        const attribute = attributes[attributeName];

        if (isEntity(attribute.type)) {
          // const attributeTypeAsEntity = attribute.type as Entity
          const targetEntity = attribute.type as SchemaEntity;

          if (this._entityMap[targetEntity.name]) {
            passOrThrow(
              targetEntity._isRegistered,
              () =>
                `Referenced entity '${targetEntity.name}' already registered with this schema`,
            );
          } else {
            this.addEntity(targetEntity);
            foundMissingCount++;
          }
        }
      });
    });

    if (foundMissingCount > 0) {
      this._lazyLoadMissingEntities();
    }
  }

  validate(): void {
    if (this._isValidated) {
      return;
    }

    passOrThrow(isMap(this._entityMap, true), () => 'Schema has no entities');

    this._lazyLoadMissingEntities();

    const entityNames = Object.keys(this._entityMap);

    if (this.permissionsMap && this.permissionsMap.entities) {
      const permissionsMapEntityNames = Object.keys(
        this.permissionsMap.entities,
      );

      permissionsMapEntityNames.map(permissionsMapEntityName => {
        passOrThrow(
          entityNames.includes(permissionsMapEntityName) ||
            permissionsMapEntityName === '_defaultPermissions',
          () =>
            `permissionsMap includes permissions for unknown entity ${permissionsMapEntityName}`,
        );
      });
    }

    entityNames.forEach(entityName => {
      const entity = this._entityMap[entityName];
      const attributes = entity.getAttributes();

      const attributeNames = Object.keys(attributes);

      // trigger validation and generation of permissions and indexes
      if (isEntity(entity) || isViewEntity(entity)) {
        entity.getPermissions();
      }
      if (isEntity(entity)) {
        const entityAsEntity = entity as Entity;
        entityAsEntity.getIndexes();
      }

      attributeNames.forEach(attributeName => {
        const attribute = attributes[attributeName];

        if (isEntity(attribute.type)) {
          const targetEntity = attribute.type as Entity;

          passOrThrow(
            this._entityMap[targetEntity.name],
            () =>
              `Entity '${targetEntity.name}' (referenced by '${entity.name}') ` +
              'needs to be registered with this schema',
          );

          // keep track of references
          targetEntity.referencedBy(entity.name, attributeName);
        } else if (isDataTypeUser(attribute.type)) {
          // replace with actual user entity
          attribute.type = this.getUserEntity(true);
        }
      });
    });

    const actionNames = Object.keys(this._actionMap);

    actionNames.forEach(actionName => {
      const action = this._actionMap[actionName];

      // trigger validation and generation of permissions
      action.getPermissions();
    });

    this._isValidated = true;
  }

  getEntities(): EntityMap {
    this.validate();
    return this._entityMap;
  }

  addAction(action: Action): void {
    passOrThrow(
      isAction(action),
      () => 'Provided object to schema is not an action',
    );

    passOrThrow(
      !this._actionMap[action.name],
      () => `Action '${action.name}' already registered with this schema`,
    );

    if (this.defaultActionPermissions) {
      action._injectDefaultPermissionsBySchema(this.defaultActionPermissions);
    }

    this._actionMap[action.name] = action;
    this._isValidated = false;
  }

  getActions(): ActionMap {
    this.validate();
    return this._actionMap;
  }
}

export const isSchema = (obj: any): boolean => {
  return obj instanceof Schema;
};
