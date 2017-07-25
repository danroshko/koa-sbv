const assert = require('./assert')

exports.Range = Range
exports.range = range
exports.validateRange = validateRange

function Range (start, end, isInt = false) {
  this.start = start
  this.end = end
  this.isInt = isInt
}

function range (start, end, isInt) {
  return new Range(start, end, isInt)
}

function validateRange (data, range, name) {
  const type = range.isInt ? 'integer' : 'number'
  const msg = `Invalid value for ${name}, expecting ${type} from ${range.start} to ${range.end}`

  assert(typeof data === 'number', msg)
  assert(data >= range.start && data <= range.end, msg)
  if (data.isInt) {
    assert(Number.isInteger(data), msg)
  }

  return data
}
