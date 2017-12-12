const validate = require('./src/validate')
const assert = require('./src/assert')
const { maybe } = require('./src/maybe')
const { range } = require('./src/range')
const { either } = require('./src/either')
const { text } = require('./src/text')
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
exports.text = text
exports.maybe = maybe
exports.range = range
exports.either = either
exports.assert = assert
exports.define = define
