const validate = require('./src/validate')
const assert = require('./src/assert')
const { maybe } = require('./src/maybe')
const { range } = require('./src/range')
const { either } = require('./src/either')

module.exports = exports = async function (ctx, next) {
  ctx.validate = validate
  await next()
}

exports.maybe = maybe
exports.range = range
exports.either = either
exports.assert = assert
