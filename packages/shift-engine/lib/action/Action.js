import { passOrThrow, isMap, isFunction } from '../util';

import {
  generatePermissionDescription,
  processActionPermissions,
} from '../permission/Permission';

export const ACTION_TYPE_MUTATION = 'mutation';
export const ACTION_TYPE_QUERY = 'query';
export const actionTypes = [ ACTION_TYPE_MUTATION, ACTION_TYPE_QUERY ];

class Action {
  constructor(setup = {}) {
    const {
      name,
      description,
      input,
      output,
      resolve,
      type,
      permissions,
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

    this.name = name;
    this.description = description;
    this.input = input;
    this.output = output;
    this.resolve = resolve;
    this.type = type || ACTION_TYPE_MUTATION;
    this._permissions = permissions;
  }

  getInput() {
    if (!this.hasInput()) {
      return null;
    }

    if (this._input) {
      return this._input;
    }

    if (isFunction(this.input)) {
      this.input = this.input();

      passOrThrow(
        isMap(this.input),
        () =>
          `Input definition function for action '${
            this.name
          }' does not return a map`,
      );
    }

    passOrThrow(
      this.input.type,
      () => `Missing input type for action '${this.name}'`,
    );

    if (isFunction(this.input.type)) {
      this.input.type = this.input.type({
        name: 'input',
        description: this.input.description || this.description,
      });
    }

    this._input = this.input;

    return this._input;
  }

  hasInput() {
    return !!this.input;
  }

  getOutput() {
    if (!this.hasOutput()) {
      return null;
    }

    if (this._output) {
      return this._output;
    }

    if (isFunction(this.output)) {
      this.output = this.output();

      passOrThrow(
        isMap(this.output),
        () =>
          `Output definition function for action '${
            this.name
          }' does not return a map`,
      );
    }

    passOrThrow(
      this.output.type,
      () => `Missing output type for action '${this.name}'`,
    );

    if (isFunction(this.output.type)) {
      this.output.type = this.output.type({
        name: 'output',
        description: this.output.description || this.description,
      });
    }

    this._output = this.output;

    return this._output;
  }

  hasOutput() {
    return !!this.output;
  }

  _processPermissions() {
    if (this._permissions) {
      const permissions = isFunction(this._permissions)
        ? this._permissions()
        : this._permissions;

      return processActionPermissions(this, permissions);
    }
    else if (this._defaultPermissions) {
      return processActionPermissions(this, this._defaultPermissions);
    }

    return null;
  }

  _generatePermissionDescriptions() {
    if (this.permissions) {
      this.descriptionPermissions = generatePermissionDescription(
        this.permissions,
      );
    }
  }

  _injectDefaultPermissionsBySchema(defaultPermissions) {
    this._defaultPermissions = defaultPermissions;
  }

  getPermissions() {
    if ((!this._permissions && !this._defaultPermissions) || this.permissions) {
      return this.permissions;
    }

    this.permissions = this._processPermissions();
    this._generatePermissionDescriptions();
    return this.permissions;
  }

  toString() {
    return this.name;
  }
}

export default Action;

export const isAction = obj => {
  return obj instanceof Action;
};
