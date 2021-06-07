/* eslint-disable @typescript-eslint/no-explicit-any */

import { passOrThrow, isMap, isFunction } from '../util';
import { AttributeBase } from '../attribute/Attribute';
import { DataTypeFunction } from '../datatype/DataType';
import {
  generatePermissionDescription,
  processActionPermissions,
  Permission,
} from '../permission/Permission';
import { Context } from '../context/Context';
import { GraphQLResolveInfo, Source } from 'graphql';

export const ACTION_TYPE_MUTATION = 'mutation';
export const ACTION_TYPE_QUERY = 'query';
export const actionTypes = [ACTION_TYPE_MUTATION, ACTION_TYPE_QUERY];

export type ActionPreProcessor = (params: {
  action: Action;
  source?: any;
  input?: { [key: string]: unknown };
  context?: Context;
  info?: GraphQLResolveInfo;
}) => void | Promise<void>;

export type ActionPostProcessor = (params: {
  result?: { [key: string]: unknown };
  error?: Error;
  action: Action;
  source?: Source;
  input?: { [key: string]: unknown };
  context?: Context;
  info?: GraphQLResolveInfo;
}) => void | Promise<void>;

export type ActionResolver = (params: {
  source?: Source;
  input?: { [key: string]: unknown };
  context?: Context;
  info?: GraphQLResolveInfo;
}) => unknown | Promise<unknown>;

export type ActionSetup = {
  name?: string;
  description?: string;
  // input?: AttributeBase | Function | { [type: string]: Function };
  input?: any;
  // output?: AttributeBase | Function | { [type: string]: Function };
  output?: any;
  resolve: ActionResolver;
  type?: string;
  permissions?: ((...args) => Permission | Permission[]) | Permission | Permission[];
  // preProcessor?: Function;
  // postProcessor?: Function;
  preProcessor?: ActionPreProcessor;
  postProcessor?: ActionPostProcessor;
};

export class Action {
  name: string;
  description: string;
  // input: AttributeBase | Function | { [type: string]: Function };
  // private _input: AttributeBase | Function | { [type: string]: Function };
  input: any;
  private _input: any;
  // output: AttributeBase | Function | { [type: string]: Function };
  // private _output: AttributeBase | Function | { [type: string]: Function };
  output: any;
  private _output: any;
  resolve: ActionResolver;
  type: string;
  permissions: Permission | Permission[];
  private readonly _permissions: ((...args) => Permission | Permission[]) | Permission | Permission[];
  private _defaultPermissions: Permission | Permission[];
  descriptionPermissions: string | boolean;
  preProcessor?: ActionPreProcessor;
  postProcessor?: ActionPostProcessor;

  constructor(setup: ActionSetup = {} as ActionSetup) {
    const {
      name,
      description,
      input,
      output,
      resolve,
      type,
      permissions,
      preProcessor,
      postProcessor,
    } = setup;

    passOrThrow(name, () => 'Missing action name');
    passOrThrow(description, () => `Missing description for action '${name}'`);

    passOrThrow(
      !input || isMap(input) || isFunction(input),
      () => `Action '${name}' has an invalid input definition`,
    );

    passOrThrow(
      !output || isMap(output) || isFunction(output),
      () => `Action '${name}' has an invalid output definition`,
    );

    passOrThrow(
      isFunction(resolve),
      () => `Action '${name}' needs a resolve function`,
    );

    passOrThrow(
      !type || actionTypes.indexOf(type) >= 0,
      () =>
        `Unknown action type '${type}' used in action '${name}', try one of these: '${actionTypes.join(
          ', ',
        )}'`,
    );

    if (preProcessor) {
      passOrThrow(
        isFunction(preProcessor),
        () => `preProcessor of action '${name}' needs to be a valid function`,
      );

      this.preProcessor = preProcessor;
    }

    if (postProcessor) {
      passOrThrow(
        isFunction(postProcessor),
        () => `postProcessor of action '${name}' needs to be a valid function`,
      );

      this.postProcessor = postProcessor;
    }

    this.name = name;
    this.description = description;
    this.input = input;
    this.output = output;
    this.resolve = resolve;
    this.type = type || ACTION_TYPE_MUTATION;
    this._permissions = permissions;
  }

  getInput(): null | any {
    if (!this.hasInput()) {
      return null;
    }

    if (this._input) {
      return this._input;
    }

    if (isFunction(this.input)) {
      const inputFn = this.input as (...args) => any;
      this.input = inputFn();

      passOrThrow(
        isMap(this.input),
        () =>
          `Input definition function for action '${this.name}' does not return a map`,
      );
    }

    const inputAttr = this.input as AttributeBase;
    passOrThrow(
      inputAttr.type,
      () => `Missing input type for action '${this.name}'`,
    );

    if (isFunction(inputAttr.type)) {
      const inputAttrType = inputAttr.type as DataTypeFunction;
      this.input = this.input as AttributeBase;
      this.input.type = inputAttrType({
        setup: {
          name: 'input',
          description: this.input.description || this.description,
        },
      });
    }

    this._input = this.input;

    return this._input;
  }

  hasInput(): boolean {
    return !!this.input;
  }

  getOutput(): null | any {
    if (!this.hasOutput()) {
      return null;
    }

    if (this._output) {
      return this._output;
    }

    if (isFunction(this.output)) {
      const outputFn = this.output as (...args) => any;
      this.output = outputFn();

      passOrThrow(
        isMap(this.output),
        () =>
          `Output definition function for action '${this.name}' does not return a map`,
      );
    }

    const outputAttr = this.output as AttributeBase;
    passOrThrow(
      outputAttr.type,
      () => `Missing output type for action '${this.name}'`,
    );

    if (isFunction(outputAttr.type)) {
      const outputAttrType = outputAttr.type as DataTypeFunction;
      this.output = this.output as AttributeBase;
      this.output.type = outputAttrType({
        setup: {
          name: 'output',
          description: this.output.description || this.description,
        },
      });
    }

    this._output = this.output;

    return this._output;
  }

  hasOutput(): boolean {
    return !!this.output;
  }

  _processPermissions(): null | Permission | Permission[] {
    if (this._permissions) {
      if (isFunction(this._permissions)) {
        const permissionsFn = this._permissions as (...args) => Permission | Permission[];
        const permissions = permissionsFn();
        return processActionPermissions(this, permissions);
      }
      const permissions = this._permissions as Permission | Permission[];
      return processActionPermissions(this, permissions);
    } else if (this._defaultPermissions) {
      return processActionPermissions(this, this._defaultPermissions);
    }

    return null;
  }

  _generatePermissionDescriptions(): void {
    if (this.permissions) {
      let permissions: Permission | Permission[];
      if (isFunction(this._permissions)) {
        const permissionsFn = this._permissions as (...args) => Permission | Permission[];
        permissions = permissionsFn();
      } else {
        permissions = this._permissions as Permission | Permission[];
      }

      this.descriptionPermissions = generatePermissionDescription(permissions);
    }
  }

  _injectDefaultPermissionsBySchema(defaultPermissions): void {
    this._defaultPermissions = defaultPermissions;
  }

  getPermissions(): ((...args) => Permission | Permission[]) | Permission | Permission[] {
    if ((!this._permissions && !this._defaultPermissions) || this.permissions) {
      return this.permissions;
    }

    this.permissions = this._processPermissions();
    this._generatePermissionDescriptions();
    return this.permissions;
  }

  toString(): string {
    return this.name;
  }
}

export const isAction = (obj: unknown): obj is Action => {
  return obj instanceof Action;
};
