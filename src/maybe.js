exports.Maybe = Maybe
exports.maybe = maybe

function Maybe (value, defaultValue = null) {
  this.value = value
  this.defaultValue = defaultValue
}

function maybe (value, defaultValue) {
  return new Maybe(value, defaultValue)
}
