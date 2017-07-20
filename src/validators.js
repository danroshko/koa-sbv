const assert = require('assert')

module.exports = {
  int (val, name) {
    const msg = `Invalid value for ${name}, expecting integer`
    assert(Number.isInteger(val), msg)
  },

  uint (val, name) {
    const msg = `Invalid value for ${name}, expecting non-negative integer`
    assert(Number.isInteger(val) && val >= 0, msg)
  },

  number (val, name) {
    const msg = `Invalid value for ${name}, expecting number`
    assert(typeof val === 'number', msg)
  },

  float (val, name) {
    const msg = `Invalid value for ${name}, expecting number`
    assert(typeof val === 'number', msg)
  },

  string (val, name) {
    const msg = `Invalid value for ${name}, expecting string`
    assert(typeof val === 'string', msg)
  },

  email (val, name) {
    const msg = `Invalid value for ${name}, expecting valid email address`
    const re = /^[A-Z0-9_!#$%&'*+/=?`{|}~^.-]+@[A-Z0-9.-]+$/i
    assert(typeof val === 'string' && re.test(val), msg)
  },

  percent (val, name) {
    const msg = `Invalid value for ${name}, expecting number in range from 0 to 100`
    const isValid = typeof val === 'number' && val >= 0 && val <= 100
    assert(isValid, msg)
  }
}
