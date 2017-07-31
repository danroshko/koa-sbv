const assert = require('./assert')
const validators = require('./validators')
const { Maybe } = require('./maybe')
const { Range, validateRange } = require('./range')

module.exports = function (spec) {
  const ctx = this
  const data = ctx.request.body

  const isEmpty = !data || Object.keys(data).length === 0
  assert(!isEmpty, 'Empty request body')

  ctx.request.body = validate(data, spec)
}

function validate (data, spec, name) {
  if (spec instanceof Maybe) {
    spec = spec.value
    if (data == null) return null
  }

  assert(data != null, `Missing required parameter ${name}`)

  if (spec instanceof Range) {
    return validateRange(data, spec, name)
  }

  if (spec instanceof RegExp) {
    const msg = `Invalid value for ${name}, expecting string ${spec}`
    assert(typeof data === 'string' && spec.test(data), msg)
    return data
  }

  if (typeof spec === 'string') {
    const validator = validators[spec]
    if (typeof validator !== 'function') {
      throw new Error('Unknown validator ' + spec)
    }

    validator(data, name)
    return data
  }

  if (Array.isArray(spec)) {
    const options = spec[1] || {}
    const min = options.min || 0
    const max = options.max
    const len = options.len
    assert(Array.isArray(data), `expecting ${name} to be an array`)

    let msg = `expecting ${name} to contain no less than ${min} elements`
    assert(data.length >= min, msg)

    if (max) {
      msg = `expecting ${name} to contain less than ${max} elements`
      assert(data.length <= max, msg)
    }

    if (len) {
      msg = `expecting ${name} to contain exactly ${len} elements`
      assert(data.length === len, msg)
    }

    return data.map((row, i) => {
      return validate(row, spec[0], `${name}[${i}]`)
    })
  }

  if (typeof spec === 'object') {
    const result = {}
    const msg = `expecting ${name} to be an object`
    assert(typeof data === 'object', msg)

    for (let prop in spec) {
      const newName = name ? `${name}.${prop}` : prop
      const value = validate(data[prop], spec[prop], newName)
      if (value != null) {
        result[prop] = value
      }
    }
    return result
  }

  throw new Error('Check your specification for ' + name)
}
