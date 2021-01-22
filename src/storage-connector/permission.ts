import { CustomError, buildPermissionFilter } from '..';

export const PERMISSION_TYPES = {
  read: 10,
  find: 20,
  mutation: 30,
};

export const applyPermission = (where, permissionWhere) => {
  if (!permissionWhere) {
    return where;
  }

  const newWhere = { ...where };
  newWhere.$and.push(permissionWhere);

  return newWhere;
};

export const loadPermission = (entity, permissionType, entityMutation) => {
  if (!entity.permissions) {
    return null;
  } else if (permissionType === PERMISSION_TYPES.read) {
    return entity.permissions.read;
  } else if (permissionType === PERMISSION_TYPES.find) {
    return entity.permissions.find;
  } else if (permissionType === PERMISSION_TYPES.mutation) {
    if (!entity.permissions.mutations) {
      return null;
    }

    const mutationName = entityMutation.name;
    return entity.permissions.mutations[mutationName];
  }

  throw new CustomError(
    `Unknown permission type '${permissionType}'`,
    'PermissionTypeError',
  );
};

export const handlePermission = async (
  context,
  entity,
  permissionType,
  entityMutation,
  input,
) => {
  const permission = loadPermission(entity, permissionType, entityMutation);

  if (!permission) {
    return null;
  }

  const { userId, userRoles } = context;

  const permissionFilter = await buildPermissionFilter(
    permission,
    userId,
    userRoles,
    entity,
    input,
    context,
  );

  if (!permissionFilter) {
    throw new CustomError('Access denied', 'PermissionError', 403);
  }

  return permissionFilter;
};
