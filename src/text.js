const assert = require('./assert')

exports.Text = Text
exports.text = text
exports.validateText = validateText

const DEFAULT_MIN = 0
const DEFAULT_MAX = 250

function Text (arg1, arg2) {
  if (arg2 == null) {
    this.min = DEFAULT_MIN
    this.max = arg1 || DEFAULT_MAX
  } else {
    this.min = arg1 || DEFAULT_MIN
    this.max = arg2 || DEFAULT_MAX
  }
}

function text (arg1, arg2) {
  return new Text(arg1, arg2)
}

function validateText (data, text, name) {
  const msg = `Invalid value for ${name}, expecting string from ${text.min} to ${
    text.max
  } characters long`

  assert(typeof data === 'string', msg)
  assert(data.length >= text.min && data.length <= text.max, msg)

  return data
}
