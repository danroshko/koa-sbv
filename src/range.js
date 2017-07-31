const assert = require('./assert')

exports.Range = Range
exports.range = range
exports.validateRange = validateRange

function Range (start, stop, step) {
  this.start = start
  this.stop = stop
  this.step = step
}

function range (start, stop, step) {
  return new Range(start, stop, step)
}

function validateRange (data, range, name) {
  const description = `range(${range.start}, ${range.stop}, ${range.step || 0})`
  const msg = `Invalid value for ${name}, expecting value in ${description}`

  assert(typeof data === 'number', msg)
  assert(data >= range.start && data <= range.stop, msg)

  if (range.step) {
    const steps = (data - range.start) / range.step
    assert(Number.isInteger(steps), msg)
  }

  return data
}
