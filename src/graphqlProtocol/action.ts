import { GraphQLNonNull } from 'graphql';

import * as _ from 'lodash';
import {
  generateInput,
  generateDataInput,
  generateOutput,
  generateDataOutput,
} from './io';

import { ProtocolGraphQL } from './ProtocolGraphQL';
import { isObjectDataType } from '../engine/datatype/ObjectDataType';
import { isListDataType } from '../engine/datatype/ListDataType';
import { validateActionPayload } from '../engine/validation';
import { ACTION_TYPE_MUTATION } from '../engine/action/Action';
import { buildActionPermissionFilter } from '../engine/permission/Permission';
import { CustomError } from '../engine/CustomError';

const AccessDeniedError = new CustomError(
  'Access denied',
  'PermissionError',
  403,
);

const fillSingleDefaultValues = async (param, payload, context) => {
  let ret = payload;

  if (typeof payload === 'undefined') {
    if (param.required && param.defaultValue) {
      ret = param.defaultValue({}, context);
    }
  }

  if (isObjectDataType(param.type)) {
    const attributes = param.type.getAttributes();
    // eslint-disable-next-line no-use-before-define, @typescript-eslint/no-use-before-define
    ret = fillNestedDefaultValues(attributes, ret, context);
  }

  if (isListDataType(param.type) && payload) {
    const paramType = param.type.getItemType();

    ret = await Promise.all(
      payload.map(async itemPayload => {
        if (isObjectDataType(paramType)) {
          const attributes = paramType.getAttributes();
          // eslint-disable-next-line no-use-before-define, @typescript-eslint/no-use-before-define
          return fillNestedDefaultValues(attributes, itemPayload, context);
        }

        return await fillSingleDefaultValues(paramType, itemPayload, context);
      }),
    );
  }

  return ret;
};

const fillNestedDefaultValues = async (params, payload, context) => {
  const ret = {
    ...payload,
  };

  const paramNames = Object.keys(params);
  await Promise.all(
    paramNames.map(async paramName => {
      const param = params[paramName];
      ret[paramName] = await fillSingleDefaultValues(
        param,
        ret[paramName],
        context,
      );
    }),
  );

  return ret;
};

const fillDefaultValues = async (param, payload, context) =>
  fillSingleDefaultValues(param, payload, context);

export const handlePermission = async (context, action, input) => {
  const permission = action.getPermissions();

  if (!permission) {
    return null;
  }

  const { userId, userRoles } = context;

  const {
    where: permissionWhere,
    lookupPermissionEntity,
  } = await buildActionPermissionFilter(
    permission,
    userId,
    userRoles,
    action,
    input,
    context
  );

  if (!permissionWhere) {
    throw AccessDeniedError;
  }

  // only if non-empty where clause
  if (Object.keys(permissionWhere).length > 0) {
    const storageType = lookupPermissionEntity.getStorageType();
    const found = await storageType.checkLookupPermission(
      lookupPermissionEntity,
      permissionWhere,
      context,
    );

    if (!found) {
      throw AccessDeniedError;
    }
  }

  return permissionWhere;
};

export const generateActions = (graphRegistry, actionTypeFilter) => {
  const protocolConfiguration = ProtocolGraphQL.getProtocolConfiguration();

  const actions = {};

  _.forEach(graphRegistry.actions, ({ action }, actionName) => {
    if (action.type !== actionTypeFilter) {
      return;
    }

    const queryName = protocolConfiguration.generateActionTypeName(action);
    const isMutation = action.type === ACTION_TYPE_MUTATION;

    let actionDataInputType;
    let actionDataOutputType;
    let actionInputType;
    let inputArgs;

    if (action.hasInput()) {
      actionDataInputType = generateDataInput(
        actionName,
        action.getInput(),
        true,
      );
    }

    if (action.hasInput() || isMutation) {
      actionInputType = generateInput(
        actionName,
        actionDataInputType,
        true,
        isMutation,
      );

      inputArgs = {
        input: {
          description: 'Input argument for this action',
          type: action.hasInput()
            ? new GraphQLNonNull(actionInputType)
            : actionInputType,
        },
      };
    }

    if (action.hasOutput()) {
      actionDataOutputType = generateDataOutput(
        actionName,
        action.getOutput(),
        graphRegistry,
        true,
      );
    }

    const actionOutputType = generateOutput(
      actionName,
      actionDataOutputType,
      true,
      isMutation,
    );

    actions[queryName] = {
      type: actionOutputType,
      description: `${action.description}\n${action.descriptionPermissions ||
        ''}`,

      args: inputArgs,

      resolve: async (source, args, context, info) => {
        let payload;
        let clientMutationId;

        if (action.hasInput()) {
          const input = action.getInput();
          payload = args.input.data;
          clientMutationId = args.input.clientMutationId;

          args.input.data = await fillDefaultValues(input, payload, context);
          await validateActionPayload(input, payload, action, context);
        }

        if (isMutation) {
          clientMutationId = args.input
            ? args.input.clientMutationId
            : undefined;
        }

        await handlePermission(context, action, payload);

        try {
          const result = await action.resolve(source, payload, context, info);

          if (action.postProcessor) {
            await action.postProcessor(
              null,
              result,
              action,
              source,
              payload,
              context,
              info,
            );
          }

          return {
            result,
            clientMutationId,
          };
        }
        catch (error) {
          if (action.postProcessor) {
            await action.postProcessor(
              error,
              null,
              action,
              source,
              payload,
              context,
              info,
            );
          }

          throw error;
        }
      },
    };
  });

  return actions;
};
