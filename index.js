const validate = require('./src/validate')
const assert = require('./src/assert')
const types = require('./src/types')
const { maybe } = require('./src/maybe')
const { nullable } = require('./src/nullable')
const { define } = require('./src/validators')

function validationHelper (schema, options = {}) {
  const ctx = this
  const data = validate(ctx.request.body, schema, options)

  const isEmpty = !data || Object.keys(data).length === 0
  assert(!isEmpty, 'Empty request body')

  ctx.request.body = data
  return data
}

exports.middleware = (ctx, next) => {
  ctx.validate = validationHelper
  return next()
}

exports.validate = validate
exports.maybe = maybe
exports.nullable = nullable
exports.assert = assert
exports.define = define
exports.oneOf = types.oneOf
exports.string = types.string
exports.number = types.number
exports.int = types.int
