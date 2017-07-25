const validate = require('./src/validate')
const { maybe } = require('../src/maybe')
const { range } = require('../src/range')

module.exports = exports = async function (ctx, next) {
  ctx.validate = validate
  await next()
}

exports.maybe = maybe
exports.range = range
