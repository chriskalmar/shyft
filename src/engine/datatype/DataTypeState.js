import { passOrThrow, isMap } from '../util';

import { stateNameRegex, STATE_NAME_PATTERN } from '../constants';

import * as _ from 'lodash';

import DataType from './DataType';

export class DataTypeState extends DataType {
  constructor(setup = {}) {
    const { name, description, states } = setup;

    passOrThrow(
      isMap(states, true),
      () => `'Missing states for data type '${name}'`,
    );

    const stateNames = Object.keys(states);
    const uniqueIds = [];

    stateNames.map(stateName => {
      const stateId = states[stateName];
      uniqueIds.push(stateId);

      passOrThrow(
        stateNameRegex.test(stateName),
        () =>
          `Invalid state name '${stateName}' for data type '${name}' (Regex: /${STATE_NAME_PATTERN}/)`,
      );

      passOrThrow(
        stateId === parseInt(stateId, 10) && stateId > 0,
        () =>
          `State '${stateName}' for data type '${name}' has an invalid unique ID (needs to be a positive integer)`,
      );
    });

    passOrThrow(
      uniqueIds.length === _.uniq(uniqueIds).length,
      () =>
        `Each state defined for data type '${name}' needs to have a unique ID`,
    );

    super({
      ...setup,
      description: description || `States: ${stateNames.join(', ')}`,
      enforceIndex: true,
      mock() {
        const randomPos = Math.floor(Math.random() * uniqueIds.length);
        return uniqueIds[randomPos];
      },
    });

    this.states = states;
  }

  toString() {
    return this.name;
  }
}

export const isDataTypeState = obj => {
  return obj instanceof DataTypeState;
};
