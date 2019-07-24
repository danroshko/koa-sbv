const assert = require('./assert')

const emailPattern = /^[A-Z0-9_!#$%&'*+/=?`{|}~^.-]+@[A-Z0-9.-]+$/i
const objectidPattern = /^[0-9a-fA-F]{24}$/
const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

const validators = {
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
    assert(typeof val === 'number' && !Number.isNaN(val), msg)
    return val
  },

  float (val, name, parseNumbers) {
    return this.number(val, name, parseNumbers)
  },

  string (val, name) {
    const msg = `Invalid value for ${name}, expecting string`
    assert(typeof val === 'string' && val.length < 1e4, msg)
    return val
  },

  email (val, name) {
    const msg = `Invalid value for ${name}, expecting valid email address`
    assert(typeof val === 'string' && val.length < 254 && emailPattern.test(val), msg)

    return val.toLowerCase()
  },

  boolean (val, name) {
    const msg = `Invalid value for ${name}, expecting boolean`
    assert(typeof val === 'boolean', msg)
    return val
  },

  ObjectId (val, name) {
    const msg = `Invalid value for ${name}, expecting 24 digit hexadecimal string`
    assert(typeof val === 'string' && objectidPattern.test(val), msg)
    return val
  },

  uuid (val, name) {
    const msg = `Invalid value for ${name}, expecting valid UUID`
    assert(typeof val === 'string' && val.length === 36 && uuidPattern.test(val), msg)
    return val
  },

  json (val, name) {
    const msg = `Invalid value for ${name}, expecting array or object`
    assert(typeof val === 'object', msg)
    return val
  }
}

/**
 * Define new validation rule
 * @param {String} name
 * @param {Function} func
 */
function define (name, func) {
  validators[name] = func
}

exports.validators = validators
exports.define = define
