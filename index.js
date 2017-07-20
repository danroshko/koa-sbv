const validate = require('./src/validate')
const validators = require('./src/validators')

module.exports = exports = async function (ctx, next) {
  ctx.validate = validate
  await next()
}

exports.validators = validators
