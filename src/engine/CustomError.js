export class CustomError extends Error {
  constructor(message, code, status, meta) {
    super(message);
    Error.captureStackTrace(this, this.constructor);
    this.name = this.constructor.name;
    this.code = code;
    this.status = status;
    this.meta = meta;
  }
}
