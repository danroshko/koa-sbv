module.exports = function (value, msg) {
  if (!value) {
    throw new ValidationError(msg)
  }
}

class ValidationError extends Error {
  constructor(message) {
    super(message)

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ValidationError)
    }

    this.status = 400
    this.expose = true
  }
}
