exports.Maybe = Maybe
exports.maybe = maybe

function Maybe (value) {
  this.value = value
}

function maybe (value) {
  return new Maybe(value)
}
