
import {
  passOrThrow,
  resolveFunctionMap,
  isMap,
  // isArray,
  isFunction,
} from '../util';

import { isDataType } from '../datatype/DataType';
import { isEntity } from '../entity/Entity';
import { isObjectDataType } from '../datatype/ObjectDataType';


class Action {

  constructor (setup = {}) {

    const {
      name,
      description,
      input,
      output,
      resolve,
    } = setup

    passOrThrow(name, () => 'Missing action name')
    passOrThrow(description, () => `Missing description for action '${name}'`)
    passOrThrow(input, () => `Missing input definition for action '${name}'`)
    passOrThrow(output, () => `Missing output definition for action '${name}'`)

    passOrThrow(
      isMap(input) || isFunction(input),
      () => `Action '${name}' needs an input definition as a map or a function returning such a map`
    )

    passOrThrow(
      isMap(output) || isFunction(output),
      () => `Action '${name}' needs an output definition as a map or a function returning such a map`
    )

    passOrThrow(
      isFunction(resolve),
      () => `Action '${name}' needs a resolve function`
    )

    this.name = name
    this.description = description
    this._inputMap = input
    this._outputMap = output
    this.resolve = resolve
  }



  getInput () {
    if (this._input) {
      return this._input
    }

    const ret = this._input = this._processParamMap(this._inputMap, true)
    return ret
  }


  hasInputParams () {
    return isMap(this.getInput(), true)
  }


  getOutput () {
    if (this._output) {
      return this._output
    }

    const ret = this._output = this._processParamMap(this._outputMap, false)
    return ret
  }


  hasOutputParams () {
    return isMap(this.getOutput(), true)
  }



  _processParam (rawParam, paramName) {

    if (isObjectDataType(rawParam)) {
      rawParam.getAttributes()
      return rawParam
    }

    const param = {
      ...rawParam,
      required: !!rawParam.required,
      name: paramName
    }

    passOrThrow(
      isDataType(param.type) || isEntity(param.type),
      () => `'${this.name}.${paramName}' has invalid data type '${String(param.type)}'`
    )

    passOrThrow(
      !param.defaultValue || isFunction(param.defaultValue),
      () => `'${this.name}.${paramName}' has an invalid defaultValue function'`
    )

    return param
  }


  _processParamMap (_paramMap, isInput=true) {

    // if it's a function, resolve it to get that map
    const paramMap = resolveFunctionMap(_paramMap);

    passOrThrow(
      isMap(paramMap),
      () => `${isInput ? 'Input' : 'Output'} definition function for action '${this.name}' does not return a map`
    )

    const paramNames = Object.keys(paramMap);
    const resultParams = {}

    paramNames.forEach((paramName) => {
      resultParams[ paramName ] = this._processParam(paramMap[ paramName ], paramName)
    })

    return resultParams
  }


  toString() {
    return this.name
  }

}


export default Action


export const isAction = (obj) => {
  return (obj instanceof Action)
}
