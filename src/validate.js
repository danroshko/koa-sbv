const assert = require('./assert')
const { validators } = require('./validators')
const { Maybe } = require('./maybe')
const { SbvType } = require('./types')

module.exports = validate

function validate (data, spec, options = {}, name = '') {
  const notStrict = options.notStrict || false
  const parseNumbers = options.parseNumbers || false
  const makeArrays = options.makeArrays || false

  if (spec instanceof Maybe) {
    if (data == null) {
      return spec.defaultValue
    }

    spec = spec.value
  }

  if (notStrict && data == null) return null

  assert(data != null, `Missing required parameter ${name}`)

  if (typeof spec === 'string') {
    const validator = validators[spec]
    if (typeof validator !== 'function') {
      throw new Error('Unknown validator ' + spec)
    }

    return validator(data, name, parseNumbers)
  }

  if (spec instanceof SbvType) {
    return spec.validate(data, name)
  }

  if (spec instanceof RegExp) {
    const msg = `Invalid value for ${name}, expecting string ${spec}`
    assert(typeof data === 'string' && spec.test(data), msg)
    return data
  }

  if (Array.isArray(spec)) {
    const arrayOptions = spec[1] || {}
    const min = arrayOptions.min || 0
    const max = arrayOptions.max
    const len = arrayOptions.len

    if (makeArrays && !Array.isArray(data)) {
      data = [data]
    } else {
      assert(Array.isArray(data), `expecting ${name} to be an array`)
    }

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
      return validate(row, spec[0], options, `${name}[${i}]`)
    })
  }

  if (typeof spec === 'object') {
    const result = {}
    const msg = `expecting ${name} to be an object`
    assert(typeof data === 'object', msg)

    for (let prop in spec) {
      const newName = name ? `${name}.${prop}` : prop
      const value = validate(data[prop], spec[prop], options, newName)
      if (value != null) {
        result[prop] = value
      }
    }
    return result
  }

  throw new Error('Invalid description for ' + name)
}
