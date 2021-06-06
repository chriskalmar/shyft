import { GraphQLNonNull } from 'graphql';

import * as _ from 'lodash';
import {
  generateInput,
  generateDataInput,
  generateOutput,
  generateDataOutput,
} from './io';

import { ProtocolGraphQL } from './ProtocolGraphQL';
import { ProtocolGraphQLConfiguration } from './ProtocolGraphQLConfiguration';
import { isObjectDataType } from '../engine/datatype/ObjectDataType';
import { isListDataType } from '../engine/datatype/ListDataType';
import { validateActionPayload } from '../engine/validation';
import { ACTION_TYPE_MUTATION, Action } from '../engine/action/Action';
import { buildActionPermissionFilter } from '../engine/permission/Permission';
import { CustomError } from '../engine/CustomError';
import { Attribute } from '../engine/attribute/Attribute';
import { GraphRegistryType } from './graphRegistry';

const AccessDeniedError = new CustomError(
  'Access denied',
  'PermissionError',
  403,
);

const fillSingleDefaultValues = async (param, payload, context) => {
  let ret = payload;

  if (typeof payload === 'undefined') {
    if (param.defaultValue) {
      ret = (<Attribute>param).defaultValue({ payload: {}, context });
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
      payload.map(async (itemPayload) => {
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
    paramNames.map(async (paramName) => {
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

export const handlePermission = async (
  context: any,
  action: Action,
  input: any,
) => {
  const permission = action.getPermissions();

  if (!permission) {
    return null;
  }

  const { userId, userRoles } = context;

  const {
    where: permissionWhere,
    lookupPermissionEntity,
  } = await buildActionPermissionFilter(
    () => permission,
    userId,
    userRoles,
    action,
    input,
    context,
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

export const generateActions = (
  graphRegistry: GraphRegistryType,
  actionTypeFilter: string,
) => {
  const protocolConfiguration = ProtocolGraphQL.getProtocolConfiguration() as ProtocolGraphQLConfiguration;

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
      description: `${action.description}\n${
        action.descriptionPermissions || ''
      }`,

      args: inputArgs,

      resolve: async (source, args, context, info) => {
        let payload;
        let clientMutationId;

        if (action.hasInput()) {
          const input = action.getInput();
          payload = args.input.data;
          clientMutationId = args.input.clientMutationId;

          payload = await fillDefaultValues(input, payload, context);
          await validateActionPayload(input, payload, action, context);
        }

        if (isMutation) {
          clientMutationId = args.input
            ? args.input.clientMutationId
            : undefined;
        }

        await handlePermission(context, action, payload);

        try {
          if (action.preProcessor) {
            await action.preProcessor({
              action,
              source,
              input: payload,
              context,
              info,
            });
          }

          const result: Record<string, any> = await action.resolve({
            source,
            input: payload,
            context,
            info,
          });

          if (action.postProcessor) {
            await action.postProcessor({
              result,
              action,
              source,
              input: payload,
              context,
              info,
            });
          }

          return {
            result,
            clientMutationId,
          };
        } catch (error) {
          if (action.postProcessor) {
            await action.postProcessor({
              error,
              action,
              source,
              input: payload,
              context,
              info,
            });
          }

          throw error;
        }
      },
    };
  });

  return actions;
};
