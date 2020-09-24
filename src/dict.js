class Dict {
  constructor(keys, values) {
    this.keys = keys
    this.values = values
  }
}

function dict(keys, values) {
  return new Dict(keys, values)
}

exports.Dict = Dict
exports.dict = dict
