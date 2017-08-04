const validate = require('./src/validate')
const assert = require('./src/assert')
const { maybe } = require('./src/maybe')
const { range } = require('./src/range')
const { either } = require('./src/either')

module.exports = exports = (ctx, next) => {
  ctx.validate = validateHelper
  ctx.validateQuery = validateQuery

  return next()
}

exports.validate = validate
exports.maybe = maybe
exports.range = range
exports.either = either
exports.assert = assert

function validateHelper (schema, options = {}) {
  const ctx = this
  const data = validate(ctx.request.body, schema, options)

  const isEmpty = !data || Object.keys(data).length === 0
  assert(!isEmpty, 'Empty request body')

  ctx.request.body = data
  return data
}

function validateQuery (schema, options = {}) {
  const ctx = this

  if (options.parseNumbers == null) {
    options.parseNumbers = true
  }

  if (options.makeArrays == null) {
    options.makeArrays = true
  }

  if (options.notStrict == null) {
    options.notStrict = true
  }

  ctx.query = validate(ctx.query, schema, options)
  return ctx.query
}
