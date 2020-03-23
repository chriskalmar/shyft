/* eslint-disable @typescript-eslint/no-explicit-any */

import { passOrThrow, isMap, isFunction } from '../util';
import { AttributeBase } from '../attribute/Attribute';
import { DataTypeFunction } from '../datatype/DataType';
import {
  generatePermissionDescription,
  processActionPermissions,
  Permission,
} from '../permission/Permission';

export const ACTION_TYPE_MUTATION = 'mutation';
export const ACTION_TYPE_QUERY = 'query';
export const actionTypes = [ACTION_TYPE_MUTATION, ACTION_TYPE_QUERY];

export type ActionSetup = {
  name?: string;
  description?: string;
  // input?: AttributeBase | Function | { [type: string]: Function };
  input?: any;
  // output?: AttributeBase | Function | { [type: string]: Function };
  output?: any;
  resolve?: Function;
  type?: string;
  permissions?: Function | Permission | Permission[];
  postProcessor?: Function;
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
  resolve: Function;
  type: string;
  permissions: Function | Permission | Permission[];
  private _permissions: Function | Permission | Permission[];
  private _defaultPermissions: Function | Permission | Permission[];
  descriptionPermissions: string | false;
  postProcessor: Function;

  constructor(setup: ActionSetup = {} as ActionSetup) {
    const {
      name,
      description,
      input,
      output,
      resolve,
      type,
      permissions,
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

    if (postProcessor) {
      passOrThrow(
        isFunction(postProcessor),
        () =>
          `postProcessor of mutation '${name}' needs to be a valid function`,
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
      const inputFn = this.input as Function;
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
        name: 'input',
        description: this.input.description || this.description,
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
      const outputFn = this.output as Function;
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
        name: 'output',
        description: this.output.description || this.description,
      });
    }

    this._output = this.output;

    return this._output;
  }

  hasOutput(): boolean {
    return !!this.output;
  }

  _processPermissions(): null | Function {
    if (this._permissions) {
      if (isFunction(this._permissions)) {
        const permissionsFn = this._permissions as Function;
        return processActionPermissions(this, permissionsFn);
      }
      return processActionPermissions(this, this._permissions);

      // const permissions = isFunction(this._permissions)
      //   ? this._permissions()
      //   : this._permissions;
      // return processActionPermissions(this, permissions);
    } else if (this._defaultPermissions) {
      return processActionPermissions(this, this._defaultPermissions);
    }

    return null;
  }

  _generatePermissionDescriptions(): void {
    if (this.permissions) {
      this.descriptionPermissions = generatePermissionDescription(
        this.permissions,
      );
    }
  }

  _injectDefaultPermissionsBySchema(defaultPermissions): void {
    this._defaultPermissions = defaultPermissions;
  }

  getPermissions(): Function | Permission | Permission[] {
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

export const isAction = (obj: any): boolean => {
  return obj instanceof Action;
};
