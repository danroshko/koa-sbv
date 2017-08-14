const assert = require('./assert')

module.exports = {
  int (val, name, parseNumbers) {
    if (parseNumbers && typeof val === 'string') {
      val = +val
    }

    const msg = `Invalid value for ${name}, expecting integer`
    assert(Number.isInteger(val), msg)
    return val
  },

  uint (val, name, parseNumbers) {
    if (parseNumbers && typeof val === 'string') {
      val = +val
    }

    const msg = `Invalid value for ${name}, expecting non-negative integer`
    assert(Number.isInteger(val) && val >= 0, msg)
    return val
  },

  number (val, name, parseNumbers) {
    if (parseNumbers && typeof val === 'string') {
      val = +val
    }

    const msg = `Invalid value for ${name}, expecting number`
    assert(typeof val === 'number', msg)
    return val
  },

  float (val, name, parseNumbers) {
    if (parseNumbers && typeof val === 'string') {
      val = +val
    }

    const msg = `Invalid value for ${name}, expecting number`
    assert(typeof val === 'number', msg)
    return val
  },

  string (val, name) {
    const msg = `Invalid value for ${name}, expecting string`
    assert(typeof val === 'string', msg)
    return val
  },

  email (val, name) {
    const msg = `Invalid value for ${name}, expecting valid email address`
    const re = /^[A-Z0-9_!#$%&'*+/=?`{|}~^.-]+@[A-Z0-9.-]+$/i
    assert(typeof val === 'string' && re.test(val), msg)
    return val
  },

  boolean (val, name) {
    const msg = `Invalid value for ${name}, expecting boolean`
    assert(typeof val === 'boolean', msg)
    return val
  },

  ObjectId (val, name) {
    const msg = `Invalid value for ${name}, expecting 24 digit hexadecimal string`
    const re = /^[0-9a-fA-F]{24}$/
    assert(typeof val === 'string' && re.test(val), msg)
    return val
  }
}
