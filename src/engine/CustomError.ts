/* eslint-disable @typescript-eslint/no-explicit-any */

declare type ErrorInterface = Error;

declare class Error implements ErrorInterface {
  name: string;
  message: string;
  static captureStackTrace(object: any, objectConstructor?: any): any;
}

export class CustomError extends Error {
  code: any;
  status?: any;
  meta?: any;

  constructor(message?: string, code?: any, status?: any, meta?: any) {
    // super(message);
    super();
    Error.captureStackTrace(this, this.constructor);
    this.message = message;
    this.name = this.constructor.name;
    this.code = code;
    this.status = status;
    this.meta = meta;
  }
}
