const assert = require('./assert')
const { defaults, validators } = require('./validators')
const { Dict } = require('./dict')
const { Maybe } = require('./maybe')
const { Nullable } = require('./nullable')
const { SbvType } = require('./types')

module.exports = validate

function validate(data, spec, options = {}, name = '') {
  const notStrict = options.notStrict || false
  const parseNumbers = options.parseNumbers || false
  const makeArrays = options.makeArrays || false

  if (spec instanceof Maybe) {
    if (data === undefined) {
      return spec.defaultValue
    }

    spec = spec.value
  }

  if (spec instanceof Nullable) {
    if (data === null) {
      return null
    }

    spec = spec.value
  }

  if (notStrict && data === undefined) return undefined

  assert(data != null, `Missing required parameter ${name}`)

  if (typeof spec === 'string') {
    const validator = validators[spec]
    if (typeof validator !== 'function') {
      throw new Error('Unknown validator ' + spec)
    }

    return validator(data, name, parseNumbers)
  }

  if (spec instanceof SbvType) {
    return spec.validate(data, name, options)
  }

  if (spec instanceof RegExp) {
    const msg = `Invalid value for ${name}, expecting string ${spec}`
    assert(typeof data === 'string' && spec.test(data), msg)
    return data
  }

  if (Array.isArray(spec)) {
    const arrayOptions = spec[1] || {}
    const min = arrayOptions.min || 0
    const max = arrayOptions.max || defaults.maxArrLength
    const len = arrayOptions.len

    if (makeArrays && !Array.isArray(data)) {
      data = [data]
    } else {
      assert(Array.isArray(data), `expecting ${name} to be an array`)
    }

    let msg = `expecting ${name} to contain no less than ${min} elements`
    assert(data.length >= min, msg)

    msg = `expecting ${name} to contain less than ${max} elements`
    assert(data.length <= max, msg)

    if (len != null) {
      msg = `expecting ${name} to contain exactly ${len} elements`
      assert(data.length === len, msg)
    }

    return data.map((row, i) => {
      return validate(row, spec[0], options, `${name}[${i}]`)
    })
  }

  if (spec instanceof Dict) {
    const result = Object.create(null)
    assert(typeof data === 'object', `expecting ${name} to be an object`)

    for (const [key, value] of Object.entries(data)) {
      const newName = name ? `${name}.${key}` : key
      validate(key, spec.keys, options, newName)
      result[key] = validate(value, spec.values, options, newName)
    }
    return result
  }

  if (typeof spec === 'object') {
    const result = Object.create(null)
    assert(typeof data === 'object', `expecting ${name} to be an object`)

    for (let prop in spec) {
      const newName = name ? `${name}.${prop}` : prop
      const value = validate(data[prop], spec[prop], options, newName)

      if (value !== undefined) {
        result[prop] = value
      }
    }
    return result
  }

  throw new Error('Invalid description for ' + name)
}
