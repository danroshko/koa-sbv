const assert = require('./assert')

exports.Either = Either
exports.either = either
exports.validateEither = validateEither

function Either (...values) {
  this.values = values
}

function either (...values) {
  return new Either(...values)
}

function validateEither (data, spec, name) {
  const msg = `Invalid value for ${name}, expecting one of the following: ${spec.values}`
  assert(spec.values.includes(data), msg)

  return data
}
