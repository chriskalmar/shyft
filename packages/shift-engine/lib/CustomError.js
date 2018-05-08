export default class CustomError extends Error {

  constructor(message, code, status) {
    super(message)
    Error.captureStackTrace(this, this.constructor)
    this.name = this.constructor.name
    this.code = code
    this.status = status || 400
  }
}
