class Nullable {
  constructor (value) {
    this.value = value
  }
}

function nullable (value) {
  return new Nullable(value)
}

exports.Nullable = Nullable
exports.nullable = nullable
